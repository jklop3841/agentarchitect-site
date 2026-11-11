import http from "node:http";
import type { AddressInfo } from "node:net";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { POST as toolPost } from "@/app/api/v1/tools/[tool]/route";
import { setAgentStore } from "@/lib/agents/store";
import { c2paSettingsJson, c2paValidatorName, validateC2pa } from "@/lib/tools/c2pa";
import { runClaimCheck } from "@/lib/tools/claimcheck";
import { readExif } from "@/lib/tools/exif";
import { inspectImage, readXmpFields } from "@/lib/tools/imageproof";
import { compareNumbers, extractNumbers, numbersMatch, numberTokens, parseZhNumeral } from "@/lib/tools/numbers";
import { isPublicAddress, safeFetchBytes, type SafeFetchOptions } from "@/lib/tools/safe-fetch";
import { setUsageSink } from "@/lib/tools/usage";
import type { ToolEnvelope } from "@/lib/tools/types";

import { freshIp, jsonRequest } from "./helpers/http";
import { buildJpeg } from "./helpers/images";
import { MemoryStore } from "./helpers/memory-store";

// Regression tests for the findings of the independent review (docs/04, section 5).
const fixture = (name: string) => new Uint8Array(readFileSync(fileURLToPath(new URL(`./fixtures/c2pa/${name}`, import.meta.url))));

function withXmpProvenance(jpeg: Uint8Array, url: string) {
  const packet = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dcterms="http://purl.org/dc/terms/" dcterms:provenance="${url}"/></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;
  const payload = Buffer.concat([Buffer.from("http://ns.adobe.com/xap/1.0/\0", "latin1"), Buffer.from(packet, "utf8")]);
  const header = Buffer.alloc(4);
  header[0] = 0xff;
  header[1] = 0xe1;
  header.writeUInt16BE(payload.length + 2, 2);
  return new Uint8Array(Buffer.concat([Buffer.from(jpeg.subarray(0, 2)), header, payload, Buffer.from(jpeg.subarray(2))]));
}

