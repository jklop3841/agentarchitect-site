import http from "node:http";
import type { AddressInfo } from "node:net";
import { gzipSync } from "node:zlib";

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { isPublicAddress, safeFetchBytes, type SafeFetchOptions } from "@/lib/tools/safe-fetch";

const base: SafeFetchOptions = { maxBytes: 1000, timeoutMs: 2000 };
const refused = (url: string, options: Partial<SafeFetchOptions> = {}) => expect(safeFetchBytes(url, { ...base, ...options })).rejects.toMatchObject({ code: "url_not_allowed" });

describe("address classification", () => {
  it("blocks loopback, private, link-local, CGNAT, metadata, multicast and reserved ranges", () => {
    for (const address of [
      "127.0.0.1", "127.255.255.254", "10.0.0.1", "10.255.255.255", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1", "100.127.255.255",
      "0.0.0.0", "198.18.0.1", "192.0.2.5", "198.51.100.7", "203.0.113.9", "224.0.0.1", "240.0.0.1", "255.255.255.255",
      "::1", "::", "fc00::1", "fd12:3456::1", "fe80::1", "ff02::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1", "64:ff9b::7f00:1", "2001:db8::1", "2002:7f00:1::1", "2001::1",
    ]) {
      expect(isPublicAddress(address), address).toBe(false);
    }
  });
  it("allows ordinary public addresses", () => {
    for (const address of ["8.8.8.8", "1.1.1.1", "93.184.216.34", "172.15.0.1", "172.32.0.1", "100.63.255.255", "2606:4700:4700::1111", "2a00:1450:4001::200e"]) {
      expect(isPublicAddress(address), address).toBe(true);
    }
  });
  it("treats anything that is not an IP as not public", () => {
    expect(isPublicAddress("localhost")).toBe(false);
    expect(isPublicAddress("")).toBe(false);
  });
});

describe("URL validation (nothing is fetched)", () => {
  it("refuses non-http schemes, credentials and non-default ports", async () => {
    await refused("file:///etc/passwd");
    await refused("ftp://example.org/a");
    await refused("gopher://example.org/");
    await refused("javascript:alert(1)");
    await refused("data:text/plain,hi");
    await refused("https://user:pass@example.org/a");
    await refused("http://example.org:8080/a");
    await refused("http://example.org:22/");
    await refused("not a url");
    await refused(`https://example.org/${"a".repeat(2100)}`);
  });
  it("refuses internal host names", async () => {
    for (const url of ["http://localhost/", "http://LOCALHOST./", "http://intranet/", "http://db.internal/", "http://printer.local/", "http://metadata.google.internal/computeMetadata/v1/", "http://service.corp/", "http://x.home.arpa/"]) {
      await refused(url);
    }
  });
  it("refuses private and reserved IP literals in every spelling", async () => {
    for (const url of [
      "http://127.0.0.1/", "http://127.1/", "http://2130706433/", "http://0x7f000001/", "http://0177.0.0.1/", "http://0/", "http://10.0.0.5/admin", "http://192.168.0.1/",
      "http://169.254.169.254/latest/meta-data/iam/security-credentials/", "http://100.100.100.200/latest/meta-data/",
      "http://[::1]/", "http://[::ffff:127.0.0.1]/", "http://[::ffff:7f00:1]/", "http://[fd00::1]/", "http://[fe80::1]/", "http://[64:ff9b::a00:1]/",
    ]) {
      await refused(url);
    }
  });
  it("refuses a host when any resolved address is private (DNS rebinding setup)", async () => {
    await refused("http://rebind.example.org/", { resolver: async () => ["93.184.216.34", "10.0.0.5"] });
    await refused("http://rebind.example.org/", { resolver: async () => ["169.254.169.254"] });
    await refused("http://rebind.example.org/", { resolver: async () => ["::ffff:192.168.1.1"] });
  });
  it("reports unresolvable hosts as fetch_failed", async () => {
    await expect(safeFetchBytes("http://nope.example.org/", { ...base, resolver: async () => [] })).rejects.toMatchObject({ code: "fetch_failed" });
    await expect(
      safeFetchBytes("http://nope.example.org/", {
        ...base,
        resolver: async () => {
          throw new Error("ENOTFOUND");
        },
      }),
    ).rejects.toMatchObject({ code: "fetch_failed" });
  });

  const saved = process.env.TOOLS_FETCH_DENY_HOSTS;
  afterEach(() => {
    if (saved === undefined) delete process.env.TOOLS_FETCH_DENY_HOSTS;
    else process.env.TOOLS_FETCH_DENY_HOSTS = saved;
  });
  it("honours the operator deny list for hosts that resolve to public addresses", async () => {
    process.env.TOOLS_FETCH_DENY_HOSTS = "ops.example.net, *.private-zone.example";
    const resolver = async () => ["93.184.216.34"];
    await refused("https://ops.example.net/", { resolver });
    await refused("https://panel.ops.example.net/login", { resolver });
    await refused("https://a.private-zone.example/", { resolver });
  });
});

