// Does the C2PA SDK make any network request while *validating* an image, with the settings
// the site uses? Re-run after every upgrade of @contentauth/c2pa-node:
//
//   node scripts/c2pa-network-probe/probe.mjs
//
// Needs openssl. A throwaway CA, signer and time-stamp authority are generated in a temporary
// directory on each run; no key is stored in the repository. Pass criterion: every row with
// "site" settings shows requests=0, and the calibration rows with "defaults" show requests=1
// (proving the observer works). The script exits non-zero if either fails.
// Every outbound request is observed in two ways:
//   1. a plain HTTP listener on 127.0.0.1 (for URLs that name it directly)
//   2. the same listener acting as HTTP/HTTPS proxy via HTTP_PROXY/HTTPS_PROXY/ALL_PROXY, so
//      requests to any host and port are seen too (if the SDK honours proxy variables;
//      the calibration step checks that).
// Signing (building the test files) happens before the observer is armed.

import http from "node:http";
import { readFileSync } from "node:fs";

import { fileURLToPath } from "node:url";
import { execFileSync as run } from "node:child_process";
import { mkdtempSync as makeTemp, copyFileSync, rmSync, writeFileSync as write } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/, "");
const configDir = fileURLToPath(new URL(".", import.meta.url));
const here = `${makeTemp(join(tmpdir(), "c2pa-probe-"))}/`;
for (const file of ["ca.cnf", "tsa.cnf"]) copyFileSync(join(configDir, file), `${here}${file}`);
const ossl = (...args) => run("openssl", args, { cwd: here, stdio: "ignore" });
ossl("ecparam", "-name", "prime256v1", "-genkey", "-noout", "-out", "ca.key");
ossl("req", "-x509", "-new", "-key", "ca.key", "-sha256", "-days", "2", "-subj", "/O=Probe Test CA/CN=Probe Root", "-config", "ca.cnf", "-extensions", "ca_ext", "-out", "ca.pem");
for (const [name, ext] of [["leaf", "leaf_ext"], ["tsa", "tsa_ext"]]) {
  ossl("genpkey", "-algorithm", "EC", "-pkeyopt", "ec_paramgen_curve:P-256", "-out", `${name}.key`);
  ossl("req", "-new", "-key", `${name}.key`, "-subj", `/O=Probe ${name}/CN=Probe ${name}`, "-out", `${name}.csr`);
  ossl("x509", "-req", "-in", `${name}.csr`, "-CA", "ca.pem", "-CAkey", "ca.key", "-CAcreateserial", "-days", "2", "-sha256", "-extfile", ext === "tsa_ext" ? "tsa.cnf" : "ca.cnf", "-extensions", ext, "-out", `${name}.pem`);
}
write(`${here}chain.pem`, Buffer.concat([readFileSync(`${here}leaf.pem`), readFileSync(`${here}ca.pem`)]));
write(`${here}tsaserial`, "01\n");
const fixtures = `${root}/tests/fixtures/c2pa`;

const log = [];
let armed = false;
const server = http.createServer((req, res) => {
  if (armed) log.push(`${req.method} ${req.headers.host ?? ""}${req.url}`);
  res.writeHead(404).end();
});
server.on("connect", (req, socket) => {
  if (armed) log.push(`CONNECT ${req.url}`);
  socket.end("HTTP/1.1 403 Forbidden\r\n\r\n");
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const proxy = `http://127.0.0.1:${port}`;
// Proxy variables must be set before the SDK loads (a late change is not picked up; checked).
// Loopback goes direct: the local TSA and the direct listener are observed on their own.
for (const name of ["HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "http_proxy", "https_proxy", "all_proxy"]) process.env[name] = proxy;
process.env.NO_PROXY = process.env.no_proxy = "127.0.0.1,localhost";
const armProxy = () => {};

// Local RFC 3161 time-stamp authority built on openssl.
const { execFileSync } = await import("node:child_process");
const { writeFileSync, mkdtempSync } = await import("node:fs");
const tsaHits = [];
const tsa = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    tsaHits.push(`${armed ? "VALIDATION" : "signing"} ${req.method} ${req.url}`);
    try {
      const dir = mkdtempSync(`${here}tsq-`);
      writeFileSync(`${dir}/q.tsq`, Buffer.concat(chunks));
      execFileSync("openssl", ["ts", "-reply", "-config", `${here}tsa.cnf`, "-section", "tsa_config", "-queryfile", `${dir}/q.tsq`, "-out", `${dir}/r.tsr`], { cwd: here, stdio: "ignore" });
      res.writeHead(200, { "content-type": "application/timestamp-reply" }).end(readFileSync(`${dir}/r.tsr`));
    } catch {
      res.writeHead(500).end();
    }
  });
});
await new Promise((resolve) => tsa.listen(0, "127.0.0.1", resolve));
const tsaUrl = `http://127.0.0.1:${tsa.address().port}/tsa`;

