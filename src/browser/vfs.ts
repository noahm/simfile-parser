/**
 * A tiny virtual filesystem the parsers can target, so they don't have to care
 * whether a song came from a `FileSystemDirectoryHandle`, the older
 * `FileSystemDirectoryEntry`, or a folder inside a zip archive.
 */

import { readCentralDirectory, readEntry, ZipEntry } from "./zip.js";

export interface FileLike {
  type: "file";
  name: string;
  /** reads the file's contents */
  file(): Promise<File>;
}

export interface DirLike {
  type: "directory";
  name: string;
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
 * Splits a simfile-relative path into segments, tolerating the backslashes
 * that occasionally show up in tags authored on Windows.
 * @param path a relative path
 * @returns the meaningful path segments
 */
function splitPath(path: string): string[] {
  return path.split(/[/\\]/).filter((segment) => segment && segment !== ".");
}

// --- File System Access API (handles) ---------------------------------------

/**
 * @param handle a file handle
 * @returns the handle as a virtual filesystem file
 */
function fileFromHandle(handle: FileSystemFileHandle): FileLike {
  return {
    type: "file",
    name: handle.name,
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

// --- zip archives -----------------------------------------------------------

/** folders some archivers add alongside the real contents */
const ignoredNames = new Set(["__MACOSX", ".DS_Store", "Thumbs.db"]);

interface ZipNode {
  name: string;
  dirs: Map<string, ZipNode>;
  files: Map<string, ZipEntry>;
  parent: ZipNode | null;
}

/**
 * @param name the node's own name
 * @param parent the containing node, if any
 * @returns an empty tree node
 */
function makeNode(name: string, parent: ZipNode | null): ZipNode {
  return { name, dirs: new Map(), files: new Map(), parent };
}

/**
 * Rebuilds the archive's folder hierarchy from its flat list of entries.
 * Intermediate folders are created as needed, since archives are not required
 * to include explicit entries for them.
 * @param entries every entry in the archive
 * @param rootName a name to give the root of the tree
 * @returns the root node of the tree
 */
function buildTree(entries: ZipEntry[], rootName: string): ZipNode {
  const root = makeNode(rootName, null);
  for (const entry of entries) {
    const segments = splitPath(entry.name);
    if (!segments.length || segments.some((s) => ignoredNames.has(s))) {
      continue;
    }
    const filename = entry.isDirectory ? null : segments.pop();
    let node = root;
    for (const segment of segments) {
      let child = node.dirs.get(segment);
      if (!child) {
        child = makeNode(segment, node);
        node.dirs.set(segment, child);
      }
      node = child;
    }
    if (filename && !ignoredNames.has(filename)) {
      node.files.set(filename, entry);
    }
  }
  return root;
}

/**
 * Looks up a key in a map, falling back to a case insensitive match. Packs are
 * routinely authored on case insensitive filesystems, so a simfile's tags may
 * disagree with the archive on the casing of a filename.
 * @param map the map to search
 * @param key the key to look for
 * @returns the matching value, or undefined
 */
function lenientGet<T>(map: Map<string, T>, key: string): T | undefined {
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
 * @param archive the source archive
 * @param node the tree node to wrap
 * @returns the node as a virtual filesystem directory
 */
function dirFromZipNode(archive: Blob, node: ZipNode): DirLike {
  return {
    type: "directory",
    name: node.name,
    async *entries() {
      for (const child of node.dirs.values()) {
        yield dirFromZipNode(archive, child);
      }
      for (const [name, entry] of node.files) {
        yield fileFromZipEntry(archive, name, entry);
      }
    },
    getFile(path) {
      const segments = splitPath(path);
      const filename = segments.pop();
      if (!filename) {
        return Promise.resolve(null);
      }
      let dir: ZipNode | null | undefined = node;
      for (const segment of segments) {
        dir = segment === ".." ? dir.parent : lenientGet(dir.dirs, segment);
        if (!dir) {
          return Promise.resolve(null);
        }
      }
      const entry = lenientGet(dir.files, filename);
      return Promise.resolve(
        entry ? fileFromZipEntry(archive, filename, entry) : null,
      );
    },
  };
}

/**
 * Decompressed entries, keyed by the entry they came from. A single image
 * routinely gets picked for more than one role in a song, and looking one up
 * twice hands back two separate wrappers around the same entry, so without
 * this it would be decompressed once per use.
 */
const readEntries = new WeakMap<ZipEntry, Promise<File>>();

/**
 * @param archive the source archive
 * @param name the entry's own filename
 * @param entry the entry to wrap
 * @returns the entry as a virtual filesystem file, read lazily
 */
function fileFromZipEntry(
  archive: Blob,
  name: string,
  entry: ZipEntry,
): FileLike {
  return {
    type: "file",
    name,
    file() {
      let pending = readEntries.get(entry);
      if (!pending) {
        pending = readEntry(archive, entry).then(
          (contents) => new File([contents], name),
        );
        readEntries.set(entry, pending);
      }
      return pending;
    },
  };
}

/**
 * Opens a zip archive as a virtual filesystem directory. Only the archive's
 * index is read here; entries are decompressed individually, on demand.
 * @param archive the zip file
 * @param name a name for the archive's root directory
 * @returns the root of the archive
 */
export async function openZip(archive: Blob, name = ""): Promise<DirLike> {
  const entries = await readCentralDirectory(archive);
  return dirFromZipNode(archive, buildTree(entries, name));
}

/**
 * @param blob a file that may or may not be a zip archive
 * @returns true if the file starts with the zip magic number
 */
export async function isZip(blob: Blob): Promise<boolean> {
  if (blob.size < 4) {
    return false;
  }
  const magic = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  // "PK\x03\x04", the local file header signature every zip starts with
  return (
    magic[0] === 0x50 &&
    magic[1] === 0x4b &&
    magic[2] === 0x03 &&
    magic[3] === 0x04
  );
}