// A local server stands in for "the internet". Tests reach it through the injection points
// (resolver / isAllowedAddress / allowedPorts); the production defaults would refuse 127.0.0.1.
describe("fetch behaviour", () => {
  let server: http.Server;
  let port = 0;
  let lastHost = "";
  let lastHeaders: http.IncomingHttpHeaders = {};

  beforeAll(async () => {
    server = http.createServer((request, response) => {
      lastHost = request.headers.host ?? "";
      lastHeaders = request.headers;
      const path = request.url ?? "/";
      if (path === "/ok") return void response.writeHead(200, { "content-type": "image/png; charset=binary", "content-length": "5" }).end("hello");
      if (path === "/big-declared") return void response.writeHead(200, { "content-length": "5000" }).end("x".repeat(5000));
      if (path === "/big-stream") {
        response.writeHead(200, { "transfer-encoding": "chunked" });
        const timer = setInterval(() => response.write("y".repeat(400)), 5);
        response.on("close", () => clearInterval(timer));
        return;
      }
      if (path === "/gzip") return void response.writeHead(200, { "content-encoding": "gzip" }).end(gzipSync("z".repeat(100_000)));
      if (path === "/missing") return void response.writeHead(404).end("no");
      if (path === "/hang") return;
      if (path === "/to-metadata") return void response.writeHead(302, { location: "http://169.254.169.254/latest/meta-data/" }).end();
      if (path === "/to-localhost") return void response.writeHead(301, { location: "http://localhost/secret" }).end();
      if (path === "/to-file") return void response.writeHead(302, { location: "file:///etc/passwd" }).end();
      if (path === "/to-ok") return void response.writeHead(302, { location: "/ok" }).end();
      if (path === "/loop") return void response.writeHead(302, { location: "/loop" }).end();
      response.writeHead(200).end("root");
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = (server.address() as AddressInfo).port;
  });
  afterAll(() => new Promise<void>((resolve) => void server.close(() => resolve())));

  const options = (): SafeFetchOptions => ({
    ...base,
    resolver: async (hostname) => (hostname === "files.example.org" ? ["127.0.0.1"] : ["93.184.216.34"]),
    isAllowedAddress: (address) => address === "127.0.0.1",
    allowedPorts: [port, 80],
  });
  const url = (path: string) => `http://files.example.org:${port}${path}`;

  it("downloads a small file, connecting to the validated address with the original Host", async () => {
    const result = await safeFetchBytes(url("/ok"), options());
    expect(Buffer.from(result.bytes).toString()).toBe("hello");
    expect(result.contentType).toBe("image/png");
    expect(lastHost).toBe(`files.example.org:${port}`);
    expect(lastHeaders["accept-encoding"]).toBe("identity");
    expect(lastHeaders.cookie).toBeUndefined();
    expect(lastHeaders.authorization).toBeUndefined();
  });
  it("stops at the size cap, declared or not", async () => {
    await expect(safeFetchBytes(url("/big-declared"), options())).rejects.toMatchObject({ code: "payload_too_large" });
    await expect(safeFetchBytes(url("/big-stream"), options())).rejects.toMatchObject({ code: "payload_too_large" });
  });
  it("refuses compressed bodies and non-200 answers", async () => {
    await expect(safeFetchBytes(url("/gzip"), { ...options(), maxBytes: 1_000_000 })).rejects.toMatchObject({ code: "fetch_failed" });
    await expect(safeFetchBytes(url("/missing"), options())).rejects.toMatchObject({ code: "fetch_failed", details: { http_status: 404 } });
  });
  it("times out on a server that never answers", async () => {
    const started = Date.now();
    await expect(safeFetchBytes(url("/hang"), { ...options(), timeoutMs: 300 })).rejects.toMatchObject({ code: "fetch_timeout" });
    expect(Date.now() - started).toBeLessThan(1500);
  });
  it("re-validates every redirect hop", async () => {
    await expect(safeFetchBytes(url("/to-metadata"), options())).rejects.toMatchObject({ code: "url_not_allowed" });
    await expect(safeFetchBytes(url("/to-localhost"), options())).rejects.toMatchObject({ code: "url_not_allowed" });
    await expect(safeFetchBytes(url("/to-file"), options())).rejects.toMatchObject({ code: "url_not_allowed" });
    await expect(safeFetchBytes(url("/loop"), options())).rejects.toMatchObject({ code: "fetch_failed" });
    const followed = await safeFetchBytes(url("/to-ok"), options());
    expect(followed.redirects).toBe(1);
    expect(Buffer.from(followed.bytes).toString()).toBe("hello");
  });
  it("with production defaults the same local server is unreachable", async () => {
    await expect(safeFetchBytes(`http://127.0.0.1:${port}/ok`, base)).rejects.toMatchObject({ code: "url_not_allowed" });
    await expect(safeFetchBytes(`http://127.0.0.1/ok`, base)).rejects.toMatchObject({ code: "url_not_allowed" });
    await expect(safeFetchBytes(url("/ok"), { ...base, resolver: async () => ["127.0.0.1"], allowedPorts: [port] })).rejects.toMatchObject({ code: "url_not_allowed" });
  });
});