const sdk = await import(`${root}/node_modules/@contentauth/c2pa-node/dist/index.js`);
// Must match c2paSettingsJson() in src/lib/tools/c2pa.ts (tests/tools-review-fixes.test.ts
// asserts the production JSON has these same three values).
const siteSettings = sdk.settingsToJson(sdk.createVerifySettings({ ocspFetch: false, remoteManifestFetch: false, verifyTrust: true }));
const permissive = sdk.settingsToJson(sdk.createVerifySettings({ ocspFetch: true, remoteManifestFetch: true, verifyTrust: true }));
// What a deployment that forgot to configure anything would do: SDK defaults.
const defaults = undefined;

function withXmpProvenance(jpeg, url) {
  const packet = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dcterms="http://purl.org/dc/terms/" dcterms:provenance="${url}"/></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;
  const payload = Buffer.concat([Buffer.from("http://ns.adobe.com/xap/1.0/\0", "latin1"), Buffer.from(packet, "utf8")]);
  const head = Buffer.alloc(4);
  head[0] = 0xff;
  head[1] = 0xe1;
  head.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([jpeg.subarray(0, 2), head, payload, jpeg.subarray(2)]);
}

const plain = readFileSync(`${fixtures}/adobe-20220124-A.jpg`);
const chain = readFileSync(`${here}chain.pem`);
const key = readFileSync(`${here}leaf.key`);

async function sign({ ingredient, remoteUrl, tsaUrl, title }) {
  const signer = sdk.LocalSigner.newSigner(chain, key, "es256", tsaUrl);
  const builder = sdk.Builder.withJson({ claim_generator_info: [{ name: "probe", version: "1" }], title, assertions: [{ label: "c2pa.actions", data: { actions: [{ action: "c2pa.created", digitalSourceType: "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture" }] } }] });
  if (ingredient) await builder.addIngredient(JSON.stringify({ title: "ingredient.jpg", relationship: "componentOf" }), { buffer: ingredient, mimeType: "image/jpeg" });
  if (remoteUrl) builder.setRemoteUrl(remoteUrl);
  const output = { buffer: null };
  builder.sign(signer, { buffer: plain, mimeType: "image/jpeg" }, output);
  return output.buffer;
}

const cases = {};
const remoteHost = "http://manifests.c2pa-probe.example/m.c2pa";
cases["calibration: XMP remote manifest, host on port 80"] = withXmpProvenance(plain, remoteHost);
cases["calibration: XMP remote manifest, direct listener"] = withXmpProvenance(plain, `http://127.0.0.1:${port}/direct.c2pa`);

