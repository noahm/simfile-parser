/**
 * Adapters for the two filesystem APIs a browser might hand us: the modern
 * File System Access handles, and the older drag & drop entries.
 */

import { AnyEntry, DirLike, FileLike, splitPath } from "./index.js";

// --- File System Access API (handles) ---------------------------------------

/**
 * @param handle a file handle
 * @returns the handle as a virtual filesystem file
 */
function fileFromHandle(handle: FileSystemFileHandle): FileLike {
  return {
    type: "file",
    name: handle.name,
    // the browser never exposes a real path
    path: null,
    file: () => handle.getFile(),
  };
}

/**
 * @param handle a directory handle
 * @returns the handle as a virtual filesystem directory
 */
function dirFromHandle(handle: FileSystemDirectoryHandle): DirLike {
  return {
    type: "directory",
    name: handle.name,
    path: null,
    async *entries() {
      for await (const child of handle.values()) {
        yield fromHandle(child);
      }
    },
    async getFile(path) {
      const segments = splitPath(path);
      const filename = segments.pop();
      if (!filename) {
        return null;
      }
      try {
        let dir = handle;
        for (const segment of segments) {
          if (segment === "..") {
            // this api gives no way to walk up out of the granted directory
            return null;
          }
          dir = await dir.getDirectoryHandle(segment);
        }
        return fileFromHandle(await dir.getFileHandle(filename));
      } catch {
        return null;
      }
    },
  };
}

/**
 * @param handle any file system handle
 * @returns the handle as a virtual filesystem entry
 */
export function fromHandle(handle: FileSystemHandle): AnyEntry {
  return handle.kind === "directory"
    ? dirFromHandle(handle as FileSystemDirectoryHandle)
    : fileFromHandle(handle as FileSystemFileHandle);
}

// --- legacy drag & drop entries ---------------------------------------------

/**
 * @param entry a file entry
 * @returns the entry as a virtual filesystem file
 */
function fileFromEntry(entry: FileSystemFileEntry): FileLike {
  return {
    type: "file",
    name: entry.name,
    path: null,
    file: () => new Promise((resolve, reject) => entry.file(resolve, reject)),
  };
}

/**
 * `readEntries` only returns a limited number of children per call, so it has
 * to be called until it comes back empty to see a whole directory.
 * @param dir a directory entry
 * @returns every child of the directory
 */
function readAllEntries(dir: FileSystemDirectoryEntry) {
  const reader = dir.createReader();
  const all: FileSystemEntry[] = [];
  return new Promise<FileSystemEntry[]>((resolve, reject) => {
    const readBatch = () =>
      reader.readEntries((batch) => {
        if (!batch.length) {
          resolve(all);
          return;
        }
        all.push(...batch);
        readBatch();
      }, reject);
    readBatch();
  });
}

/**
 * @param entry a directory entry
 * @returns the entry as a virtual filesystem directory
 */
function dirFromEntry(entry: FileSystemDirectoryEntry): DirLike {
  return {
    type: "directory",
    name: entry.name,
    path: null,
    async *entries() {
      for (const child of await readAllEntries(entry)) {
        yield fromEntry(child);
      }
    },
    async getFile(path) {
      const segments = splitPath(path);
      try {
        let dir = entry;
        while (segments[0] === "..") {
          segments.shift();
          dir = await new Promise<FileSystemDirectoryEntry>((resolve, reject) =>
            dir.getParent(resolve as never, reject),
          );
        }
        if (!segments.length) {
          return null;
        }
        const found = await new Promise<FileSystemEntry>((resolve, reject) =>
          dir.getFile(segments.join("/"), {}, resolve, reject),
        );
        return found.isFile
          ? fileFromEntry(found as FileSystemFileEntry)
          : null;
      } catch {
        return null;
      }
    },
  };
}

/**
 * @param entry any file system entry
 * @returns the entry as a virtual filesystem entry
 */
export function fromEntry(entry: FileSystemEntry): AnyEntry {
  return entry.isDirectory
    ? dirFromEntry(entry as FileSystemDirectoryEntry)
    : fileFromEntry(entry as FileSystemFileEntry);
}

// --- plain files ------------------------------------------------------------

/**
 * @param file a file
 * @returns the file as a virtual filesystem file
 */
export function fromFile(file: File): FileLike {
  return {
    type: "file",
    name: file.name,
    path: null,
    file: () => Promise.resolve(file),
  };
}

/**
 * @param source anything a browser might hand us for a dropped item
 * @returns the item as a virtual filesystem entry
 */
export function fromDom(
  source: FileSystemHandle | FileSystemEntry | File,
): AnyEntry {
  if (source instanceof File) {
    return fromFile(source);
  }
  return "kind" in source ? fromHandle(source) : fromEntry(source);
}