describe("review #1: the C2PA SDK must not make network requests", () => {
  let server: http.Server;
  let port = 0;
  const hits: string[] = [];
  beforeAll(async () => {
    server = http.createServer((request, response) => {
      hits.push(String(request.url));
      response.writeHead(404).end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = (server.address() as AddressInfo).port;
  });
  afterAll(() => new Promise<void>((resolve) => void server.close(() => resolve())));
  afterEach(() => {
    delete process.env.C2PA_TRUST_ANCHORS_PEM;
  });

  it("the SDK is installed and loads (it is a required dependency)", async () => {
    expect(await c2paValidatorName()).toBe("c2pa-node");
  });

  it("settings reach the native side as snake_case JSON with both fetch switches off", async () => {
    const sdk = (await import("@contentauth/c2pa-node")) as unknown as Parameters<typeof c2paSettingsJson>[0];
    const settings = JSON.parse(c2paSettingsJson(sdk));
    expect(settings.verify).toMatchObject({ remote_manifest_fetch: false, ocsp_fetch: false, verify_trust: true });
  });

  it("an image naming a remote manifest URL causes no request", async () => {
    const before = hits.length;
    const bytes = withXmpProvenance(fixture("adobe-20220124-A.jpg"), `http://127.0.0.1:${port}/remote-manifest`);
    const report = await validateC2pa(bytes, "image/jpeg");
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(hits.length).toBe(before);
    expect(report.status_codes).toContain("remoteManifest.notFetched");
    expect(report.state).not.toBe("trusted");
    const out = await inspectImage({ bytes, inputMode: "bytes", c2pa: report });
    expect(out.result.findings.map((finding) => finding.code)).toContain("content_credentials_remote_not_fetched");
    expect(JSON.stringify(out)).not.toContain(`127.0.0.1:${port}`);
  });

  it("the same image through the public API causes no request either", async () => {
    setAgentStore(new MemoryStore());
    setUsageSink(null);
    try {
      const before = hits.length;
      const bytes = withXmpProvenance(fixture("adobe-20220124-A.jpg"), `http://127.0.0.1:${port}/via-api`);
      const response = await toolPost(jsonRequest("/api/v1/tools/imageproof", { image: { content_base64: Buffer.from(bytes).toString("base64") } }), { params: Promise.resolve({ tool: "imageproof" }) });
      const envelope = (await response.json()) as ToolEnvelope<{ verdict: string }>;
      await new Promise((resolve) => setTimeout(resolve, 400));
      expect(envelope.status).toBe("ok");
      expect(hits.length).toBe(before);
    } finally {
      setAgentStore(undefined);
      setUsageSink(undefined);
    }
  });

  it("trust anchors are honoured: verified_origin is reachable, and only with anchors", async () => {
    const valid = fixture("adobe-20220124-C.jpg");
    const altered = fixture("adobe-20220124-E-dat-CA.jpg");
    expect((await validateC2pa(valid, "image/jpeg")).state).toBe("valid_untrusted_signer");

    process.env.C2PA_TRUST_ANCHORS_PEM = readFileSync(fileURLToPath(new URL("./fixtures/c2pa/c2pa-test-intermediate-ca.pem", import.meta.url)), "utf8");
    const trusted = await validateC2pa(valid, "image/jpeg");
    expect(trusted.state).toBe("trusted");
    expect((await inspectImage({ bytes: valid, inputMode: "bytes", c2pa: trusted })).result.verdict).toBe("verified_origin");
    // A trusted signer does not rescue an image whose pixels changed after signing.
    const broken = await validateC2pa(altered, "image/jpeg");
    expect(broken.state).toBe("invalid");
    expect((await inspectImage({ bytes: altered, inputMode: "bytes", c2pa: broken })).result.verdict).toBe("contradiction_found");

    // A URL is never accepted as a trust anchor source (the SDK would fetch it).
    process.env.C2PA_TRUST_ANCHORS_PEM = `http://127.0.0.1:${port}/anchors.pem`;
    const before = hits.length;
    expect((await validateC2pa(valid, "image/jpeg")).state).toBe("valid_untrusted_signer");
    expect(hits.length).toBe(before);
  });
});

describe("review #2: metadata parsing cannot be used to exhaust memory", () => {
  const le16 = (value: number) => [value & 255, (value >> 8) & 255];
  const le32 = (value: number) => [value & 255, (value >> 8) & 255, (value >> 16) & 255, (value >>> 24) & 255];
  // Many tags that all point at the same large array: tiny file, gigabytes when parsed naively.
  function tiffBomb(tags: number, size: number, firstTag = 0x9000, sameTag = false) {
    const bytes = new Uint8Array(size);
    bytes.set([0x49, 0x49, 0x2a, 0x00, ...le32(8), ...le16(tags)]);
    const dataAt = 10 + tags * 12 + 4;
    const count = Math.floor((size - dataAt) / 4) - 1;
    for (let index = 0; index < tags; index += 1) bytes.set([...le16(sameTag ? firstTag : firstTag + index), ...le16(4), ...le32(count), ...le32(dataAt)], 10 + index * 12);
    return bytes;
  }

  const timed = async (bytes: Uint8Array) => {
    const before = process.memoryUsage().rss;
    const started = performance.now();
    const out = await inspectImage({ bytes, inputMode: "bytes" });
    return { out, ms: performance.now() - started, grew: process.memoryUsage().rss - before };
  };

  it("a TIFF with 1,500 tags sharing one 2.8 MB array is read quickly and without large allocations", async () => {
    const { out, ms, grew } = await timed(tiffBomb(1500, 2_900_000));
    expect(ms).toBeLessThan(500);
    expect(grew).toBeLessThan(150_000_000);
    expect(out.result.findings.some((finding) => finding.level === "contradiction")).toBe(false);
  });

  it("the same trick with tags the reader does use, big-endian, or inside a JPEG, is also harmless", async () => {
    expect((await timed(tiffBomb(400, 2_900_000, 0x010f, true))).ms).toBeLessThan(500);
    const big = tiffBomb(1500, 2_900_000);
    big.set([0x4d, 0x4d, 0x00, 0x2a], 0);
    expect((await timed(big)).ms).toBeLessThan(500);
    const tiff = tiffBomb(600, 60_000, 0x010f, true);
    const payload = [...Buffer.from("Exif\0\0", "latin1"), ...tiff];
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, ((payload.length + 2) >> 8) & 255, (payload.length + 2) & 255, ...payload, 0xff, 0xd9]);
    expect((await timed(jpeg)).ms).toBeLessThan(500);
  });

  it("a decoy first entry with an unknown type does not open a slow path", async () => {
    const bomb = tiffBomb(1500, 2_900_000);
    bomb.set([0, 0, 0, 0], 10); // first entry: tag 0, type 0
    expect((await timed(bomb)).ms).toBeLessThan(500);
  });

  // Round 2 of the review: exifr looped forever on these 40-byte files (a zero-length box).
  it("40-byte HEIC and AVIF files with a zero-length box return promptly", async () => {
    const heic = new Uint8Array(Buffer.from("AAAAGGZ0eXBoZWljAAAAAG1pZjFoZWljAAAAAGZyZWUAAAAAAAAAAA==", "base64"));
    const avif = new Uint8Array(heic);
    avif.set(Buffer.from("avif", "latin1"), 8);
    for (const bytes of [heic, avif]) {
      expect(bytes.length).toBe(40);
      const result = await Promise.race([inspectImage({ bytes, inputMode: "bytes" }).then((out) => out.result.verdict), new Promise<string>((resolve) => setTimeout(() => resolve("HUNG"), 2000))]);
      expect(result).toBe("cannot_determine");
    }
  });

  it("honest files still parse, including a large TIFF with one big honest tag", async () => {
    const photo = buildJpeg({ exif: { make: "Canon", model: "EOS R6", captured: "2026:10:01 09:30:00", gps: { lat: [31, 13, 48], latRef: "N", lon: [121, 28, 12], lonRef: "E" } } });
    const out = await inspectImage({ bytes: photo, inputMode: "bytes" });
    expect(out.result.metadata.device.model).toBe("EOS R6");
    expect(out.result.metadata.gps?.latitude).toBeCloseTo(31.23, 2);
    expect(readExif(fixture("adobe-20220124-A.jpg")).ifd0).toMatchObject({ Make: "Canon", Model: "Canon EOS REBEL T3" });
    // 6 MB TIFF: Make + one 5 MB tag of layer data, as layered editor files carry.
    const size = 6_000_000;
    const tiff = new Uint8Array(size);
    tiff.set([0x49, 0x49, 0x2a, 0, 8, 0, 0, 0, 2, 0]);
    tiff.set([...le16(0x010f), ...le16(2), ...le32(6), ...le32(100)], 10);
    tiff.set([...le16(0x935c), ...le16(7), ...le32(5_000_000), ...le32(200)], 22);
    tiff.set(Buffer.from("Nikon\0", "latin1"), 100);
    const parsed = await inspectImage({ bytes: tiff, inputMode: "bytes" });
    expect(parsed.result.metadata.device.make).toBe("Nikon");
  });

  it("large garbage after a valid header stays fast", async () => {
    const garbage = new Uint8Array(2_900_000);
    for (let index = 0; index < garbage.length; index += 1) garbage[index] = (index * 131 + 7) & 255;
    garbage.set([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff, 0x45, 0x78, 0x69, 0x66, 0, 0, 0x49, 0x49, 0x2a, 0, 8, 0, 0, 0, 0xff, 0xff], 0);
    const started = performance.now();
    await expect(inspectImage({ bytes: garbage, inputMode: "bytes" })).resolves.toBeTruthy();
    expect(performance.now() - started).toBeLessThan(2000);
  });

  it("XMP fields are read with bounded patterns, and a huge packet stays fast", () => {
    const packet = (body: string) => new Uint8Array(Buffer.from(`junk<x:xmpmeta xmlns:x="adobe:ns:meta/">${body}</x:xmpmeta>`, "utf8"));
    const fields = readXmpFields(packet('<rdf:Description xmp:CreatorTool="Adobe Firefly" Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"><dc:description><rdf:Alt><rdf:li xml:lang="x-default">A &amp; B</rdf:li></rdf:Alt></dc:description></rdf:Description>'));
    expect(fields).toMatchObject({ CreatorTool: "Adobe Firefly", description: "A & B" });
    expect(String(fields.DigitalSourceType)).toMatch(/trainedAlgorithmicMedia/);
    const started = performance.now();
    readXmpFields(packet(`${"<dc:description><rdf:Alt>".repeat(60_000)}${'xmp:CreatorTool="'.repeat(60_000)}`));
    expect(performance.now() - started).toBeLessThan(1000);
    expect(readXmpFields(new Uint8Array(10))).toEqual({});
  });
});