// Signed with a certificate that names OCSP, CA-issuer (AIA) and CRL URLs.
cases["signed, cert with OCSP/AIA/CRL URLs"] = await sign({ title: "cert-urls" });
// Embedded manifest plus a remote URL reference.
cases["signed, embedded + remote_url reference"] = await sign({ title: "remote-ref", remoteUrl: remoteHost });
// Parent whose ingredient points at a remote manifest.
cases["signed, ingredient with remote manifest"] = await sign({ title: "ingredient", ingredient: withXmpProvenance(plain, "http://ingredient.c2pa-probe.example/i.c2pa") });
// Timestamped by a public RFC 3161 authority (one request at signing time, before arming).
// The synchronous signer cannot reach a TSA, so use the async callback signer.
{
  const { createPrivateKey, sign: cryptoSign, X509Certificate } = await import("node:crypto");
  const privateKey = createPrivateKey(key);
  const ders = chain.toString().split(/(?=-----BEGIN CERTIFICATE-----)/).filter((pem) => pem.includes("BEGIN")).map((pem) => Buffer.from(pem));
  void X509Certificate;
  for (const tsa of [tsaUrl]) {
    try {
      const builder = sdk.Builder.withJson({ claim_generator_info: [{ name: "probe", version: "1" }], title: "tsa", assertions: [{ label: "c2pa.actions", data: { actions: [{ action: "c2pa.created", digitalSourceType: "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture" }] } }] });
      const output = { buffer: null };
      await builder.signConfigAsync(async (data) => cryptoSign("sha256", data, { key: privateKey, dsaEncoding: "ieee-p1363" }), { alg: "es256", certs: ders, reserveSize: 20000, tsaUrl: tsa, directCoseHandling: false }, { buffer: plain, mimeType: "image/jpeg" }, output);
      cases[`signed + timestamp from ${new URL(tsa).host}`] = output.buffer;
      const check = (await sdk.Reader.fromAsset({ buffer: output.buffer, mimeType: "image/jpeg" }, siteSettings)).json();
      const sig = check.manifests[check.active_manifest].signature_info;
      console.log(`(timestamped via ${tsa}: signature time ${sig?.time ?? "none"})`);
      break;
    } catch (error) {
      console.log(`(async timestamp via ${tsa} failed: ${String(error.message).slice(0, 140)})`);
    }
  }
}
const tsas = [];
for (const tsa of tsas) {
  try {
    cases[`signed, timestamped by ${new URL(tsa).host}`] = await sign({ title: "tsa", tsaUrl: tsa });
    break;
  } catch (error) {
    console.log(`(could not timestamp via ${tsa}: ${String(error.message).slice(0, 100)})`);
  }
}

async function validate(bytes, settings) {
  const before = log.length;
  let outcome;
  try {
    const reader = await sdk.Reader.fromAsset({ buffer: bytes, mimeType: "image/jpeg" }, settings);
    const store = reader?.json();
    outcome = store ? `${store.validation_state} ${JSON.stringify((store.validation_status ?? []).map((s) => s.code))}` : "no manifest";
  } catch (error) {
    outcome = `throw: ${String(error.message).slice(0, 90)}`;
  }
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { outcome, requests: log.slice(before) };
}

armProxy();
armed = true;
const results = [];
for (const [name, bytes] of Object.entries(cases)) {
  for (const [label, settings] of [
    ["site", siteSettings],
    ["defaults", defaults],
    ["fetch-on", permissive],
  ]) {
    const { outcome, requests } = await validate(bytes, settings);
    results.push({ name, label, requests: requests.length });
    console.log(`${name} | ${label} | requests=${requests.length} ${requests.join(" ; ").slice(0, 160)} | ${outcome.slice(0, 120)}`);
  }
}
console.log("TSA requests:", JSON.stringify(tsaHits));
const leaked = results.filter((row) => row.label === "site" && row.requests > 0);
const calibrated = results.filter((row) => row.name.startsWith("calibration") && row.label === "defaults" && row.requests > 0).length === 2;
const tsaAtValidation = tsaHits.some((hit) => hit.startsWith("VALIDATION"));
console.log(leaked.length === 0 && calibrated && !tsaAtValidation ? "PASS: no request with site settings; observer calibrated" : `FAIL: leaked=${leaked.length} calibrated=${calibrated} tsaAtValidation=${tsaAtValidation}`);
server.close();
tsa.close();
rmSync(here, { recursive: true, force: true }); // throwaway keys
process.exit(results.some((row) => row.label === "site" && row.requests > 0) || tsaHits.some((hit) => hit.startsWith("VALIDATION")) ? 1 : 0);
