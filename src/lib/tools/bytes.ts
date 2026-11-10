// Byte helpers shared by the browser and the server (WebCrypto + typed arrays only).

import { ToolError } from "@/lib/tools/types";

export function toHex(bytes: Uint8Array) {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

export async function sha256Hex(bytes: Uint8Array) {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as unknown as BufferSource)));
}

const SHA256_RE = /^[0-9a-f]{64}$/;

// Accepts "ABCD…", "sha256:abcd…" and surrounding whitespace; returns lowercase hex or null.
export function normalizeSha256(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().toLowerCase().replace(/^sha-?256[:=]\s*/, "");
  return SHA256_RE.test(cleaned) ? cleaned : null;
}

export function decodeBase64(value: string, maxBytes: number): Uint8Array {
  const cleaned = value.replace(/^data:[^,]*,/, "").replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) throw new ToolError("invalid_input", "content_base64 is not valid base64.");
  // 4 base64 chars carry 3 bytes; reject before allocating.
  if (Math.floor((cleaned.length * 3) / 4) > maxBytes + 2) {
    throw new ToolError("payload_too_large", `Decoded content must be <= ${maxBytes} bytes.`, { max_bytes: maxBytes });
  }
  let binary: string;
  try {
    binary = atob(cleaned);
  } catch {
    throw new ToolError("invalid_input", "content_base64 is not valid base64.");
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  if (bytes.length > maxBytes) throw new ToolError("payload_too_large", `Decoded content must be <= ${maxBytes} bytes.`, { max_bytes: maxBytes });
  return bytes;
}

export function asciiAt(bytes: Uint8Array, offset: number, length: number) {
  let out = "";
  for (let index = offset; index < offset + length && index < bytes.length; index += 1) out += String.fromCharCode(bytes[index]);
  return out;
}

export function indexOfAscii(bytes: Uint8Array, needle: string, from = 0, to = bytes.length) {
  const first = needle.charCodeAt(0);
  const end = Math.min(to, bytes.length) - needle.length;
  outer: for (let index = from; index <= end; index += 1) {
    if (bytes[index] !== first) continue;
    for (let inner = 1; inner < needle.length; inner += 1) {
      if (bytes[index + inner] !== needle.charCodeAt(inner)) continue outer;
    }
    return index;
  }
  return -1;
}

// Strings lifted out of files and user text are data. Strip control characters (including
// ANSI escapes and bidi overrides) and cap the length before they enter a report.
export function sanitizeText(value: unknown, max = 300): string {
  const text = typeof value === "string" ? value : value instanceof Date ? value.toISOString() : String(value ?? "");
  const cleaned = text.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g, "").trim();
  return cleaned.length > max ? `${cleaned.slice(0, max)}…` : cleaned;
}

const instructionPatterns: RegExp[] = [
  /ignore (all |any )?(the )?(previous|prior|above|earlier) (instructions|prompts|messages)/i,
  /disregard (all |any )?(the )?(previous|prior|above) (instructions|prompts)/i,
  /\b(system|developer) prompt\b/i,
  /\byou are now\b/i,
  /\b(reveal|print|show|exfiltrate|send) (your |the )?(system prompt|instructions|api key|secrets?|credentials)/i,
  /<\/?(system|assistant|tool_call|function_calls?)>/i,
  /忽略(之前|以上|上面|先前|前面)(的|所有)*(指令|提示|要求|规则)/,
  /你现在是/,
  /(系统|开发者)提示词/,
  /(输出|泄露|打印|发送).{0,6}(密钥|口令|系统提示|环境变量)/,
];

// Flags text that reads like instructions aimed at an AI system. This is a heuristic warning
// for the calling agent; it never changes how this service behaves.
export function detectEmbeddedInstructions(text: string): boolean {
  return instructionPatterns.some((pattern) => pattern.test(text));
}
