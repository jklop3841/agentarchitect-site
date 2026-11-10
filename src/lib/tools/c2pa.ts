import "server-only";

import { sanitizeText } from "@/lib/tools/bytes";
import { structuralC2paReport, type C2paReport } from "@/lib/tools/imageproof";

// Cryptographic validation of Content Credentials with the official C2PA SDK
// (@contentauth/c2pa-node, a native module). The package must be installed for the build to
// succeed. If the native binary cannot be loaded at runtime, or TOOLS_C2PA=off, validation
// degrades to a presence check and the report says so (validator: structural_only).
//
// The SDK must stay offline: by default it fetches remote manifests and OCSP responses from
// URLs named inside the image, which would let a crafted file make this server issue requests
// to any host (an SSRF path around safe-fetch). Settings therefore go through settingsToJson():
// the native side reads snake_case JSON and silently ignores a camelCase object, which is how
// an earlier version of this file left the fetches enabled. tests/tools-c2pa.test.ts keeps a
// local listener to prove no request is made.

type ManifestStoreJson = {
  active_manifest?: string;
  validation_state?: string;
  validation_status?: Array<{ code?: string }>;
  manifests?: Record<
    string,
    {
      claim_generator?: string;
      claim_generator_info?: Array<{ name?: string; version?: string }>;
      signature_info?: { issuer?: string; common_name?: string; time?: string; alg?: string };
      assertions?: Array<{ label?: string; data?: unknown }>;
      ingredients?: unknown[];
    }
  >;
};

type C2paModule = {
  Reader: { fromAsset(asset: { buffer: Buffer; mimeType: string }, settings?: unknown): Promise<{ json(): ManifestStoreJson } | null> };
  createVerifySettings(config: Record<string, unknown>): unknown;
  createTrustSettings(config: Record<string, unknown>): unknown;
  mergeSettings(...settings: unknown[]): unknown;
  settingsToJson(settings: unknown): string;
};

let cached: Promise<C2paModule | null> | undefined;

function loadSdk(): Promise<C2paModule | null> {
  if (process.env.TOOLS_C2PA === "off") return Promise.resolve(null);
  cached ??= import("@contentauth/c2pa-node").then(
    (mod) => mod as unknown as C2paModule,
    (error: unknown) => {
      console.error("[tools] C2PA SDK unavailable, using presence check only:", error instanceof Error ? error.message.slice(0, 200) : "load failed");
      return null;
    },
  );
  return cached;
}

export async function c2paValidatorName(): Promise<C2paReport["validator"]> {
  return (await loadSdk()) ? "c2pa-node" : "structural_only";
}

// Trust anchors are inline PEM only. A URL here would make the SDK fetch it, so reject those.
function trustAnchorsPem() {
  const value = process.env.C2PA_TRUST_ANCHORS_PEM?.trim();
  if (!value || !value.includes("-----BEGIN CERTIFICATE-----") || /^https?:/i.test(value)) return null;
  return value;
}

// Always a JSON string in the native (snake_case) format. Trust is always verified: without
// anchors every signer is simply untrusted, which is the honest default.
export function c2paSettingsJson(sdk: Pick<C2paModule, "createVerifySettings" | "createTrustSettings" | "mergeSettings" | "settingsToJson">): string {
  const anchors = trustAnchorsPem();
  const verify = sdk.createVerifySettings({ ocspFetch: false, remoteManifestFetch: false, verifyTrust: true });
  const settings = anchors ? sdk.mergeSettings(verify, sdk.createTrustSettings({ verifyTrustList: true, trustAnchors: anchors })) : verify;
  const json = sdk.settingsToJson(settings);
  // Fail closed if a future SDK version changes the format and the offline switches vanish.
  const parsed = JSON.parse(json) as { verify?: { remote_manifest_fetch?: unknown; ocsp_fetch?: unknown } };
  if (parsed.verify?.remote_manifest_fetch !== false || parsed.verify?.ocsp_fetch !== false) {
    throw new Error("C2PA settings do not disable network access");
  }
  return json;
}

