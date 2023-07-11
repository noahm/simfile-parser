import * as fs from "fs";
import * as path from "path";
import { parseSong } from "./parseSong";
import { Pack, Simfile } from "./types";
import { printMaybeError, reportError } from "./util";

export * from "./types";
export * from "./parseSong";
export * from "./calculateStats";
export { setErrorTolerance } from "./util";

export type PackWithSongs = Pack & {
  simfiles: Simfile[];
};

/**
 * @param dirPath path segments
 * @returns a list of all child entries of the given path
 */
function getFiles(...dirPath: string[]): string[] {
  const builtPath = dirPath.reduce((building, d) => {
    return path.join(building, d);
  }, "");

  return fs.readdirSync(builtPath);
}

/**
 * @param dirPath path segments
 * @returns a list of child directories of the given path
 */
function getDirectories(...dirPath: string[]): string[] {
  const builtPath = dirPath.reduce((building, d) => {
    return path.join(building, d);
  }, "");

  return getFiles(builtPath).filter((d) => {
    return fs.statSync(path.join(builtPath, d)).isDirectory();
  });
}

/**
 * Parse an entire pack and return all data
 * @param dir path to a pack of songs (contains one or more folders, each containing a song)
 * @returns info about the pack as a whole and parsed simfile objects for each song
 */
export function parsePack(dir: string): PackWithSongs {
  const songDirs = getDirectories(dir);

  const pack: Pack = {
    name: path.basename(dir).replace(/-/g, " "),
    dir,
    songCount: 0,
  };

  const simfiles: Simfile[] = [];
  songDirs.map((songFolder) => {
    const songDirPath = path.join(dir, songFolder);
    try {
      const songData = parseSong(songDirPath);
      if (songData) {
        simfiles.push({
          ...songData,
          pack,
        });
      }
    } catch (e) {
      reportError(
        `parseStepchart failed for '${songFolder}': ${printMaybeError(e)}`,
      );
    }
  });

  pack.songCount = simfiles.length;

  return {
    ...pack,
    simfiles,
  };
}

/**
 * Convenience function to call `getPack` on every immediate subdirectory
 * @param rootDir path to a stepmania songs directory (contains folders per pack of songs)
 * @returns a list of pack objects, each with a list of simfile objects
 */
export function parseAllPacks(rootDir: string): PackWithSongs[] {
  return getDirectories(rootDir).map((d) => parsePack(path.join(rootDir, d)));
}
