import * as path from "node:path";
import {
  packFromDir,
  parsePackDir,
  parsePackFromEntry,
  PackWithSongs,
} from "./parsePack.js";
import { parseSongFromEntry } from "./parseSong.js";
import { Simfile } from "./types.js";
import { reportError } from "./util.js";
import { entriesOf, isDir } from "./vfs/index.js";
import { dirFromPath, resolveSource, Source } from "./vfs/node.js";

export * from "./types.js";
export * from "./calculateStats.js";
export { setErrorTolerance } from "./util.js";
export type { PackWithSongs } from "./parsePack.js";
export type { Source } from "./vfs/node.js";
export type { AnyEntry, DirLike, FileLike } from "./vfs/index.js";

/**
 * Parse an entire pack. The pack may be a folder of song folders or a `.zip`
 * archive holding one, which is how packs are usually distributed; archives
 * are read lazily, so only chart files and images are ever decompressed.
 *
 * If the pack is wrapped in extra folders — as archives and downloads commonly
 * are — it is found inside them.
 * @param source path to a pack folder or `.zip`, or an archive's contents
 * @param name optional pack name, overriding the guess made from the folder
 * @throws {Error} if more than one pack is found, or no songs at all
 * @returns info about the pack as a whole and parsed simfiles for each song
 */
export async function parsePack(
  source: Source,
  name?: string,
): Promise<PackWithSongs> {
  return parsePackFromEntry(await resolveSource(source), name);
}

/**
 * Convenience function to call {@link parsePack} on everything in a stepmania
 * `Songs` directory. Both pack folders and `.zip` archives are picked up, and
 * anything that turns out not to hold a pack is skipped.
 * @param rootDir path to a directory containing packs
 * @returns a list of packs, each with a list of simfiles
 */
export async function parseAllPacks(rootDir: string): Promise<PackWithSongs[]> {
  const packs: PackWithSongs[] = [];
  for (const entry of await entriesOf(dirFromPath(rootDir))) {
    try {
      if (isDir(entry)) {
        // each child is taken to be a pack, since the caller already said so
        packs.push(await parsePackDir(entry, packFromDir(entry)));
      } else if (path.extname(entry.name).toLowerCase() === ".zip") {
        packs.push(await parsePack(entry.path ?? ""));
      }
    } catch (e) {
      reportError(`failed to parse pack '${entry.name}'`, e);
    }
  }
  return packs;
}

/**
 * Parse a single song, either a whole song folder or just the metadata from an
 * individual chart file (ssc/sm/dwi).
 * @param source path to a song folder or chart file, or its contents
 * @returns a simfile object without pack info, or null if no chart was found
 */
export async function parseSong(source: Source): Promise<Simfile | null> {
  return parseSongFromEntry(await resolveSource(source));
}