function collectSourceTypes(value: unknown, out: Set<string>, depth = 0) {
  if (depth > 6 || value == null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 50)) collectSourceTypes(item, out, depth + 1);
    return;
  }
  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    if (key === "digitalSourceType" && typeof inner === "string") out.add(sanitizeText(inner, 160));
    else collectSourceTypes(inner, out, depth + 1);
  }
}

const VALIDATION_TIMEOUT_MS = 8_000;

export async function validateC2pa(bytes: Uint8Array, mime: string): Promise<C2paReport> {
  const structural = structuralC2paReport(bytes, mime);
  const sdk = await loadSdk();
  if (!sdk) return structural;
  try {
    const work = sdk.Reader.fromAsset({ buffer: Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength), mimeType: mime }, c2paSettingsJson(sdk));
    const reader = await Promise.race([
      work,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("C2PA validation timed out")), VALIDATION_TIMEOUT_MS)),
    ]);
    if (!reader) {
      // The SDK found no manifest. If the byte scan did see a C2PA box, keep that weaker signal.
      return structural.state === "absent" ? { ...structural, validator: "c2pa-node" } : structural;
    }
    const store = reader.json();
    const codes = (store.validation_status ?? []).map((entry) => sanitizeText(entry.code ?? "", 80)).filter(Boolean).slice(0, 30);
    const manifest = store.active_manifest ? store.manifests?.[store.active_manifest] : undefined;
    const sourceTypes = new Set<string>();
    collectSourceTypes(manifest?.assertions, sourceTypes);
    const stateRaw = (store.validation_state ?? "").toLowerCase();
    // "trusted" is only accepted when this deployment actually configured trust anchors.
    const state: C2paReport["state"] = stateRaw === "trusted" && trustAnchorsPem() ? "trusted" : stateRaw === "trusted" || stateRaw === "valid" ? "valid_untrusted_signer" : "invalid";
    const generator = manifest?.claim_generator ?? manifest?.claim_generator_info?.map((info) => [info.name, info.version].filter(Boolean).join("/")).join(" ") ?? null;
    return {
      state,
      validator: "c2pa-node",
      status_codes: codes,
      active_manifest: manifest
        ? {
            claim_generator: generator ? sanitizeText(generator, 160) : null,
            signer: {
              issuer: manifest.signature_info?.issuer ? sanitizeText(manifest.signature_info.issuer, 160) : null,
              common_name: manifest.signature_info?.common_name ? sanitizeText(manifest.signature_info.common_name, 160) : null,
              time: manifest.signature_info?.time ? sanitizeText(manifest.signature_info.time, 40) : null,
              algorithm: manifest.signature_info?.alg ? sanitizeText(manifest.signature_info.alg, 20) : null,
            },
            assertions: (manifest.assertions ?? []).map((assertion) => sanitizeText(assertion.label ?? "", 80)).filter(Boolean).slice(0, 40),
            ingredient_count: manifest.ingredients?.length ?? 0,
            digital_source_types: [...sourceTypes].slice(0, 10),
          }
        : null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    // The file points at Content Credentials stored elsewhere. They are deliberately not
    // fetched; say so instead of treating it as a validator fault. The URL is not echoed.
    if (/remote manifest/i.test(message)) {
      return { ...structural, validator: "c2pa-node", status_codes: ["remoteManifest.notFetched"] };
    }
    console.error("[tools] C2PA validation failed:", message.replace(/https?:\/\/\S+/g, "<url>").slice(0, 200) || "unknown");
    // The validator failing is not evidence about the image. Report what was seen (a C2PA
    // block or none) and that validation did not complete.
    return { ...structural, status_codes: structural.state === "present_unvalidated" ? ["validator.error"] : [] };
  }
}
