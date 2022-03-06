import * as fs from "fs";
import * as path from "path";
import { parseSong } from "./parseSong";
import { Pack, Simfile } from "./types";
import { printMaybeError } from "./util";

export * from "./types";
export * from "./parseSong";
export * from "./calculateStats";

export type PackWithSongs = Pack & {
  simfiles: Simfile[];
};

function getFiles(...dirPath: string[]): string[] {
  const builtPath = dirPath.reduce((building, d) => {
    return path.join(building, d);
  }, "");

  return fs.readdirSync(builtPath);
}

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
 */
export function parsePack(dir: string): PackWithSongs {
  const songDirs = getDirectories(dir);

  const mix = {
    name: path.basename(dir).replace(/-/g, " "),
    dir,
    songCount: songDirs.length,
  };

  const simfiles = songDirs.map((songFolder) => {
    const songDirPath = path.join(dir, songFolder);
    try {
      return {
        ...parseSong(songDirPath),
        mix,
      };
    } catch (e) {
      throw new Error(
        `parseStepchart failed for ${songDirPath}: ${printMaybeError(e)}`
      );
    }
  });

  return {
    ...mix,
    simfiles,
  };
}

/**
 * Convenience function to call `getPack` on every immediate subdirectory
 * @param rootDir path to a stepmania songs directory (contains folders per pack of songs)
 * @returns parsed files for every song in every pack
 */
export function parseAllPacks(rootDir: string): PackWithSongs[] {
  return getDirectories(rootDir).map((d) => parsePack(path.join(rootDir, d)));
}
