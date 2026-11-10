// Builders for tiny, valid-enough image files used in tests. No real pixels: just the
// container structure that metadata parsers read.

type TiffEntry = { tag: number; type: 2 | 3 | 4 | 5; values: string | number[] };

const typeSize = { 2: 1, 3: 2, 4: 4, 5: 8 } as const;

// Little-endian TIFF with IFD0 and an optional Exif sub-IFD and GPS sub-IFD.
function buildTiff(ifd0: TiffEntry[], exifIfd: TiffEntry[] = [], gpsIfd: TiffEntry[] = []) {
  const chunks: number[] = [0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0];
  const u16 = (value: number) => [value & 0xff, (value >> 8) & 0xff];
  const u32 = (value: number) => [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >>> 24) & 0xff];

  const encode = (entry: TiffEntry): number[] => {
    if (entry.type === 2) return [...Buffer.from(`${entry.values as string}\0`, "latin1")];
    const values = entry.values as number[];
    if (entry.type === 3) return values.flatMap(u16);
    if (entry.type === 4) return values.flatMap(u32);
    // RATIONAL: pairs of numerator/denominator
    return values.flatMap(u32);
  };
  const count = (entry: TiffEntry) => (entry.type === 2 ? (entry.values as string).length + 1 : entry.type === 5 ? (entry.values as number[]).length / 2 : (entry.values as number[]).length);

  const layout = (entries: TiffEntry[], start: number, pointers: Record<number, number>) => {
    const sorted = [...entries].sort((a, b) => a.tag - b.tag);
    const tableSize = 2 + sorted.length * 12 + 4;
    let dataOffset = start + tableSize;
    const table: number[] = [...u16(sorted.length)];
    const data: number[] = [];
    for (const entry of sorted) {
      const pointer = pointers[entry.tag];
      const bytes = pointer !== undefined ? u32(pointer) : encode(entry);
      const n = pointer !== undefined ? 1 : count(entry);
      table.push(...u16(entry.tag), ...u16(entry.type), ...u32(n));
      if (bytes.length <= 4) {
        table.push(...bytes, ...new Array(4 - bytes.length).fill(0));
      } else {
        table.push(...u32(dataOffset));
        data.push(...bytes);
        if (bytes.length % 2) data.push(0);
        dataOffset = start + tableSize + data.length;
      }
    }
    table.push(0, 0, 0, 0);
    return { bytes: [...table, ...data], end: start + tableSize + data.length };
  };

  const root = [...ifd0];
  if (exifIfd.length) root.push({ tag: 0x8769, type: 4, values: [0] });
  if (gpsIfd.length) root.push({ tag: 0x8825, type: 4, values: [0] });
  // First pass to learn sizes, second pass with real pointers.
  const first = layout(root, 8, {});
  const exifStart = first.end;
  const exif = exifIfd.length ? layout(exifIfd, exifStart, {}) : { bytes: [], end: exifStart };
  const gpsStart = exif.end;
  const gps = gpsIfd.length ? layout(gpsIfd, gpsStart, {}) : { bytes: [], end: gpsStart };
  const pointers: Record<number, number> = {};
  if (exifIfd.length) pointers[0x8769] = exifStart;
  if (gpsIfd.length) pointers[0x8825] = gpsStart;
  const final = layout(root, 8, pointers);
  return new Uint8Array([...chunks, ...final.bytes, ...exif.bytes, ...gps.bytes]);
}

export type ExifOptions = {
  make?: string;
  model?: string;
  software?: string;
  description?: string;
  modified?: string;
  captured?: string;
  pixelWidth?: number;
  pixelHeight?: number;
  gps?: { lat: [number, number, number]; latRef: "N" | "S"; lon: [number, number, number]; lonRef: "E" | "W" };
};

export function buildJpeg(options: { width?: number; height?: number; exif?: ExifOptions } = {}) {
  const width = options.width ?? 640;
  const height = options.height ?? 480;
  const parts: number[] = [0xff, 0xd8];
  if (options.exif) {
    const e = options.exif;
    const ifd0: TiffEntry[] = [];
    if (e.description) ifd0.push({ tag: 0x010e, type: 2, values: e.description });
    if (e.make) ifd0.push({ tag: 0x010f, type: 2, values: e.make });
    if (e.model) ifd0.push({ tag: 0x0110, type: 2, values: e.model });
    if (e.software) ifd0.push({ tag: 0x0131, type: 2, values: e.software });
    if (e.modified) ifd0.push({ tag: 0x0132, type: 2, values: e.modified });
    const exifIfd: TiffEntry[] = [];
    if (e.captured) exifIfd.push({ tag: 0x9003, type: 2, values: e.captured });
    if (e.pixelWidth) exifIfd.push({ tag: 0xa002, type: 4, values: [e.pixelWidth] });
    if (e.pixelHeight) exifIfd.push({ tag: 0xa003, type: 4, values: [e.pixelHeight] });
    const gpsIfd: TiffEntry[] = [];
    if (e.gps) {
      const rational = (triple: [number, number, number]) => triple.flatMap((value) => [Math.round(value * 100), 100]);
      gpsIfd.push({ tag: 0x0001, type: 2, values: e.gps.latRef }, { tag: 0x0002, type: 5, values: rational(e.gps.lat) }, { tag: 0x0003, type: 2, values: e.gps.lonRef }, { tag: 0x0004, type: 5, values: rational(e.gps.lon) });
    }
    const tiff = buildTiff(ifd0, exifIfd, gpsIfd);
    const payload = [...Buffer.from("Exif\0\0", "latin1"), ...tiff];
    const length = payload.length + 2;
    parts.push(0xff, 0xe1, (length >> 8) & 0xff, length & 0xff, ...payload);
  }
  // SOF0: precision 8, height, width, 3 components
  parts.push(0xff, 0xc0, 0x00, 0x11, 0x08, (height >> 8) & 0xff, height & 0xff, (width >> 8) & 0xff, width & 0xff, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01);
  parts.push(0xff, 0xd9);
  return new Uint8Array(parts);
}

export function buildPng(width = 320, height = 200) {
  const u32 = (value: number) => [(value >>> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...u32(13), ...Buffer.from("IHDR", "latin1"), ...u32(width), ...u32(height), 8, 6, 0, 0, 0, 0, 0, 0, 0,
    ...u32(0), ...Buffer.from("IEND", "latin1"), 0xae, 0x42, 0x60, 0x82,
  ]);
}

export const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");
