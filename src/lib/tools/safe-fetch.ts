import "server-only";

import { lookup } from "node:dns/promises";
import http, { type IncomingMessage } from "node:http";
import https from "node:https";
import { BlockList, isIP } from "node:net";

import { ToolError } from "@/lib/tools/types";

// Outbound fetch for user-supplied URLs, built to refuse anything that is not a plain public
// web resource:
//   * http/https only, default ports only, no credentials in the URL
//   * the host is resolved once, every resolved address must be public, and the connection is
//     made to that exact address (no second lookup, so DNS rebinding has nothing to race)
//   * redirects are followed by hand and every hop is validated again
//   * the body is streamed with a hard byte cap and an overall deadline
//   * no cookies, no auth, no compressed bodies (decompression bombs)

const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 127], // :: and ::1
  ["64:ff9b::", 96], // NAT64
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["2001::", 23], // IETF protocol assignments incl. Teredo
  ["2001:db8::", 32],
  ["2002::", 16], // 6to4
  ["3fff::", 20], // documentation
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link local
  ["ff00::", 8], // multicast
] as const) {
  blocked.addSubnet(network, prefix, "ipv6");
}

// Global unicast IPv6 is 2000::/3. Everything outside it (loopback, IPv4-compatible,
// site-local, unassigned ranges) is refused without having to enumerate it.
const globalUnicastV6 = new BlockList();
globalUnicastV6.addSubnet("2000::", 3, "ipv6");

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  if (family === 6) {
    // IPv4-mapped IPv6 (::ffff:a.b.c.d) is refused outright. It cannot go in the BlockList:
    // Node matches plain IPv4 addresses against a ::ffff:0:0/96 rule, which would block everything.
    if (/^(0*:)*:?ffff:/i.test(address) || /^::ffff:/i.test(address)) return false;
    return globalUnicastV6.check(address, "ipv6") && !blocked.check(address, "ipv6");
  }
  return false;
}

const blockedSuffixes = [".local", ".localhost", ".internal", ".intranet", ".lan", ".home", ".corp", ".home.arpa", ".onion", ".test", ".invalid"];

// Operator-supplied deny list (comma-separated host suffixes), e.g. private infrastructure
// domains that resolve to public addresses and therefore pass the address check.
function deniedSuffixes(extra: string[] = []) {
  const fromEnv = (process.env.TOOLS_FETCH_DENY_HOSTS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase().replace(/^\*?\./, ""))
    .filter(Boolean);
  return [...fromEnv, ...extra.map((value) => value.toLowerCase())];
}

export type SafeFetchOptions = {
  maxBytes: number;
  timeoutMs: number;
  maxRedirects?: number;
  // Injection points for tests. Production callers never set these.
  resolver?: (hostname: string) => Promise<string[]>;
  isAllowedAddress?: (address: string) => boolean;
  allowedPorts?: number[];
  denyHostSuffixes?: string[];
};

export type SafeFetchResult = { bytes: Uint8Array; contentType: string | null; finalUrl: string; redirects: number };

