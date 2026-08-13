import { supportedExtensions } from "./parsers/index.js";
import { parseSongFromEntry } from "./parseSong.js";
import { Pack, Simfile } from "./types.js";
import { reportError } from "./util.js";
import { AnyEntry, DirLike, entriesOf, isDir } from "./vfs/index.js";

export type PackWithSongs = Pack & { simfiles: Simfile[] };

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
  return (await entriesOf(dir)).filter(isDir);
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
 * Finds the folder that actually holds the song folders. Archives and download
 * folders commonly wrap a pack in one or more extra folders, so descend
 * through them until we reach a folder whose children look like songs.
 * @param dir the folder to search
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
 * @param packs the packs that were found
 * @returns an error explaining that only one pack can be parsed at a time
 */
function multiplePacksError(packs: DirLike[]): Error {
  // sorted so the message doesn't depend on the order the source happens to
  // list its entries in
  const names = packs.map((pack) => `'${pack.name}'`).sort();
  const listed = names.slice(0, maxNamesInError).join(", ");
  const rest = names.length - maxNamesInError;
  return new Error(
    `expected a single pack, but found ${names.length}: ` +
      (rest > 0 ? `${listed}, and ${rest} more` : listed) +
      ". Use parseAllPacks to parse a folder of packs.",
  );
}

/**
 * @param dir the folder a pack was found in
 * @param name an explicit name to use instead of guessing from the folder
 * @returns pack metadata
 */
export function packFromDir(dir: DirLike, name?: string): Pack {
  return {
    // an explicitly provided name is used as given, rather than being run
    // through the guesswork we apply to folder names
    name: name ?? dir.name.replace(/-/g, " "),
    dir: dir.name,
    path: dir.path,
    songCount: 0,
  };
}

/**
 * Parses every song folder inside a directory into a pack, without looking for
 * the pack first.
 * @param dir the pack's folder
 * @param pack metadata for the pack being built, mutated with the song count
 * @returns parsed pack
 */
export async function parsePackDir(
  dir: DirLike,
  pack: Pack,
): Promise<PackWithSongs> {
  const songFolders = await subdirectories(dir);

  const simfiles: Simfile[] = [];
  for (const songFolder of songFolders) {
    try {
      const songData = await parseSongFromEntry(songFolder);
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
 * Parse a pack from an already resolved entry, locating the pack folder first.
 * @param entry the folder or opened archive to search
 * @param name optional pack name, overriding the guess made from the folder
 * @throws {Error} if more than one pack is found, or no songs at all
 * @returns parsed pack
 */
export async function parsePackFromEntry(
  entry: AnyEntry,
  name?: string,
): Promise<PackWithSongs> {
  if (!isDir(entry)) {
    throw new Error(
      "expected a folder or zip archive holding a pack, but got a single file",
    );
  }

  const search = await findPackRoot(entry);
  if (search.type === "multiple") {
    throw multiplePacksError(search.packs);
  }
  if (search.type === "none") {
    throw new Error(
      "found no songs here; expected a pack containing one folder per song",
    );
  }

  // a pack whose songs sit at the root of an archive has no folder of its own
  // to take a name from, so fall back to the archive's name
  const dir = search.dir.name
    ? search.dir
    : { ...search.dir, name: entry.name };
  return parsePackDir(search.dir, packFromDir(dir, name));
}
