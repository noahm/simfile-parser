import { parsePackFromEntry, PackWithSongs } from "../parsePack.js";
import { parseSongFromEntry } from "../parseSong.js";
import { Simfile } from "../types.js";
import { isZip, openZip, stripZipExtension } from "../vfs/archive.js";
import { AnyEntry, isDir, isEntry } from "../vfs/index.js";
import { fromDom } from "../vfs/dom.js";

declare global {
  interface DataTransferItem {
    // optionalize this to avoid incorrect type narrowing below
    getAsFileSystemHandle?(): Promise<FileSystemHandle | null>;
  }
}

export * from "../types.js";
export * from "../calculateStats.js";
export { setErrorTolerance } from "../util.js";
export type { PackWithSongs } from "../parsePack.js";
export type { AnyEntry, DirLike, FileLike } from "../vfs/index.js";

/** anything a browser might hand us for a dropped or selected item */
export type BrowserSource =
  | DataTransferItem
  | HTMLInputElement
  | File
  | Blob
  | AnyEntry;

/**
 * Pulls a usable file/folder reference out of whatever the browser handed us.
 * @param item a dropped item, a file input, a file, or an archive's contents
 * @returns the item as a virtual filesystem entry
 */
async function resolveItem(item: BrowserSource): Promise<AnyEntry> {
  if (isEntry(item)) {
    return item;
  }
  if (item instanceof File) {
    return fromDom(item);
  }
  if (item instanceof Blob) {
    return openZip(item);
  }
  if (item instanceof HTMLInputElement) {
    if ("webkitEntries" in item && item.webkitEntries.length) {
      if (item.webkitEntries.length > 1) {
        throw new Error("expected exactly one selected file");
      }
      return fromDom(item.webkitEntries[0]);
    }
    if (item.files?.length) {
      if (item.files.length > 1) {
        throw new Error("expected exactly one selected file");
      }
      return fromDom(item.files[0]);
    }
    throw new Error("no files available on provided input");
  }
  if (item.kind !== "file") {
    throw new Error("expected file to be dropped, but it was not a file");
  }
  if (item.getAsFileSystemHandle) {
    const handle = await item.getAsFileSystemHandle();
    if (!handle) {
      throw new Error("could not get file handle from drop item");
    }
    return fromDom(handle);
  }
  if ("webkitGetAsEntry" in item) {
    const entry = item.webkitGetAsEntry();
    if (!entry) {
      throw new Error("could not get a file entry from drop item");
    }
    return fromDom(entry);
  }
  throw new Error("no supported file drop mechanism supported");
}

/**
 * Expands a dropped or selected item into something parsable, opening it as an
 * archive if that is what it turns out to be.
 * @param item whatever the browser handed us
 * @returns the item as a virtual filesystem entry
 */
async function resolveSource(item: BrowserSource): Promise<AnyEntry> {
  const entry = await resolveItem(item);
  if (isDir(entry)) {
    return entry;
  }
  const file = await entry.file();
  if (await isZip(file)) {
    return openZip(file, stripZipExtension(entry.name));
  }
  return entry;
}

/**
 * Parse a pack drag/dropped or selected by a user in a browser. The pack may
 * be a folder of song folders or a `.zip` archive holding one, which is how
 * packs are usually distributed; archives are read lazily, so only chart files
 * and images are ever decompressed.
 *
 * If the pack is wrapped in extra folders — as archives commonly are — it is
 * found inside them.
 * @param item a DataTransferItem from a drop event, a file input, or a file
 * @param name optional pack name, overriding the guess made from the folder
 * @throws {Error} if more than one pack is found, or no songs at all
 * @returns parsed pack
 */
export async function parsePack(
  item: BrowserSource,
  name?: string,
): Promise<PackWithSongs> {
  return parsePackFromEntry(await resolveSource(item), name);
}

/**
 * Parse a single song, either a whole song folder or just the metadata from an
 * individual chart file (ssc/sm/dwi).
 * @param item a data transfer item, file input, or file
 * @returns a simfile object without pack info, or null if no chart was found
 */
export async function parseSong(item: BrowserSource): Promise<Simfile | null> {
  return parseSongFromEntry(await resolveSource(item));
}
