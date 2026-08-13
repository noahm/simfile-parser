import {
  parsers,
  supportedExtensions,
  sortFileCandidatesByPriority,
} from "../parsers/index.js";
import { ParsedImages, RawSimfile } from "../parsers/types.js";
import { Simfile, Title } from "../types.js";
import { extname } from "./shared.js";
import { AnyEntry, DirLike, FileLike, isDir } from "./vfs.js";

/**
 * Find the best simfile in a given directory
 * @param songDir directory to search
 * @returns the most preferred simfile found, or null
 */
async function identifySongFile(songDir: DirLike): Promise<FileLike | null> {
  const candidates: FileLike[] = [];
  for await (const entry of songDir.entries()) {
    if (
      !isDir(entry) &&
      supportedExtensions.some((ext) => entry.name.endsWith(ext))
    ) {
      candidates.push(entry);
    }
  }
  if (!candidates.length) {
    return null;
  }
  candidates.sort((a, b) => sortFileCandidatesByPriority(a.name, b.name));
  return candidates[0];
}

const imageExts = new Set([".png", ".jpg"]);

/**
 * Get all image files in a given directory
 * @param songDir directory to search
 * @yields {FileLike} each file with a supported image extension
 */
async function* getImages(songDir: DirLike) {
  for await (const entry of songDir.entries()) {
    if (isDir(entry)) {
      continue;
    }
    const ext = extname(entry.name);
    if (ext && imageExts.has(ext)) {
      yield entry;
    }
  }
}

/**
 * Make some best guesses about which images should be used for which fields
 * @param songDir the song's directory
 * @param tagged image metadata found in simfile
 * @returns final image metadata
 */
async function guessImages(songDir: DirLike, tagged: ParsedImages) {
  let jacket = tagged.jacket ? await songDir.getFile(tagged.jacket) : null;
  let bg = tagged.bg ? await songDir.getFile(tagged.bg) : null;
  let banner = tagged.banner ? await songDir.getFile(tagged.banner) : null;
  const leftovers: FileLike[] = [];
  for await (const image of getImages(songDir)) {
    const imageName = image.name;
    const ext = extname(imageName) || "";
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
    jacket: jacket ? await jacket.file() : null,
    bg: bg ? await bg.file() : null,
    banner: banner ? await banner.file() : null,
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
 * Parse a single simfile by folder or individual file. Automatically determines which parser to use depending on chart definition type.
 * @param songDirOrFile song folder or file reference (contains a chart definition file [dwi/sm/ssc], images, etc)
 * @returns a simfile object without mix info or null if no sm/ssc file was found
 */
export async function parseSong(
  songDirOrFile: AnyEntry,
): Promise<BrowserSimfile | null> {
  const songDir = isDir(songDirOrFile) ? songDirOrFile : null;
  const songFile = songDir
    ? await identifySongFile(songDir)
    : (songDirOrFile as FileLike);
  if (!songFile) return null;

  const file = await songFile.file();
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

  const finalImages = songDir
    ? await guessImages(songDir, images)
    : { banner: null, bg: null, jacket: null };

  return {
    ...rawStepchart,
    title: {
      titleName: rawStepchart.title,
      translitTitleName: rawStepchart.titletranslit ?? null,
      titleDir: songDirOrFile.name,
      ...finalImages,
    },
    subtitle: {
      subtitleName: rawStepchart.subtitle ?? "",
      translitSubtitleName: rawStepchart.subtitletranslit ?? null,
    },
    minBpm,
    maxBpm,
    displayBpm,
    stopCount: Object.values(rawStepchart.charts)[0].stops.length,
  };
}
