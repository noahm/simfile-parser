import { Pack } from "../types.js";
import { reportError } from "../util.js";
import { BrowserSimfile, parseSong } from "./parseSong.js";
import {
  AnyFileOrEntry,
  isDirectoryEntry,
  isDirectoryHandle,
} from "./shared.js";

/**
 * @param dir directory handle
 * @yields FileSystemDirectoryHandle for each subdir of the given dir
 * @returns nothing
 */
async function* getDirectories(
  dir: FileSystemDirectoryHandle | FileSystemDirectoryEntry,
) {
  if ("createReader" in dir) {
    const dirs = await getDirectoriesFromEntry(dir);
    yield* dirs;
  } else {
    for await (const child of dir.values()) {
      if (child.kind === "directory") {
        yield child;
      }
    }
  }
}

/**
 * @param dir file system entry
 * @returns only subdirectories of the given directory
 */
function getDirectoriesFromEntry(dir: FileSystemDirectoryEntry) {
  const dirReader = dir.createReader();
  return new Promise<FileSystemDirectoryEntry[]>((resolve, reject) => {
    dirReader.readEntries((results) => {
      resolve(results.filter(isDirectoryEntry));
    }, reject);
  });
}

declare global {
  interface DataTransferItem {
    // optionalize this to avoid incorrect type narrowing below
    getAsFileSystemHandle?(): Promise<FileSystemHandle | null>;
  }
}

export type PackWithSongs = Pack & { simfiles: BrowserSimfile[] };

/**
 * Parse a pack drag/dropped by a user in a browser
 * @param item a DataTransferItem from a drop event
 * @returns parsed pack
 */
export async function parsePack(item: DataTransferItem | HTMLInputElement) {
  let dir: FileSystemDirectoryEntry | FileSystemDirectoryHandle;
  if (item instanceof HTMLInputElement) {
    if ("webkitEntries" in item) {
      const entries = item.webkitEntries;
      if (entries.length !== 1) {
        throw new Error("expected exactly one selected file");
      }
      const entry = entries[0];
      if (!isDirectoryEntry(entry)) {
        throw new Error("expected folder to be dropped, but got file");
      }
      dir = entry;
    } else {
      throw new Error("entries property not available on provided input");
    }
  } else {
    if (item.kind !== "file") {
      throw new Error("expected file to be dropped, but it was not a file");
    }
    if (item.getAsFileSystemHandle) {
      const dirHandle = await item.getAsFileSystemHandle();
      if (!dirHandle) {
        throw new Error("could not get file handle from drop item");
      }
      if (!isDirectoryHandle(dirHandle)) {
        throw new Error("expected folder to be dropped, but got file");
      }
      dir = dirHandle;
    } else if ("webkitGetAsEntry" in item) {
      const entry = item.webkitGetAsEntry();
      if (!entry) {
        throw new Error("could not get a file entry from drop item");
      }
      if (!isDirectoryEntry(entry)) {
        throw new Error("expected folder to be dropped, but got file");
      }
      dir = entry;
    } else {
      throw new Error("no supported file drop mechanism supported");
    }
  }

  const pack: Pack = {
    name: dir.name.replace(/-/g, " "),
    dir: dir.name,
    songCount: 0,
  };

  const simfiles: BrowserSimfile[] = [];
  for await (const songFolder of getDirectories(dir)) {
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

  return <PackWithSongs>{
    ...pack,
    simfiles,
  };
}

/**
 * For parsing a single song instead. Parses either a whole song folder, or just the metadata from a single simfile (ssc/sm/dwi)
 * @param item a data transfer item or HTML Input element a user has added a file selection to
 * @returns a simfile or null
 */
export async function parseSongFolderOrData(
  item: DataTransferItem | HTMLInputElement,
): Promise<BrowserSimfile | null> {
  let dirOrFile: FileSystemEntry | FileSystemHandle | File;
  if (item instanceof HTMLInputElement) {
    if ("webkitEntries" in item && item.webkitEntries.length > 0) {
      const entries = item.webkitEntries;
      if (entries.length > 1) {
        throw new Error("expected exactly one selected file");
      }
      dirOrFile = entries[0];
    } else if (item.files?.length) {
      if (item.files.length > 1) {
        throw new Error("expected exactly one selected file");
      }
      dirOrFile = item.files[0];
    } else {
      throw new Error("no files available on provided input");
    }
  } else {
    if (item.kind !== "file") {
      throw new Error("expected file to be dropped, but it was not a file");
    }
    if (item.getAsFileSystemHandle) {
      const dirHandle = await item.getAsFileSystemHandle();
      if (!dirHandle) {
        throw new Error("could not get file handle from drop item");
      }
      dirOrFile = dirHandle;
    } else if ("webkitGetAsEntry" in item) {
      const entry = item.webkitGetAsEntry();
      if (!entry) {
        throw new Error("could not get a file entry from drop item");
      }
      dirOrFile = entry;
    } else {
      throw new Error("no supported file drop mechanism supported");
    }
  }
  return parseSong(dirOrFile as AnyFileOrEntry);
}