function parseTarget(rawUrl: string, options: SafeFetchOptions) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ToolError("url_not_allowed", "The URL is not valid.");
  }
  if (rawUrl.length > 2048) throw new ToolError("url_not_allowed", "The URL is too long (max 2048 characters).");
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new ToolError("url_not_allowed", "Only http and https URLs are allowed.");
  if (url.username || url.password) throw new ToolError("url_not_allowed", "URLs with embedded credentials are not allowed.");
  const defaultPort = url.protocol === "https:" ? 443 : 80;
  const port = url.port ? Number(url.port) : defaultPort;
  const allowedPorts = options.allowedPorts ?? [80, 443];
  if (!allowedPorts.includes(port)) throw new ToolError("url_not_allowed", "Only the default ports (80, 443) are allowed.");
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!hostname) throw new ToolError("url_not_allowed", "The URL has no host.");
  const literal = isIP(hostname) !== 0;
  if (!literal) {
    if (!hostname.includes(".") || blockedSuffixes.some((suffix) => hostname.endsWith(suffix)) || hostname === "localhost") {
      throw new ToolError("url_not_allowed", "This host name is not a public internet host.");
    }
    if (deniedSuffixes(options.denyHostSuffixes).some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`))) {
      throw new ToolError("url_not_allowed", "This host is not allowed.");
    }
  }
  return { url, hostname, port, literal };
}

async function resolvePublic(hostname: string, literal: boolean, options: SafeFetchOptions): Promise<string> {
  const allowed = options.isAllowedAddress ?? isPublicAddress;
  let addresses: string[];
  if (literal) {
    addresses = [hostname];
  } else {
    try {
      addresses = options.resolver ? await options.resolver(hostname) : (await lookup(hostname, { all: true, verbatim: true })).map((entry) => entry.address);
    } catch {
      throw new ToolError("fetch_failed", "The host name could not be resolved.");
    }
  }
  if (addresses.length === 0) throw new ToolError("fetch_failed", "The host name could not be resolved.");
  // Every address must be public: a mixed answer is how rebinding attacks start.
  if (!addresses.every((address) => allowed(address))) {
    throw new ToolError("url_not_allowed", "The URL points to a private, loopback or reserved address.");
  }
  return addresses.find((address) => isIP(address) === 4) ?? addresses[0];
}

function requestOnce(url: URL, hostname: string, port: number, address: string, maxBytes: number, deadline: number): Promise<{ status: number; headers: IncomingMessage["headers"]; bytes: Uint8Array }> {
  return new Promise((resolveOuter, rejectOuter) => {
    // Settle exactly once, and always: every exit path below goes through these two.
    let settled = false;
    const resolve = (value: { status: number; headers: IncomingMessage["headers"]; bytes: Uint8Array }) => {
      if (!settled) {
        settled = true;
        resolveOuter(value);
      }
    };
    const reject = (error: ToolError) => {
      if (!settled) {
        settled = true;
        rejectOuter(error);
      }
    };
    const remaining = deadline - Date.now();
    if (remaining <= 0) return reject(new ToolError("fetch_timeout", "The download did not finish in time."));
    const secure = url.protocol === "https:";
    const request = (secure ? https : http).request(
      {
        host: address,
        port,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        servername: secure ? hostname : undefined,
        headers: {
          Host: url.port ? `${hostname}:${port}` : hostname,
          "User-Agent": "AgentArchitect-Tools/1.0 (+https://www.agentarchitect.me/tools)",
          Accept: "*/*",
          "Accept-Encoding": "identity",
        },
        agent: false,
        timeout: remaining,
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          response.resume();
          return resolve({ status, headers: response.headers, bytes: new Uint8Array() });
        }
        if (status !== 200) {
          response.destroy();
          return reject(new ToolError("fetch_failed", `The server answered with HTTP ${status}.`, { http_status: status }));
        }
        const encoding = String(response.headers["content-encoding"] ?? "identity").toLowerCase();
        if (encoding !== "identity" && encoding !== "") {
          response.destroy();
          return reject(new ToolError("fetch_failed", "The server sent a compressed body, which is not accepted."));
        }
        const declared = Number(response.headers["content-length"]);
        if (Number.isFinite(declared) && declared > maxBytes) {
          response.destroy();
          return reject(new ToolError("payload_too_large", `The remote file is larger than ${maxBytes} bytes.`, { max_bytes: maxBytes }));
        }
        const chunks: Buffer[] = [];
        let total = 0;
        response.on("data", (chunk: Buffer) => {
          total += chunk.length;
          if (total > maxBytes) {
            response.destroy();
            request.destroy();
            reject(new ToolError("payload_too_large", `The remote file is larger than ${maxBytes} bytes.`, { max_bytes: maxBytes }));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => resolve({ status, headers: response.headers, bytes: new Uint8Array(Buffer.concat(chunks)) }));
        response.on("error", () => reject(new ToolError("fetch_failed", "The download was interrupted.")));
      },
    );
    const timer = setTimeout(() => {
      request.destroy();
      reject(new ToolError("fetch_timeout", "The download did not finish in time."));
    }, remaining);
    request.on("timeout", () => {
      request.destroy();
      reject(new ToolError("fetch_timeout", "The download did not finish in time."));
    });
    request.on("error", () => reject(new ToolError("fetch_failed", "Could not connect to the host.")));
    // Protocol switches (101) and CONNECT answers are not downloads.
    request.on("upgrade", (_response, socket) => {
      socket.destroy();
      reject(new ToolError("fetch_failed", "The server tried to switch protocols."));
    });
    // A connection that closes without a response (or after an informational one) must not
    // leave the caller waiting forever.
    request.on("close", () => {
      clearTimeout(timer);
      reject(new ToolError("fetch_failed", "The connection closed before a response was received."));
    });
    request.end();
  });
}

// The deadline covers everything, DNS resolution included: a resolver that never answers
// must not hold the request open.
export function safeFetchBytes(rawUrl: string, options: SafeFetchOptions): Promise<SafeFetchResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new ToolError("fetch_timeout", "The download did not finish in time.")), options.timeoutMs);
  });
  return Promise.race([fetchWithinDeadline(rawUrl, options), timeout]).finally(() => clearTimeout(timer));
}

async function fetchWithinDeadline(rawUrl: string, options: SafeFetchOptions): Promise<SafeFetchResult> {
  const deadline = Date.now() + options.timeoutMs;
  const maxRedirects = options.maxRedirects ?? 3;
  let current = rawUrl;
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const { url, hostname, port, literal } = parseTarget(current, options);
    const address = await resolvePublic(hostname, literal, options);
    const response = await requestOnce(url, hostname, port, address, options.maxBytes, deadline);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (!location) throw new ToolError("fetch_failed", "The server redirected without a Location header.");
      try {
        current = new URL(location, url).toString();
      } catch {
        throw new ToolError("fetch_failed", "The server redirected to a malformed URL.");
      }
      continue;
    }
    const contentType = typeof response.headers["content-type"] === "string" ? response.headers["content-type"].split(";")[0].trim().toLowerCase().slice(0, 100) : null;
    return { bytes: response.bytes, contentType, finalUrl: url.origin + url.pathname, redirects: hop };
  }
  throw new ToolError("fetch_failed", `Too many redirects (max ${maxRedirects}).`);
}
