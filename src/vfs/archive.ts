/**
 * Presents a zip archive as a virtual filesystem directory, reading entries
 * out of it lazily.
 */

import { AnyEntry, DirLike, FileLike, lenientGet, splitPath } from "./index.js";
import { readCentralDirectory, readEntry, ZipEntry } from "./zip.js";

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
 * @param archive the source archive
 * @param node the tree node to wrap
 * @returns the node as a virtual filesystem directory
 */
function dirFromZipNode(archive: Blob, node: ZipNode): DirLike {
  return {
    type: "directory",
    name: node.name,
    // nothing inside an archive has a location on disk
    path: null,
    async *entries(): AsyncIterable<AnyEntry> {
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
      if (!entry) {
        return Promise.resolve(null);
      }
      // report the name the archive actually holds rather than the one that
      // was asked for, which may differ in case
      const actual = splitPath(entry.name).pop() ?? filename;
      return Promise.resolve(fileFromZipEntry(archive, actual, entry));
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
    path: null,
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

/**
 * @param filename name of a zip file
 * @returns the name with any `.zip` extension removed
 */
export function stripZipExtension(filename: string) {
  return filename.replace(/\.zip$/i, "");
}
