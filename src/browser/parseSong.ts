import {
  parsers,
  supportedExtensions,
  sortFileCandidatesByPriority,
} from "../parsers/index.js";
import { ParsedImages, RawSimfile } from "../parsers/types.js";
import { Simfile, Title } from "../types.js";
import { extname, isAnyDirectory, isFileEntry } from "./shared.js";

/**
 * @param files a list of candidate files to use for song info
 * @returns the the most preferred candidate file
 */
function getBestSongFileMatch<
  T extends FileSystemFileEntry | FileSystemFileHandle,
>(files: T[]): T | null {
  if (!files.length) {
    return null;
  }
  files.sort((a, b) => {
    return sortFileCandidatesByPriority(a.name, b.name);
  });
  return files[0];
}

/**
 * Find a simfile in a given directory
 * @param songDir directory handle
 * @returns file handle for the song file
 */
async function identifySongFile(
  songDir: FileSystemDirectoryHandle | FileSystemDirectoryEntry,
) {
  if ("createReader" in songDir) {
    const candidates = await getSongFilesFromEntry(songDir);
    return getBestSongFileMatch(candidates);
  }

  const candidates: FileSystemFileHandle[] = [];
  for await (const handle of songDir.values()) {
    if (handle.kind === "file") {
      if (supportedExtensions.some((ext) => handle.name.endsWith(ext))) {
        candidates.push(handle);
      }
    }
  }
  return getBestSongFileMatch(candidates);
}

/**
 * @param songDir legacy file system entry
 * @returns promise of the found file entry or null
 */
async function getSongFilesFromEntry(songDir: FileSystemDirectoryEntry) {
  const dirReader = songDir.createReader();
  return new Promise<FileSystemFileEntry[]>((resolve, reject) => {
    dirReader.readEntries((results) => {
      const ret: FileSystemFileEntry[] = [];
      for (const result of results) {
        if (isFileEntry(result)) {
          if (supportedExtensions.some((ext) => result.name.endsWith(ext))) {
            ret.push(result);
          }
        }
      }
      resolve(ret);
    }, reject);
  });
}

const imageExts = new Set([".png", ".jpg"]);

/**
 * Get all image files in a given directory
 * @param songDir directory
 * @yields file handles filtered to supported image extentions
 */
async function* getImages(
  songDir: FileSystemDirectoryHandle | FileSystemDirectoryEntry,
) {
  let files:
    | AsyncIterable<FileSystemDirectoryHandle | FileSystemFileHandle>
    | Iterable<FileSystemEntry>;
  if ("values" in songDir) {
    files = songDir.values();
  } else {
    files = await new Promise<FileSystemEntry[]>((res, rej) =>
      songDir.createReader().readEntries(res, rej),
    );
  }
  for await (const file of files) {
    const ext = extname(file.name);
    if (!ext) {
      continue;
    }
    if ("kind" in file && file.kind === "directory") {
      continue;
    }
    if ("isFile" in file && !isFileEntry(file)) {
      continue;
    }
    if (imageExts.has(ext)) {
      yield file as FileSystemFileEntry | FileSystemFileHandle;
    }
  }
}

/**
 * gets file handle/entry from a directory by name
 * @param dir directory handle or entry
 * @param name name of file to get
 * @returns promise of a handle or entry
 */
async function getByName(dir: DirRef, name: string) {
  if (name.startsWith("../")) {
    if ("getFileHandle" in dir) {
      throw new Error("no way to resolve upward relative paths using this api");
    } else {
      const parent = (await new Promise(
        dir.getParent,
      )) as FileSystemDirectoryEntry;
      return getByName(parent, name.slice(3));
    }
  }
  if ("getFileHandle" in dir) {
    return dir.getFileHandle(name);
  } else {
    return new Promise<FileSystemFileEntry>((resolve, reject) =>
      dir.getFile(
        name,
        {},
        (e) => {
          if (isFileEntry(e)) {
            resolve(e);
          } else {
            reject("file was not usable?");
          }
        },
        reject,
      ),
    );
  }
}

/**
 * returns a file object from a handle/entry
 * @param f the file handle or file entry
 * @returns promise of File object
 */
async function getFileContents(f: FileSystemFileHandle | FileSystemFileEntry) {
  if ("getFile" in f) {
    return f.getFile();
  } else {
    return new Promise<File>((res, reject) => {
      const a = true;
      f.file(res, (reason) => {
        debugger;
        reject(reason);
      });
      return a;
    });
  }
}

type DirRef = FileSystemDirectoryHandle | FileSystemDirectoryEntry;
type FileRef = FileSystemFileHandle | FileSystemFileEntry;

/**
 * Same as above, but catches and reports the error
 * @param dir directory reference
 * @param name file name or path
 * @returns promise of directory or null
 */
async function guardedGetByName(dir: DirRef, name: string) {
  try {
    return await getByName(dir, name);
  } catch {
    return null;
  }
}

/**
 * Make some best guesses about which images should be used for which fields
 * @param songDir path to a song directory
 * @param tagged image metadata found in simfile
 * @returns final image metadata
 */
