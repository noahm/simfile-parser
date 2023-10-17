import { parsers, supportedExtensions } from "../parsers/index.js";
import { ParsedImages, RawSimfile } from "../parsers/types.js";
import { Simfile } from "../types.js";
import { extname, isFileEntry } from "./shared.js";

/**
 * Find a simfile in a given directory
 * @param songDir directory handle
 * @returns file handle for the song file
 */
async function getSongFile(
  songDir: FileSystemDirectoryHandle | FileSystemDirectoryEntry
) {
  if ("createReader" in songDir) {
    return getSongFileFromEntry(songDir);
  }
  for await (const handle of songDir.values()) {
    if (handle.kind === "file") {
      if (supportedExtensions.some((ext) => handle.name.endsWith(ext))) {
        return handle;
      }
    }
  }
  return null;
}

/**
 * @param songDir legacy file system entry
 * @returns promise of the found file entry or null
 */
async function getSongFileFromEntry(songDir: FileSystemDirectoryEntry) {
  const dirReader = songDir.createReader();
  return new Promise<FileSystemFileEntry | null>((resolve, reject) => {
    dirReader.readEntries((results) => {
      for (const result of results) {
        if (isFileEntry(result)) {
          if (supportedExtensions.some((ext) => result.name.endsWith(ext))) {
            resolve(result);
            return;
          }
        }
      }
      resolve(null);
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
  songDir: FileSystemDirectoryHandle | FileSystemDirectoryEntry
) {
  let files:
    | AsyncIterable<FileSystemDirectoryHandle | FileSystemFileHandle>
    | Iterable<FileSystemEntry>;
  if ("values" in songDir) {
    files = songDir.values();
  } else {
    files = await new Promise<FileSystemEntry[]>((res, rej) =>
      songDir.createReader().readEntries(res, rej)
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
 * Make some best guesses about which images should be used for which fields
 * @param songDir path to a song directory
 * @param tagged image metadata found in simfile
 * @returns final image metadata
 */
async function guessImages(
  songDir: FileSystemDirectoryHandle | FileSystemDirectoryEntry,
  tagged: ParsedImages
) {
  let jacket = tagged.jacket;
  let bg = tagged.bg;
  let banner = tagged.banner;
  for await (const { name: imageName } of getImages(songDir)) {
    const ext = extname(imageName)!;
    if (
      (!jacket && imageName.endsWith("-jacket" + ext)) ||
      imageName.startsWith("jacket.")
    ) {
      jacket = imageName;
    }
    if (
      (!bg && imageName.endsWith("-bg" + ext)) ||
      imageName.startsWith("bg.")
    ) {
      bg = imageName;
    }
    if (
      (!banner && imageName.endsWith("-bn" + ext)) ||
      imageName.startsWith("bn.")
    ) {
      banner = imageName;
    }
  }
  return { jacket, bg, banner };
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

/**
 * Parse a single simfile. Automatically determines which parser to use depending on chart definition type.
 * @param songDir path to song folder (contains a chart definition file [dwi/sm], images, etc)
 * @returns a simfile object without mix info or null if no sm/ssc file was found
 */
export async function parseSong(
  songDir: FileSystemDirectoryHandle | FileSystemDirectoryEntry
): Promise<Omit<Simfile, "mix"> | null> {
  const songFileHandleOrEntry = await getSongFile(songDir);
  if (!songFileHandleOrEntry) {
    return null;
  }
  const extension = extname(songFileHandleOrEntry.name);
  if (!extension) return null;

  const parser = parsers[extension];

  if (!parser) {
    throw new Error(`No parser registered for extension: ${extension}`);
  }

  let fileContents: File;
  if ("getFile" in songFileHandleOrEntry) {
    fileContents = await songFileHandleOrEntry.getFile();
  } else {
    fileContents = await new Promise((resolve, reject) =>
      songFileHandleOrEntry.file(resolve, reject)
    );
  }

  const { images, ...rawStepchart } = parser(await fileContents.text(), "");

  if (!Object.keys(rawStepchart.charts).length) {
    throw new Error(
      `Failed to parse any charts from song: ${rawStepchart.title}`
    );
  }

  const bpms = getBpms(rawStepchart);
  const minBpm = Math.round(Math.min(...bpms));
  const maxBpm = Math.round(Math.max(...bpms));

  let displayBpm = rawStepchart.displayBpm;
  if (!displayBpm) {
    displayBpm = minBpm === maxBpm ? minBpm.toString() : `${minBpm}-${maxBpm}`;
  }

  const finalImages = await guessImages(songDir, images);

  return {
    ...rawStepchart,
    title: {
      titleName: rawStepchart.title,
      translitTitleName: rawStepchart.titletranslit ?? null,
      titleDir: songDir.name,
      ...finalImages,
    },
    minBpm,
    maxBpm,
    displayBpm,
    stopCount: Object.values(rawStepchart.charts)[0].stops.length,
  };
}
