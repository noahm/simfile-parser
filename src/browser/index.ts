import { supportedExtensions } from "../parsers/index.js";
import { Pack } from "../types.js";
import { reportError } from "../util.js";
import { BrowserSimfile, parseSong } from "./parseSong.js";
import { AnyEntry, DirLike, fromDom, isDir, isZip, openZip } from "./vfs.js";

declare global {
  interface DataTransferItem {
    // optionalize this to avoid incorrect type narrowing below
    getAsFileSystemHandle?(): Promise<FileSystemHandle | null>;
  }
}

export type PackWithSongs = Pack & { simfiles: BrowserSimfile[] };

export type { BrowserSimfile, BrowserTitle } from "./parseSong.js";

/**
 * Pulls a usable file/folder reference out of whatever the browser handed us.
 * @param item a dropped item, a file input, or a file
 * @returns the item as a virtual filesystem entry
 */
async function resolveItem(
  item: DataTransferItem | HTMLInputElement | File,
): Promise<AnyEntry> {
  if (item instanceof File) {
    return fromDom(item);
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
 * @param dir a directory to inspect
 * @returns true if the directory directly contains a simfile
 */
async function containsSimfile(dir: DirLike): Promise<boolean> {
  for await (const entry of dir.entries()) {
    if (
      !isDir(entry) &&
      supportedExtensions.some((ext) => entry.name.endsWith(ext))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * @param dir a directory to inspect
 * @returns the directory's immediate subfolders
 */
async function subdirectories(dir: DirLike): Promise<DirLike[]> {
  const subdirs: DirLike[] = [];
  for await (const entry of dir.entries()) {
    if (isDir(entry)) {
      subdirs.push(entry);
    }
  }
  return subdirs;
}

/**
 * @param dir a directory to inspect
 * @returns true if any of the directory's subfolders is a song folder
 */
async function looksLikePack(dir: DirLike): Promise<boolean> {
  for (const subdir of await subdirectories(dir)) {
    if (await containsSimfile(subdir)) {
      return true;
    }
  }
  return false;
}

/** how many nested wrapper folders to look through before giving up */
const maxPackDepth = 4;

type PackSearch =
  | { type: "found"; dir: DirLike }
  | { type: "multiple"; packs: DirLike[] }
  | { type: "none" };

/**
 * Finds the folder that actually holds the song folders. Archives commonly
 * wrap a pack in one or more extra folders, so descend through them until we
 * reach a folder whose children look like songs.
 * @param dir the root of the archive
 * @param depth how many levels have been descended so far
 * @returns the pack folder, or why one couldn't be settled on
 */
async function findPackRoot(dir: DirLike, depth = 0): Promise<PackSearch> {
  if (await looksLikePack(dir)) {
    return { type: "found", dir };
  }

  // nothing here is a song, so look for the pack among the subfolders. Doing
  // it by what they contain rather than by counting them means junk folders
  // sitting next to the pack don't make it ambiguous.
  const subdirs = await subdirectories(dir);
  const packs: DirLike[] = [];
  for (const subdir of subdirs) {
    if (await looksLikePack(subdir)) {
      packs.push(subdir);
    }
  }
  if (packs.length === 1) {
    return { type: "found", dir: packs[0] };
  }
  if (packs.length > 1) {
    return { type: "multiple", packs };
  }

  if (subdirs.length === 1 && depth < maxPackDepth) {
    return findPackRoot(subdirs[0], depth + 1);
  }
  return { type: "none" };
}

/** how many pack names to name individually before summarizing the rest */
const maxNamesInError = 5;

/**
 * @param packs the packs found in an archive
 * @returns an error explaining that only one pack can be parsed at a time
 */
function multiplePacksError(packs: DirLike[]): Error {
  // sorted so the message doesn't depend on the order the archive happens to
  // list its entries in
  const names = packs.map((pack) => `'${pack.name}'`).sort();
  const listed = names.slice(0, maxNamesInError).join(", ");
  const rest = names.length - maxNamesInError;
  return new Error(
    `expected an archive holding a single pack, but found ${names.length}: ` +
      (rest > 0 ? `${listed}, and ${rest} more` : listed),
  );
}

/**
 * @param dirName the name of the folder a pack was found in
 * @returns pack metadata derived from that folder name
 */
function packFromDirName(dirName: string): Pack {
  return {
    name: dirName.replace(/-/g, " "),
    dir: dirName,
    songCount: 0,
  };
}

/**
 * Parses every song folder inside a directory into a pack
 * @param dir the pack's folder
 * @param pack metadata for the pack being built, mutated with the song count
 * @returns parsed pack
 */
async function parsePackDir(dir: DirLike, pack: Pack): Promise<PackWithSongs> {
  const songFolders: DirLike[] = [];
  for await (const entry of dir.entries()) {
    if (isDir(entry)) {
      songFolders.push(entry);
    }
  }

  const simfiles: BrowserSimfile[] = [];
  for (const songFolder of songFolders) {
    try {
      const songData = await parseSong(songFolder);
      if (songData) {
        simfiles.push({
          ...songData,
          pack,
        });
      }
    } catch (e) {
      reportError(`parseStepchart failed for '${songFolder.name}'`, e);
    }
  }

  pack.songCount = simfiles.length;

  return {
    ...pack,
    simfiles,
  };
}

/**
 * @param filename name of a zip file
 * @returns the name with any `.zip` extension removed
 */
function stripZipExtension(filename: string) {
  return filename.replace(/\.zip$/i, "");
}

/**
 * Parse a pack directly from a zip archive, without unzipping it first.
 *
 * Only the archive's index and the files belonging to each song are read, so
 * large packs don't have to be held in memory all at once.
 * @param archive the zip file
 * @param name optional pack name. Defaults to the name of the folder the songs
 * were found in, falling back to the archive's own filename.
 * @throws {Error} if the archive holds more than one pack, or no songs at all
 * @returns parsed pack
 */
export async function parseZipPack(
  archive: File | Blob,
  name?: string,
): Promise<PackWithSongs> {
  const archiveName =
    archive instanceof File ? stripZipExtension(archive.name) : "";
  const root = await openZip(archive, archiveName);

  const search = await findPackRoot(root);
  if (search.type === "multiple") {
    throw multiplePacksError(search.packs);
  }
  if (search.type === "none") {
    throw new Error(
      "found no songs in this archive; expected a pack containing one folder per song",
    );
  }
  const packDir = search.dir;
  const dirName = packDir.name || archiveName;
  return parsePackDir(
    packDir,
    // an explicitly provided name is used as given, rather than being run
    // through the guesswork we apply to folder names
    name ? { name, dir: dirName, songCount: 0 } : packFromDirName(dirName),
  );
}

/**
 * Parse a pack drag/dropped by a user in a browser. The pack may be either a
 * folder of song folders or a zip archive containing one.
 * @param item a DataTransferItem from a drop event, a file input, or a file
 * @returns parsed pack
 */
export async function parsePack(
  item: DataTransferItem | HTMLInputElement | File,
): Promise<PackWithSongs> {
  const entry = await resolveItem(item);

  if (!isDir(entry)) {
    const file = await entry.file();
    if (!(await isZip(file))) {
      throw new Error("expected a folder or zip file, but got another file");
    }
    // let parseZipPack name the pack after the folder it finds the songs in,
    // falling back to the archive's filename
    return parseZipPack(file);
  }

  return parsePackDir(entry, packFromDirName(entry.name));
}

/**
 * For parsing a single song instead. Parses either a whole song folder, or just the metadata from a single simfile (ssc/sm/dwi)
 * @param item a data transfer item or HTML Input element a user has added a file selection to
 * @returns a simfile or null
 */
export async function parseSongFolderOrData(
  item: DataTransferItem | HTMLInputElement | File,
): Promise<BrowserSimfile | null> {
  return parseSong(await resolveItem(item));
}
