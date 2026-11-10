// File type detection from magic bytes. Isomorphic. Detection never executes or renders the
// file; it only compares leading bytes against known signatures.

import { asciiAt, indexOfAscii } from "@/lib/tools/bytes";

export type FileCategory = "image" | "document" | "archive" | "executable" | "media" | "text" | "unknown";
export type DetectedType = { mime: string; label: string; category: FileCategory; extensions: string[] };

const type = (mime: string, label: string, category: FileCategory, ...extensions: string[]): DetectedType => ({ mime, label, category, extensions });

function starts(bytes: Uint8Array, signature: number[], offset = 0) {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((value, index) => bytes[offset + index] === value);
}

function looksLikeText(bytes: Uint8Array) {
  const sample = bytes.subarray(0, Math.min(bytes.length, 4096));
  if (sample.length === 0) return false;
  let control = 0;
  for (const byte of sample) {
    if (byte === 0) return false;
    if (byte < 9 || (byte > 13 && byte < 32)) control += 1;
  }
  return control / sample.length < 0.02;
}

export function detectFileType(bytes: Uint8Array): DetectedType | null {
  if (bytes.length === 0) return null;
  if (starts(bytes, [0xff, 0xd8, 0xff])) return type("image/jpeg", "JPEG image", "image", "jpg", "jpeg");
  if (starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return type("image/png", "PNG image", "image", "png");
  if (asciiAt(bytes, 0, 6) === "GIF87a" || asciiAt(bytes, 0, 6) === "GIF89a") return type("image/gif", "GIF image", "image", "gif");
  if (asciiAt(bytes, 0, 4) === "RIFF" && asciiAt(bytes, 8, 4) === "WEBP") return type("image/webp", "WebP image", "image", "webp");
  if (asciiAt(bytes, 0, 4) === "RIFF" && asciiAt(bytes, 8, 4) === "WAVE") return type("audio/wav", "WAV audio", "media", "wav");
  if (asciiAt(bytes, 0, 4) === "RIFF" && asciiAt(bytes, 8, 4) === "AVI ") return type("video/x-msvideo", "AVI video", "media", "avi");
  if (starts(bytes, [0x49, 0x49, 0x2a, 0x00]) || starts(bytes, [0x4d, 0x4d, 0x00, 0x2a])) return type("image/tiff", "TIFF image", "image", "tif", "tiff");
  if (asciiAt(bytes, 0, 2) === "BM" && bytes.length > 26) return type("image/bmp", "BMP image", "image", "bmp");
  if (asciiAt(bytes, 4, 4) === "ftyp") {
    const brand = asciiAt(bytes, 8, 4);
    if (["heic", "heix", "hevc", "mif1", "msf1", "heim", "heis"].includes(brand)) return type("image/heic", "HEIC/HEIF image", "image", "heic", "heif");
    if (brand === "avif" || brand === "avis") return type("image/avif", "AVIF image", "image", "avif");
    if (brand.startsWith("qt")) return type("video/quicktime", "QuickTime video", "media", "mov");
    if (brand.startsWith("M4A")) return type("audio/mp4", "MPEG-4 audio", "media", "m4a");
    return type("video/mp4", "MPEG-4 video", "media", "mp4", "m4v");
  }
  if (asciiAt(bytes, 0, 5) === "%PDF-") return type("application/pdf", "PDF document", "document", "pdf");
  if (starts(bytes, [0x50, 0x4b, 0x03, 0x04]) || starts(bytes, [0x50, 0x4b, 0x05, 0x06])) {
    const head = bytes.subarray(0, Math.min(bytes.length, 4096));
    if (indexOfAscii(head, "word/") >= 0) return type("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Word document (DOCX)", "document", "docx");
    if (indexOfAscii(head, "xl/") >= 0) return type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Excel workbook (XLSX)", "document", "xlsx");
    if (indexOfAscii(head, "ppt/") >= 0) return type("application/vnd.openxmlformats-officedocument.presentationml.presentation", "PowerPoint (PPTX)", "document", "pptx");
    if (indexOfAscii(head, "META-INF/MANIFEST.MF") >= 0) return type("application/java-archive", "Java archive (JAR)", "executable", "jar");
    if (indexOfAscii(head, "AndroidManifest.xml") >= 0) return type("application/vnd.android.package-archive", "Android package (APK)", "executable", "apk");
    return type("application/zip", "ZIP archive", "archive", "zip");
  }
  if (starts(bytes, [0x1f, 0x8b])) return type("application/gzip", "Gzip archive", "archive", "gz", "tgz");
  if (starts(bytes, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) return type("application/x-7z-compressed", "7-Zip archive", "archive", "7z");
  if (asciiAt(bytes, 0, 4) === "Rar!") return type("application/vnd.rar", "RAR archive", "archive", "rar");
  if (starts(bytes, [0x42, 0x5a, 0x68])) return type("application/x-bzip2", "Bzip2 archive", "archive", "bz2");
  if (starts(bytes, [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00])) return type("application/x-xz", "XZ archive", "archive", "xz");
  if (asciiAt(bytes, 257, 5) === "ustar") return type("application/x-tar", "TAR archive", "archive", "tar");
  if (starts(bytes, [0x7f, 0x45, 0x4c, 0x46])) return type("application/x-elf", "ELF executable (Linux)", "executable", "elf", "so", "bin");
  if (asciiAt(bytes, 0, 2) === "MZ") return type("application/vnd.microsoft.portable-executable", "Windows executable (PE)", "executable", "exe", "dll");
  if (
    starts(bytes, [0xcf, 0xfa, 0xed, 0xfe]) ||
    starts(bytes, [0xce, 0xfa, 0xed, 0xfe]) ||
    starts(bytes, [0xfe, 0xed, 0xfa, 0xcf]) ||
    starts(bytes, [0xfe, 0xed, 0xfa, 0xce]) ||
    starts(bytes, [0xca, 0xfe, 0xba, 0xbe])
  ) {
    return type("application/x-mach-binary", "Mach-O executable (macOS)", "executable", "dylib", "bin");
  }
  if (starts(bytes, [0x00, 0x61, 0x73, 0x6d])) return type("application/wasm", "WebAssembly module", "executable", "wasm");
  if (asciiAt(bytes, 0, 2) === "#!") return type("text/x-shellscript", "Script with shebang", "executable", "sh", "py", "pl", "rb");
  if (starts(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return type("video/webm", "WebM/Matroska video", "media", "webm", "mkv");
  if (asciiAt(bytes, 0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0 && bytes.length > 4)) return type("audio/mpeg", "MP3 audio", "media", "mp3");
  if (asciiAt(bytes, 0, 4) === "OggS") return type("audio/ogg", "Ogg media", "media", "ogg", "oga", "ogv");
  if (asciiAt(bytes, 0, 4) === "fLaC") return type("audio/flac", "FLAC audio", "media", "flac");
  if (asciiAt(bytes, 0, 4) === "SQLi") return type("application/vnd.sqlite3", "SQLite database", "document", "sqlite", "db");

  if (looksLikeText(bytes)) {
    const head = asciiAt(bytes, 0, Math.min(bytes.length, 512)).replace(/^﻿|^\xef\xbb\xbf/, "").trimStart().toLowerCase();
    if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return type("image/svg+xml", "SVG image (XML text, can carry scripts)", "text", "svg");
    if (head.startsWith("<!doctype html") || head.startsWith("<html")) return type("text/html", "HTML document", "text", "html", "htm");
    if (head.startsWith("<?xml")) return type("application/xml", "XML document", "text", "xml");
    if (head.startsWith("{") || head.startsWith("[")) return type("application/json", "JSON or JSON-like text", "text", "json");
    if (head.startsWith("-----begin ")) return type("application/x-pem-file", "PEM-encoded data", "text", "pem", "crt", "key", "asc");
    return type("text/plain", "Plain text", "text", "txt", "md", "csv", "log");
  }
  return null;
}

// Compares a declared name/MIME with the detected type. null = nothing to compare.
export function declaredTypeMatches(detected: DetectedType | null, name?: string | null, declaredMime?: string | null): boolean | null {
  if (!detected) return null;
  const mime = declaredMime?.split(";")[0]?.trim().toLowerCase();
  if (mime && mime !== "application/octet-stream") {
    if (mime === detected.mime) return true;
    if (detected.category === "text" && mime.startsWith("text/")) return true;
    return false;
  }
  const extension = name?.includes(".") ? name.split(".").pop()?.toLowerCase() : null;
  if (!extension) return null;
  if (detected.extensions.includes(extension)) return true;
  if (detected.category === "text" && detected.mime === "text/plain") return null;
  return false;
}
