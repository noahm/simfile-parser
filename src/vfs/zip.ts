/**
 * A minimal, dependency-free reader for zip archives.
 *
 * Only the central directory is read up front. Individual entries are read
 * lazily by slicing the source blob, so opening a multi-gigabyte pack archive
 * costs a few kilobytes of reads and only the files actually asked for are
 * ever decompressed.
 *
 * Supports stored (method 0) and deflated (method 8) entries, zip64 archives,
 * and both utf-8 and cp437 filename encodings.
 */

const EOCD_SIG = 0x06054b50;
const ZIP64_EOCD_SIG = 0x06064b50;
const ZIP64_LOCATOR_SIG = 0x07064b50;
const CENTRAL_FILE_SIG = 0x02014b50;
const LOCAL_FILE_SIG = 0x04034b50;

const EOCD_MIN_SIZE = 22;
/** the comment trailing the EOCD record is length-prefixed with a uint16 */
const MAX_COMMENT_SIZE = 0xffff;
const ZIP64_LOCATOR_SIZE = 20;

/** sentinel stored in 32 bit fields whose real value lives in a zip64 extra field */
const ZIP64_MARKER = 0xffffffff;
const ZIP64_MARKER_16 = 0xffff;

const STORED = 0;
const DEFLATED = 8;

/** bit 11 of the general purpose flags, set when the filename is utf-8 */
const UTF8_FLAG = 0x800;

/** upper half of code page 437, the encoding of filenames in older archives */
// prettier-ignore
const CP437_HIGH =
  "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";

export interface ZipEntry {
  /** full path of the entry within the archive, using forward slashes */
  name: string;
  /** offset of this entry's local file header within the archive */
  headerOffset: number;
  compressedSize: number;
  uncompressedSize: number;
  /** zip compression method; 0 is stored, 8 is deflated */
  method: number;
  isDirectory: boolean;
}

/**
 * Decodes a filename from raw bytes using whichever encoding the entry declares
 * @param bytes raw filename bytes
 * @param flags the entry's general purpose bit flags
 * @returns the decoded filename
 */
function decodeFilename(bytes: Uint8Array, flags: number): string {
  if (flags & UTF8_FLAG) {
    return new TextDecoder("utf-8").decode(bytes);
  }
  let result = "";
  for (const byte of bytes) {
    result += byte < 0x80 ? String.fromCharCode(byte) : CP437_HIGH[byte - 0x80];
  }
  return result;
}

/**
 * Reads a 64 bit little endian integer, which JS can only hold exactly up to
 * 2^53. Archives that large are well beyond what a browser could parse anyway.
 * @param view a data view over the record
 * @param offset byte offset to read from
 * @returns the value as a number
 */
function getUint64(view: DataView, offset: number): number {
  const value = view.getBigUint64(offset, true);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("zip archive is too large to read");
  }
  return Number(value);
}

/**
 * @param blob the source archive
 * @param start byte offset to read from
 * @param end byte offset to read until
 * @returns a data view over the requested range
 */
async function readView(blob: Blob, start: number, end: number) {
  const clamped = blob.slice(Math.max(0, start), Math.min(blob.size, end));
  return new DataView(await clamped.arrayBuffer());
}

interface CentralDirectoryLocation {
  offset: number;
  size: number;
  entryCount: number;
}

/**
 * Scans backwards from the end of the archive for the end of central directory
 * record, then follows the zip64 locator if one is present.
 * @param blob the source archive
 * @returns where the central directory lives and how many entries it holds
 */