describe("review #3: a caller over its own limit does not consume the shared daily ceiling", () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = new MemoryStore();
    setAgentStore(store);
    setUsageSink(null);
  });
  afterEach(() => {
    setAgentStore(undefined);
    setUsageSink(undefined);
    for (const key of Object.keys(process.env)) if (key.startsWith("TOOLS_")) delete process.env[key];
  });
  const call = async (body: unknown, ip: string) => {
    const response = await toolPost(jsonRequest("/api/v1/tools/fileproof", body, { "x-forwarded-for": ip }), { params: Promise.resolve({ tool: "fileproof" }) });
    return ((await response.json()) as ToolEnvelope<unknown>).error?.code ?? "ok";
  };
  const hash = { file: { sha256: "a".repeat(64) } };

  it("compute: 3 allowed + 9 denied for caller A leaves room for caller B", async () => {
    process.env.TOOLS_COMPUTE_PER_IP_PER_HOUR = "3";
    process.env.TOOLS_COMPUTE_GLOBAL_PER_DAY = "5";
    const a = freshIp();
    const results = [];
    for (let index = 0; index < 12; index += 1) results.push(await call(hash, a));
    expect(results.filter((code) => code === "ok")).toHaveLength(3);
    expect(results.filter((code) => code === "rate_limited")).toHaveLength(9);
    expect(await store.rateLimitPeek("tool_compute_global", "all", 86_400)).toBe(3);
    expect(await call(hash, freshIp())).toBe("ok");
    expect(await call(hash, freshIp())).toBe("ok");
    expect(await call(hash, freshIp())).toBe("quota_exceeded");
  });

  it("URL fetches: denied attempts do not count globally", async () => {
    process.env.TOOLS_REMOTE_PER_IP_PER_HOUR = "2";
    process.env.TOOLS_REMOTE_GLOBAL_PER_DAY = "4";
    const a = freshIp();
    for (let index = 0; index < 8; index += 1) await call({ file: { url: "http://10.0.0.1/x" } }, a);
    expect(await store.rateLimitPeek("tool_remote_fetch_global", "all", 86_400)).toBe(2);
    expect(await call({ file: { url: "http://10.0.0.1/x" } }, freshIp())).toBe("url_not_allowed");
  });
});

