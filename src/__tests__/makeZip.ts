/**
 * A minimal zip writer, used only to build fixtures for the zip reader tests.
 * It deliberately supports the awkward variations real archives show up with:
 * stored vs deflated entries, zip64, and cp437 vs utf-8 filenames.
 */

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let bit = 0; bit < 8; bit++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

/**
 * @param bytes data to checksum
 * @returns the crc32 of the data
 */
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * @param bytes data to compress
 * @returns the raw deflate stream of the data
 */
async function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Encodes a filename as cp437, which for our fixtures only needs to cover the
 * ascii range plus a couple of accented characters.
 * @param name the filename
 * @returns the encoded bytes
 */
function encodeCp437(name: string): Uint8Array {
  const high =
    "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";
  return Uint8Array.from(
    [...name].map((char) => {
      const code = char.charCodeAt(0);
      if (code < 0x80) return code;
      const index = high.indexOf(char);
      if (index === -1) throw new Error(`cannot encode '${char}' as cp437`);
      return index + 0x80;
    }),
  );
}

export interface ZipFixtureFile {
  name: string;
  data: string | Uint8Array;
}

export interface ZipFixtureOptions {
  /** store entries uncompressed (method 0) instead of deflating them */
  stored?: boolean;
  /** write the archive as zip64, with the real sizes in extra fields */
  zip64?: boolean;
  /** encode filenames as cp437 rather than flagging them as utf-8 */
  cp437?: boolean;
  /** emit explicit entries for directories, which many archivers do */
  includeDirEntries?: boolean;
  /** trailing archive comment, which the reader has to scan back past */
  comment?: string;
}

const ZIP64_MARKER = 0xffffffff;

/**
 * Builds a zip archive in memory
 * @param files the files to include
 * @param options how to encode the archive
 * @returns the archive as a blob
 */
export async function makeZip(
  files: ZipFixtureFile[],
  options: ZipFixtureOptions = {},
): Promise<Blob> {
  const { stored, zip64, cp437, includeDirEntries, comment } = options;
  const commentBytes = new TextEncoder().encode(comment ?? "");

  const allNames = new Set<string>();
  if (includeDirEntries) {
    for (const file of files) {
      const segments = file.name.split("/");
      segments.pop();
      for (let i = 1; i <= segments.length; i++) {
        allNames.add(segments.slice(0, i).join("/") + "/");
      }
    }
  }

  const entries: { name: string; data: Uint8Array }[] = [
    ...[...allNames].map((name) => ({ name, data: new Uint8Array(0) })),
    ...files.map((file) => ({
      name: file.name,
      data:
        typeof file.data === "string"
          ? new TextEncoder().encode(file.data)
          : file.data,
    })),
  ];

  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const isDirectory = entry.name.endsWith("/");
    const nameBytes = cp437
      ? encodeCp437(entry.name)
      : new TextEncoder().encode(entry.name);
    const method = stored || isDirectory ? 0 : 8;
    const body = method === 0 ? entry.data : await deflate(entry.data);
    const crc = crc32(entry.data);
    const flags = cp437 ? 0 : 0x800;

    const header = new Uint8Array(30 + nameBytes.length);
    const headerView = new DataView(header.buffer);
    headerView.setUint32(0, 0x04034b50, true);
    headerView.setUint16(4, 20, true);
    headerView.setUint16(6, flags, true);
    headerView.setUint16(8, method, true);
    headerView.setUint32(14, crc, true);
    headerView.setUint32(18, body.length, true);
    headerView.setUint32(22, entry.data.length, true);
    headerView.setUint16(26, nameBytes.length, true);
    header.set(nameBytes, 30);
    local.push(header, body);

    // zip64 entries hide their real sizes and offset in an extra field
    const extra = new Uint8Array(zip64 ? 28 : 0);
    if (zip64) {
      const extraView = new DataView(extra.buffer);
      extraView.setUint16(0, 0x0001, true);
      extraView.setUint16(2, 24, true);
      extraView.setBigUint64(4, BigInt(entry.data.length), true);
      extraView.setBigUint64(12, BigInt(body.length), true);
      extraView.setBigUint64(20, BigInt(offset), true);
    }

    const record = new Uint8Array(46 + nameBytes.length + extra.length);
    const recordView = new DataView(record.buffer);
    recordView.setUint32(0, 0x02014b50, true);
    recordView.setUint16(4, 20, true);
    recordView.setUint16(6, 20, true);
    recordView.setUint16(8, flags, true);
    recordView.setUint16(10, method, true);
    recordView.setUint32(16, crc, true);
    recordView.setUint32(20, zip64 ? ZIP64_MARKER : body.length, true);
    recordView.setUint32(24, zip64 ? ZIP64_MARKER : entry.data.length, true);
    recordView.setUint16(28, nameBytes.length, true);
    recordView.setUint16(30, extra.length, true);
    recordView.setUint32(42, zip64 ? ZIP64_MARKER : offset, true);
    record.set(nameBytes, 46);
    record.set(extra, 46 + nameBytes.length);
    central.push(record);

    offset += header.length + body.length;
  }

  const centralSize = central.reduce((sum, r) => sum + r.length, 0);
  const centralOffset = offset;
  const tail: Uint8Array[] = [];

  if (zip64) {
    const record = new Uint8Array(56);
    const recordView = new DataView(record.buffer);
    recordView.setUint32(0, 0x06064b50, true);
    recordView.setBigUint64(4, 44n, true);
    recordView.setBigUint64(24, BigInt(entries.length), true);
    recordView.setBigUint64(32, BigInt(entries.length), true);
    recordView.setBigUint64(40, BigInt(centralSize), true);
    recordView.setBigUint64(48, BigInt(centralOffset), true);

    const locator = new Uint8Array(20);
    const locatorView = new DataView(locator.buffer);
    locatorView.setUint32(0, 0x07064b50, true);
    locatorView.setBigUint64(8, BigInt(centralOffset + centralSize), true);
    locatorView.setUint32(16, 1, true);

    tail.push(record, locator);
  }

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(8, zip64 ? 0xffff : entries.length, true);
  eocdView.setUint16(10, zip64 ? 0xffff : entries.length, true);
  eocdView.setUint32(12, zip64 ? ZIP64_MARKER : centralSize, true);
  eocdView.setUint32(16, zip64 ? ZIP64_MARKER : centralOffset, true);
  eocdView.setUint16(20, commentBytes.length, true);
  tail.push(eocd, commentBytes);

  return new Blob(
    [...local, ...central, ...tail].map((part) => part as BlobPart),
  );
}