async function findCentralDirectory(
  blob: Blob,
): Promise<CentralDirectoryLocation> {
  const tailSize = Math.min(blob.size, EOCD_MIN_SIZE + MAX_COMMENT_SIZE);
  const tailStart = blob.size - tailSize;
  const tail = await readView(blob, tailStart, blob.size);

  let eocd = -1;
  for (let i = tail.byteLength - EOCD_MIN_SIZE; i >= 0; i--) {
    if (tail.getUint32(i, true) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) {
    throw new Error("not a zip file: no end of central directory record found");
  }

  const location: CentralDirectoryLocation = {
    entryCount: tail.getUint16(eocd + 10, true),
    size: tail.getUint32(eocd + 12, true),
    offset: tail.getUint32(eocd + 16, true),
  };

  const needsZip64 =
    location.entryCount === ZIP64_MARKER_16 ||
    location.size === ZIP64_MARKER ||
    location.offset === ZIP64_MARKER;
  if (!needsZip64) {
    return location;
  }

  const locator = eocd - ZIP64_LOCATOR_SIZE;
  if (locator < 0 || tail.getUint32(locator, true) !== ZIP64_LOCATOR_SIG) {
    throw new Error("zip64 archive is missing its end of directory locator");
  }
  const zip64Offset = getUint64(tail, locator + 8);
  const record = await readView(blob, zip64Offset, zip64Offset + 56);
  if (record.getUint32(0, true) !== ZIP64_EOCD_SIG) {
    throw new Error("zip64 end of central directory record is corrupt");
  }
  return {
    entryCount: getUint64(record, 32),
    size: getUint64(record, 40),
    offset: getUint64(record, 48),
  };
}

/**
 * Pulls the real sizes and offset out of a zip64 extended information extra
 * field. Only the fields that overflowed in the base record are present, and
 * they always appear in this order.
 * @param extra the entry's raw extra field
 * @param entry the entry to fill in, mutated in place
 */
function applyZip64Extra(extra: DataView, entry: ZipEntry): void {
  let cursor = 0;
  while (cursor + 4 <= extra.byteLength) {
    const id = extra.getUint16(cursor, true);
    const size = extra.getUint16(cursor + 2, true);
    const body = cursor + 4;
    if (id === 0x0001) {
      let field = body;
      if (entry.uncompressedSize === ZIP64_MARKER && field + 8 <= body + size) {
        entry.uncompressedSize = getUint64(extra, field);
        field += 8;
      }
      if (entry.compressedSize === ZIP64_MARKER && field + 8 <= body + size) {
        entry.compressedSize = getUint64(extra, field);
        field += 8;
      }
      if (entry.headerOffset === ZIP64_MARKER && field + 8 <= body + size) {
        entry.headerOffset = getUint64(extra, field);
      }
      return;
    }
    cursor = body + size;
  }
}

/**
 * Reads and parses every central directory record in the archive
 * @param blob the source archive
 * @returns one entry per file and directory in the archive
 */
export async function readCentralDirectory(blob: Blob): Promise<ZipEntry[]> {
  const { offset, size, entryCount } = await findCentralDirectory(blob);
  const directory = await readView(blob, offset, offset + size);
  const bytes = new Uint8Array(directory.buffer);

  const entries: ZipEntry[] = [];
  let cursor = 0;
  while (entries.length < entryCount && cursor + 46 <= directory.byteLength) {
    if (directory.getUint32(cursor, true) !== CENTRAL_FILE_SIG) {
      break;
    }
    const flags = directory.getUint16(cursor + 8, true);
    const nameLength = directory.getUint16(cursor + 28, true);
    const extraLength = directory.getUint16(cursor + 30, true);
    const commentLength = directory.getUint16(cursor + 32, true);
    const nameStart = cursor + 46;

    const name = decodeFilename(
      bytes.subarray(nameStart, nameStart + nameLength),
      flags,
    );
    const entry: ZipEntry = {
      name,
      method: directory.getUint16(cursor + 10, true),
      compressedSize: directory.getUint32(cursor + 20, true),
      uncompressedSize: directory.getUint32(cursor + 24, true),
      headerOffset: directory.getUint32(cursor + 42, true),
      isDirectory: name.endsWith("/"),
    };
    if (extraLength) {
      applyZip64Extra(
        new DataView(
          directory.buffer,
          nameStart + nameLength,
          Math.min(extraLength, directory.byteLength - nameStart - nameLength),
        ),
        entry,
      );
    }
    entries.push(entry);
    cursor = nameStart + nameLength + extraLength + commentLength;
  }
  return entries;
}

/**
 * Reads a single entry's bytes out of the archive, decompressing if needed.
 *
 * The local file header has to be re-read here because its extra field is
 * frequently a different length than the one in the central directory, so it
 * is the only reliable way to find where the entry's data actually starts.
 * @param blob the source archive
 * @param entry the entry to read
 * @returns the entry's decompressed contents
 */
export async function readEntry(blob: Blob, entry: ZipEntry): Promise<Blob> {
  const header = await readView(
    blob,
    entry.headerOffset,
    entry.headerOffset + 30,
  );
  if (header.byteLength < 30 || header.getUint32(0, true) !== LOCAL_FILE_SIG) {
    throw new Error(`corrupt local file header for '${entry.name}'`);
  }
  const dataStart =
    entry.headerOffset +
    30 +
    header.getUint16(26, true) +
    header.getUint16(28, true);
  const data = blob.slice(dataStart, dataStart + entry.compressedSize);

  if (entry.method === STORED) {
    return data;
  }
  if (entry.method !== DEFLATED) {
    throw new Error(
      `unsupported compression method ${entry.method} for '${entry.name}'`,
    );
  }
  const decompressed = data
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(decompressed).blob();
}