describe("review #4: the outbound fetch always settles", () => {
  let server: http.Server;
  let port = 0;
  beforeAll(async () => {
    server = http.createServer((request, response) => {
      if (request.url === "/bad-redirect") return void response.writeHead(302, { location: "http://[bad" }).end();
      if (request.url === "/continue-then-close") {
        response.writeProcessing();
        return void request.socket.destroy();
      }
      response.writeHead(200).end("ok");
    });
    // Answer protocol-switch requests the way a WebSocket endpoint would.
    server.on("upgrade", (_request, socket) => {
      socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n");
    });
    server.on("connection", (socket) => {
      socket.on("data", (chunk) => {
        if (chunk.toString("latin1").startsWith("GET /raw-101")) socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: foo\r\nConnection: Upgrade\r\n\r\n");
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = (server.address() as AddressInfo).port;
  });
  afterAll(() => {
    server.closeAllConnections();
    return new Promise<void>((resolve) => void server.close(() => resolve()));
  });
  const options = (extra: Partial<SafeFetchOptions> = {}): SafeFetchOptions => ({
    maxBytes: 1000,
    timeoutMs: 1500,
    resolver: async () => ["127.0.0.1"],
    isAllowedAddress: (address) => address === "127.0.0.1",
    allowedPorts: [port],
    ...extra,
  });
  const settle = async (promise: Promise<unknown>) => {
    const started = Date.now();
    const outcome = await Promise.race([promise.then(() => "resolved", (error: { code?: string }) => error.code ?? "rejected"), new Promise<string>((resolve) => setTimeout(() => resolve("STILL PENDING"), 4000))]);
    return { outcome, ms: Date.now() - started };
  };

  it("a 101 Switching Protocols answer ends in an error, not a hang", async () => {
    const { outcome, ms } = await settle(safeFetchBytes(`http://files.example.org:${port}/raw-101`, options()));
    expect(["fetch_failed", "fetch_timeout"]).toContain(outcome);
    expect(ms).toBeLessThan(2500);
  });
  it("a connection closed after an informational response ends in an error", async () => {
    const { outcome } = await settle(safeFetchBytes(`http://files.example.org:${port}/continue-then-close`, options()));
    expect(["fetch_failed", "fetch_timeout"]).toContain(outcome);
  });
  it("a resolver that never answers is cut off by the deadline", async () => {
    const { outcome, ms } = await settle(safeFetchBytes(`http://files.example.org:${port}/ok`, options({ timeoutMs: 300, resolver: () => new Promise<string[]>(() => undefined) })));
    expect(outcome).toBe("fetch_timeout");
    expect(ms).toBeLessThan(1200);
  });
  it("a malformed redirect target is a fetch error, not an internal error", async () => {
    await expect(safeFetchBytes(`http://files.example.org:${port}/bad-redirect`, options())).rejects.toMatchObject({ code: "fetch_failed" });
  });
  it("IPv6 outside global unicast is never public", () => {
    for (const address of ["::7f00:1", "::127.0.0.1", "fec0::1", "3fff::1", "5f00::1", "::a00:1", "1::1", "4000::1", "e000::1"]) expect(isPublicAddress(address), address).toBe(false);
    for (const address of ["2606:4700:4700::1111", "2a00:1450:4001::200e", "2400:3200::1"]) expect(isPublicAddress(address), address).toBe(true);
  });
});

describe("review #5: ClaimCheck work is bounded by the evidence size", () => {
  it("60 long claims against 10 maximum-size, heavily fragmented evidence items stays fast", () => {
    const claim = "该工厂在二零二五年第三季度的总产量达到了四十万吨并且出口到了十二个国家和地区";
    const text = Array.from({ length: 60 }, (_, index) => `${claim}${index}。`).join("");
    const evidence = Array.from({ length: 10 }, (_, index) => ({ id: `E${index}`, text: "产量。出口。国家。".repeat(880).slice(0, 8000) }));
    const started = performance.now();
    const out = runClaimCheck({ text, evidence });
    expect(performance.now() - started).toBeLessThan(1500);
    expect(out.result.claims.length).toBeGreaterThan(0);
    expect(out.limitations.join(" ")).toMatch(/Only the first 200 sentences/);
  });
});

describe("review #6: no claim is supported unless every figure really matches", () => {
  const verdict = (claim: string, evidence: string) => runClaimCheck({ text: claim, evidence: [{ text: evidence }] }).result.claims[0]?.verdict;

  it("figures late in a long sentence are still compared", () => {
    const filler = "according to the consolidated annual statement filed with the regulator and reviewed by the audit committee ".repeat(6);
    expect(verdict(`The group reported that ${filler}revenue reached 5 million dollars.`, `The group reported that ${filler}revenue reached 9 million dollars.`)).toBe("contradicted");
  });
  it("sign, magnitude words, Chinese numerals and number words are parsed, not ignored", () => {
    expect(verdict("The balance changed by -5 percent in March.", "The balance changed by 5 percent in March.")).not.toBe("supported");
    expect(verdict("公司去年营收为三亿美元。", "公司去年营收为五亿美元。")).toBe("contradicted");
    expect(verdict("公司去年营收为三亿美元。", "公司去年营收为3亿美元。")).toBe("supported");
    expect(verdict("The team hired five engineers in March.", "The team hired nine engineers in March.")).toBe("contradicted");
    expect(verdict("The team hired five engineers in March.", "The team hired 5 engineers in March.")).toBe("supported");
    expect(verdict("The fund holds two hundred fifty properties today.", "The fund holds 250 properties today.")).toBe("supported");
  });
  it("long numbers differing in the last digit are different numbers", () => {
    expect(verdict("The account number on the invoice is 1234567890123.", "The account number on the invoice is 1234567890124.")).toBe("contradicted");
    expect(numbersMatch("1234567890123", "1234567890124")).toBe(false);
  });
  it("units matter: the same number with a different unit is a conflict", () => {
    expect(verdict("The shipment weighed 5 kg on arrival.", "The shipment weighed 5 tonnes on arrival.")).toBe("contradicted");
    expect(verdict("The shipment weighed 5 kg on arrival.", "The shipment weighed 5 kilograms on arrival.")).toBe("supported");
    expect(numbersMatch("5 kg", "5 tonne")).toBe(false);
    expect(numbersMatch("5 kg", "5")).toBe(true);
    expect(numbersMatch("30%", "30")).toBe(false);
  });
  it("figures swapped between two subjects are not support", () => {
    expect(verdict("Plant A produced 40 units and plant B produced 90 units.", "Plant A produced 90 units and plant B produced 40 units.")).not.toBe("supported");
    expect(verdict("Plant A produced 40 units and plant B produced 90 units.", "Plant A produced 40 units and plant B produced 90 units.")).toBe("supported");
    // a year moving around the sentence is not a swap of like figures
    expect(compareNumbers(numberTokens("In 2025 the plant produced 40 tonnes."), numberTokens("The plant produced 40 tonnes in 2025.")).reordered).toBe(false);
  });
  it("round 2: full-width digits, vague figures, qualifiers, number words and corrections", () => {
    expect(verdict("公司去年营收为５亿元。", "公司去年营收为９亿元。")).toBe("contradicted");
    expect(verdict("公司去年营收为５亿元。", "公司去年营收为5亿元。")).toBe("supported");
    expect(verdict("该市人口有十几万。", "该市人口有几十万。")).not.toBe("supported");
    expect(verdict("The club has a dozen members.", "The club has a hundred members.")).toBe("contradicted");
    expect(verdict("The site recorded over 500 visitors on Monday.", "The site recorded under 500 visitors on Monday.")).not.toBe("supported");
    expect(verdict("The site recorded over 500 visitors on Monday.", "The site recorded over 500 visitors on Monday.")).toBe("supported");
    expect(verdict("Revenue for the year was 5 million dollars.", "Revenue for the year was 5 million dollars. Correction: revenue for the year was 9 million dollars.")).toBe("inconclusive");
  });

  it("number extraction basics", () => {
    expect(extractNumbers("1,200 people")).toEqual(["1200"]);
    expect(extractNumbers("$5m in funding and 3K users")).toEqual(["5000000 usd", "3000"]);
    expect(extractNumbers("a range of 5-10 items")).toEqual(["5", "10"]);
    expect(extractNumbers("temperature fell to -5 degrees")).toEqual(["-5"]);
    expect(extractNumbers("no one knows; it is one of many")).toEqual([]);
    expect(parseZhNumeral("三亿五千万")).toBe(350_000_000);
    expect(parseZhNumeral("一千二百")).toBe(1200);
    expect(parseZhNumeral("十五")).toBe(15);
    expect(extractNumbers("统一安排，一起行动")).toEqual([]);
  });
});

describe("review (low): device statements in different scripts are not called contradictions", () => {
  it("a Chinese brand name against a Latin Make/Model is a clue to compare by eye", async () => {
    const bytes = buildJpeg({ exif: { make: "Canon", model: "EOS R6", captured: "2026:10:01 09:30:00" } });
    const out = await inspectImage({ bytes, inputMode: "bytes", claimed: { device: "佳能" } });
    expect(out.result.verdict).not.toBe("contradiction_found");
    expect(out.result.findings.map((finding) => finding.code)).toContain("claimed_device_not_comparable");
    const latin = await inspectImage({ bytes, inputMode: "bytes", claimed: { device: "iPhone 15" } });
    expect(latin.result.verdict).toBe("contradiction_found");
  });
});
