/**
 * A tiny virtual filesystem the parsers target, so they don't have to care
 * whether a song came from a folder on disk, a zip archive, or one of the
 * browser's two filesystem APIs. Each source gets an adapter in this folder.
 */

import { ImageRef } from "../types.js";

export interface FileLike extends ImageRef {
  type: "file";
}

export interface DirLike {
  type: "directory";
  name: string;
  /** where the directory lives on disk, or null if it came out of an archive */
  path: string | null;
  /** iterates the directory's immediate children */
  entries(): AsyncIterable<AnyEntry>;
  /**
   * resolves a path relative to this directory, which may include `..`
   * segments, to a file. Resolves to null if it can't be found.
   */
  getFile(path: string): Promise<FileLike | null>;
}

export type AnyEntry = FileLike | DirLike;

/**
 * @param entry any virtual filesystem entry
 * @returns true if the entry is a directory
 */
export function isDir(entry: AnyEntry): entry is DirLike {
  return entry.type === "directory";
}

/**
 * Blobs and Files carry a `type` of their own — their mime type — so telling
 * one from a virtual filesystem entry takes more than a property check.
 * @param source anything that might already be an entry
 * @returns true if it is one
 */
export function isEntry(source: unknown): source is AnyEntry {
  return (
    typeof source === "object" &&
    source !== null &&
    !(source instanceof Blob) &&
    "type" in source &&
    (source.type === "file" || source.type === "directory")
  );
}

/**
 * Splits a simfile-relative path into segments, tolerating the backslashes
 * that occasionally show up in tags authored on Windows.
 * @param path a relative path
 * @returns the meaningful path segments
 */
export function splitPath(path: string): string[] {
  return path.split(/[/\\]/).filter((segment) => segment && segment !== ".");
}

/**
 * Looks up a key in a map, falling back to a case insensitive match. Packs are
 * routinely authored on case insensitive filesystems, so a simfile's tags may
 * disagree with the filesystem on the casing of a filename.
 * @param map the map to search
 * @param key the key to look for
 * @returns the matching value, or undefined
 */
export function lenientGet<T>(map: Map<string, T>, key: string): T | undefined {
  const exact = map.get(key);
  if (exact !== undefined) {
    return exact;
  }
  const lowered = key.toLowerCase();
  for (const [candidate, value] of map) {
    if (candidate.toLowerCase() === lowered) {
      return value;
    }
  }
  return undefined;
}

/**
 * Collects a directory's children, which adapters expose as an async iterable.
 * @param dir a directory
 * @returns every immediate child of the directory
 */
export async function entriesOf(dir: DirLike): Promise<AnyEntry[]> {
  const all: AnyEntry[] = [];
  for await (const entry of dir.entries()) {
    all.push(entry);
  }
  return all;
}
