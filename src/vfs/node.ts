/**
 * Adapter for folders and archives on disk. This is the only part of the
 * parser that touches `node:fs`, so nothing here may be imported from the
 * browser entry point.
 */

import * as fs from "node:fs/promises";
import { openAsBlob } from "node:fs";
import * as path from "node:path";
import { AnyEntry, DirLike, FileLike, isEntry, splitPath } from "./index.js";
import { isZip, openZip, stripZipExtension } from "./archive.js";

/** anything the node entry points will parse from */
export type Source = string | Blob | AnyEntry;

/**
 * @param filePath path to a file
 * @returns the file as a virtual filesystem file, read on demand
 */
function fileFromPath(filePath: string): FileLike {
  const name = path.basename(filePath);
  return {
    type: "file",
    name,
    path: filePath,
    async file() {
      return new File([await fs.readFile(filePath)], name);
    },
  };
}

/**
 * Finds a file whose name differs from the one asked for only by case. Packs
 * are routinely authored on case insensitive filesystems, so a simfile's tags
 * may disagree with the disk about the casing of an image filename.
 * @param dirPath the directory to search
 * @param filename the filename to match
 * @returns the real filename on disk, or null
 */
async function findLeniently(
  dirPath: string,
  filename: string,
): Promise<string | null> {
  const lowered = filename.toLowerCase();
  try {
    for (const candidate of await fs.readdir(dirPath)) {
      if (candidate.toLowerCase() === lowered) {
        return candidate;
      }
    }
  } catch {
    // the directory itself is missing, which getFile reports as a miss
  }
  return null;
}

/**
 * @param dirPath path to a directory
 * @returns the directory as a virtual filesystem directory
 */
export function dirFromPath(dirPath: string): DirLike {
  return {
    type: "directory",
    name: path.basename(dirPath),
    path: dirPath,
    async *entries(): AsyncIterable<AnyEntry> {
      for (const name of await fs.readdir(dirPath)) {
        const full = path.join(dirPath, name);
        // stat rather than readdir's dirent so symlinked folders are followed,
        // which is how this behaved before the virtual filesystem existed
        const stats = await fs.stat(full).catch(() => null);
        if (!stats) {
          continue;
        }
        yield stats.isDirectory() ? dirFromPath(full) : fileFromPath(full);
      }
    },
    async getFile(relative) {
      const segments = splitPath(relative);
      const filename = segments.pop();
      if (!filename) {
        return null;
      }
      const parent = path.resolve(dirPath, ...segments);
      const target = path.join(parent, filename);
      const stats = await fs.stat(target).catch(() => null);
      if (stats?.isFile()) {
        return fileFromPath(target);
      }
      if (stats) {
        // it exists but is a directory
        return null;
      }
      const lenient = await findLeniently(parent, filename);
      return lenient ? fileFromPath(path.join(parent, lenient)) : null;
    },
  };
}

/**
 * Turns whatever the caller passed into something the parsers can read: a
 * folder on disk, a zip archive by path or in memory, or a single file.
 * @param source a path, a `Blob`/`File`, or an already resolved entry
 * @returns the source as a virtual filesystem entry
 */
export async function resolveSource(source: Source): Promise<AnyEntry> {
  if (isEntry(source)) {
    return source;
  }

  if (typeof source !== "string") {
    if (await isZip(source)) {
      const name = source instanceof File ? stripZipExtension(source.name) : "";
      return openZip(source, name);
    }
    if (source instanceof File) {
      return {
        type: "file",
        name: source.name,
        path: null,
        file: () => Promise.resolve(source),
      };
    }
    throw new Error(
      "expected a zip archive, but the data provided was not one",
    );
  }

  const stats = await fs.stat(source);
  if (stats.isDirectory()) {
    return dirFromPath(source);
  }

  const blob = await openAsBlob(source);
  if (await isZip(blob)) {
    return openZip(blob, stripZipExtension(path.basename(source)));
  }
  return fileFromPath(source);
}