async function guessImages(
  songDir: FileSystemDirectoryHandle | FileSystemDirectoryEntry,
  tagged: ParsedImages,
) {
  let jacket: FileRef | null = tagged.jacket
    ? await guardedGetByName(songDir, tagged.jacket)
    : null;
  let bg: FileRef | null = tagged.bg
    ? await guardedGetByName(songDir, tagged.bg)
    : null;
  let banner: FileRef | null = tagged.banner
    ? await guardedGetByName(songDir, tagged.banner)
    : null;
  const leftovers: FileRef[] = [];
  for await (const image of getImages(songDir)) {
    const imageName = image.name;
    const ext = extname(imageName)!;
    if (
      (!tagged.jacket && imageName.endsWith("-jacket" + ext)) ||
      imageName.startsWith("jacket.")
    ) {
      jacket = image;
    } else if (
      (!tagged.bg && imageName.endsWith("-bg" + ext)) ||
      imageName.startsWith("bg.")
    ) {
      bg = image;
    } else if (
      (!tagged.bg && imageName.endsWith("-bn" + ext)) ||
      imageName.startsWith("bn.")
    ) {
      banner = image;
    } else {
      leftovers.push(image);
    }
  }
  if (!bg && leftovers.length) {
    bg = leftovers.shift() || null;
  }
  if (!banner && leftovers.length) {
    banner = leftovers.shift() || null;
  }
  if (!jacket && leftovers.length) {
    jacket = leftovers.shift() || null;
  }
  return {
    jacket: jacket ? await getFileContents(jacket) : null,
    bg: bg ? await getFileContents(bg) : null,
    banner: banner ? await getFileContents(banner) : null,
  };
}

/**
 * get individual bpms of each chart
 * @param sm simfile
 * @returns list of found bpms, one per chart
 */
function getBpms(sm: Pick<RawSimfile, "charts">): number[] {
  const chart = Object.values(sm.charts)[0];
  return chart.bpm.map((b) => b.bpm);
}

export type BrowserTitle = Omit<Title, "banner" | "bg" | "jacket"> & {
  banner: File | null;
  bg: File | null;
  jacket: File | null;
};

export type BrowserSimfile = Omit<Simfile, "title"> & {
  title: BrowserTitle;
};

/**
 * given a directory or file handle/entry, get the actual File instance for the simfile
 * @param entryOrHandle either a handle or entry type reference to a directory or file
 * @returns File or null if not found
 */
async function getFileInstance(
  entryOrHandle:
    | FileSystemDirectoryHandle
    | FileSystemDirectoryEntry
    | FileSystemFileHandle
    | FileSystemFileEntry,
): Promise<File | null> {
  let songFileHandleOrEntry: FileSystemFileHandle | FileSystemFileEntry;
  if (isAnyDirectory(entryOrHandle)) {
    const identified = await identifySongFile(entryOrHandle);
    if (!identified) {
      return null;
    }
    songFileHandleOrEntry = identified;
  } else {
    songFileHandleOrEntry = entryOrHandle;
  }

  let ret: File;
  if ("getFile" in songFileHandleOrEntry) {
    ret = await songFileHandleOrEntry.getFile();
  } else {
    ret = await new Promise((resolve, reject) =>
      songFileHandleOrEntry.file(resolve, reject),
    );
  }
  return ret;
}

/**
 * Parse a single simfile by folder or individual file. Automatically determines which parser to use depending on chart definition type.
 * @param songDirOrFile song folder or file reference (contains a chart definition file [dwi/sm/ssc], images, etc)
 * @returns a simfile object without mix info or null if no sm/ssc file was found
 */
export async function parseSong(
  songDirOrFile:
    | FileSystemDirectoryHandle
    | FileSystemDirectoryEntry
    | FileSystemFileHandle
    | FileSystemFileEntry
    | File,
): Promise<BrowserSimfile | null> {
  const file =
    songDirOrFile instanceof File
      ? songDirOrFile
      : await getFileInstance(songDirOrFile);
  if (!file) return null;
  const extension = extname(file.name);
  if (!extension) return null;

  const parser = parsers[extension];

  if (!parser) {
    throw new Error(`No parser registered for extension: ${extension}`);
  }

  const { images, ...rawStepchart } = parser(await file.text(), "");

  if (!Object.keys(rawStepchart.charts).length) {
    throw new Error(
      `Failed to parse any charts from song: ${rawStepchart.title}`,
    );
  }

  const bpms = getBpms(rawStepchart);
  const minBpm = Math.round(Math.min(...bpms));
  const maxBpm = Math.round(Math.max(...bpms));

  let displayBpm = rawStepchart.displayBpm;
  if (!displayBpm) {
    displayBpm = minBpm === maxBpm ? minBpm.toString() : `${minBpm}-${maxBpm}`;
  }

  const finalImages = isAnyDirectory(songDirOrFile)
    ? await guessImages(songDirOrFile, images)
    : { banner: null, bg: null, jacket: null };

  return {
    ...rawStepchart,
    title: {
      titleName: rawStepchart.title,
      translitTitleName: rawStepchart.titletranslit ?? null,
      titleDir: songDirOrFile.name,
      ...finalImages,
    },
    minBpm,
    maxBpm,
    displayBpm,
    stopCount: Object.values(rawStepchart.charts)[0].stops.length,
  };
}
