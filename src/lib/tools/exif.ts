// A small EXIF reader for untrusted files. Isomorphic, no dependencies.
//
// It reads a fixed list of about twenty tags and nothing else. Every loop has a hard bound
// that does not depend on values inside the file, every read is bounds-checked, and no value
// larger than a kilobyte is ever materialised. A general-purpose metadata library was used
// here first; crafted files could drive it into an endless loop or gigabytes of allocations,
// and this service needs only these few fields.
//
// EXIF is a TIFF structure whatever the container (JPEG APP1, PNG eXIf, WebP EXIF chunk,
// HEIC/AVIF item, or a TIFF file itself). Rather than parse each container, the reader looks
// for a TIFF header anywhere in the file and accepts the first one that holds a plausible
// directory.

import { indexOfAscii } from "@/lib/tools/bytes";

export type ExifData = {
  found: boolean;
  ifd0: Record<string, unknown>;
  exif: Record<string, unknown>;
  gps: Record<string, unknown>;
};

const MAX_CANDIDATES = 16;
// Header-looking byte sequences examined in total. Each costs one bounded directory check.
const MAX_SCANNED = 4096;
const MAX_ENTRIES = 512;
const MAX_ASCII = 1024;

const typeSize: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 13: 4 };

const ifd0Tags: Record<number, string> = { 0x010e: "ImageDescription", 0x010f: "Make", 0x0110: "Model", 0x0131: "Software", 0x0132: "ModifyDate", 0x013b: "Artist", 0x8298: "Copyright" };
const exifTags: Record<number, string> = {
  0x9003: "DateTimeOriginal",
  0x9004: "CreateDate",
  0x9010: "OffsetTime",
  0x9011: "OffsetTimeOriginal",
  0xa002: "ExifImageWidth",
  0xa003: "ExifImageHeight",
  0xa434: "LensModel",
};
const gpsTags: Record<number, string> = { 0x0001: "GPSLatitudeRef", 0x0002: "GPSLatitude", 0x0003: "GPSLongitudeRef", 0x0004: "GPSLongitude", 0x0005: "GPSAltitudeRef", 0x0006: "GPSAltitude" };
const EXIF_POINTER = 0x8769;
const GPS_POINTER = 0x8825;

type Reader = { bytes: Uint8Array; base: number; little: boolean };

function u16(reader: Reader, offset: number) {
  const { bytes, little } = reader;
  return little ? bytes[offset] | (bytes[offset + 1] << 8) : (bytes[offset] << 8) | bytes[offset + 1];
}

function u32(reader: Reader, offset: number) {
  const { bytes, little } = reader;
  return (
    little
      ? bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)
      : (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]
  ) >>> 0;
}

// Reads one directory. Returns null when the bytes at `offset` are not a plausible directory.
function readDirectory(reader: Reader, offset: number, wanted: Record<number, string>, pointers: number[] = []) {
  const { bytes, base } = reader;
  const start = base + offset;
  if (offset < 8 || start + 2 > bytes.length) return null;
  const entries = u16(reader, start);
  if (entries === 0 || entries > MAX_ENTRIES || start + 2 + entries * 12 > bytes.length) return null;
  const values: Record<string, unknown> = {};
  const found: Record<number, number> = {};
  for (let index = 0; index < entries; index += 1) {
    const entry = start + 2 + index * 12;
    const tag = u16(reader, entry);
    const type = u16(reader, entry + 2);
    const count = u32(reader, entry + 4);
    const size = typeSize[type];
    // An unknown type in the first entry means this is not a directory at all.
    if (!size) {
      if (index === 0) return null;
      continue;
    }
    if (pointers.includes(tag) && (type === 4 || type === 13) && count === 1) {
      found[tag] = u32(reader, entry + 8);
      continue;
    }
    const name = wanted[tag];
    if (!name || name in values) continue;
    const total = count * size;
    const dataAt = total <= 4 ? entry + 8 : base + u32(reader, entry + 8);
    if (type === 2) {
      const length = Math.min(count, MAX_ASCII);
      if (length === 0 || dataAt + length > bytes.length) continue;
      let text = "";
      for (let position = 0; position < length; position += 1) {
        const code = bytes[dataAt + position];
        if (code === 0) break;
        text += String.fromCharCode(code);
      }
      // Most cameras write ASCII; some write UTF-8. Decode as UTF-8 when it is valid.
      try {
        text = decodeURIComponent(escape(text));
      } catch {
        // keep the Latin-1 reading
      }
      values[name] = text;
    } else if ((type === 3 || type === 4) && count === 1) {
      values[name] = type === 3 ? u16(reader, entry + 8) : u32(reader, entry + 8);
    } else if (type === 1 && count === 1) {
      values[name] = bytes[entry + 8];
    } else if (type === 5 && count >= 1 && count <= 3) {
      if (dataAt + count * 8 > bytes.length) continue;
      const numbers: number[] = [];
      for (let position = 0; position < count; position += 1) {
        const numerator = u32(reader, dataAt + position * 8);
        const denominator = u32(reader, dataAt + position * 8 + 4);
        numbers.push(denominator === 0 ? NaN : numerator / denominator);
      }
      values[name] = count === 1 ? numbers[0] : numbers;
    }
  }
  return { values, pointers: found };
}

function readAt(bytes: Uint8Array, base: number): ExifData | null {
  if (base + 8 > bytes.length) return null;
  const little = bytes[base] === 0x49;
  const reader: Reader = { bytes, base, little };
  const first = readDirectory(reader, u32(reader, base + 4), ifd0Tags, [EXIF_POINTER, GPS_POINTER]);
  if (!first) return null;
  const exif = first.pointers[EXIF_POINTER] ? readDirectory(reader, first.pointers[EXIF_POINTER], exifTags) : null;
  const gps = first.pointers[GPS_POINTER] ? readDirectory(reader, first.pointers[GPS_POINTER], gpsTags) : null;
  return { found: true, ifd0: first.values, exif: exif?.values ?? {}, gps: gps?.values ?? {} };
}

// Both byte orders are scanned together in file order, so the first EXIF block in the file
// wins whatever its byte order. Only candidates with a valid directory count towards the
// limit; stray header bytes are skipped (with a separate, larger cap) instead of being able
// to push the real EXIF out of reach.
export function readExif(bytes: Uint8Array): ExifData {
  const empty: ExifData = { found: false, ifd0: {}, exif: {}, gps: {} };
  let fallback: ExifData | null = null;
  let nextLittle = indexOfAscii(bytes, "II*\u0000");
  let nextBig = indexOfAscii(bytes, "MM\u0000*");
  let valid = 0;
  for (let scanned = 0; scanned < MAX_SCANNED && valid < MAX_CANDIDATES; scanned += 1) {
    if (nextLittle < 0 && nextBig < 0) break;
    const little = nextBig < 0 || (nextLittle >= 0 && nextLittle < nextBig);
    const at = little ? nextLittle : nextBig;
    if (little) nextLittle = indexOfAscii(bytes, "II*\u0000", at + 4);
    else nextBig = indexOfAscii(bytes, "MM\u0000*", at + 4);
    let data: ExifData | null = null;
    try {
      data = readAt(bytes, at);
    } catch {
      data = null;
    }
    if (!data) continue;
    valid += 1;
    // Prefer a directory that actually carries one of the fields we read.
    if (Object.keys(data.ifd0).length + Object.keys(data.exif).length + Object.keys(data.gps).length > 0) return data;
    fallback ??= data;
  }
  return fallback ?? empty;
}
