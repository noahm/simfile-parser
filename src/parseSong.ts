import * as fs from "node:fs";
import * as path from "node:path";
import { Simfile } from "./types.js";
import { parsers, supportedExtensions } from "./parsers/index.js";
import type { ParsedImages, RawSimfile } from "./parsers/types.js";

/**
 * Find a simfile in a given directory
 * @param songDir directory path
 * @returns filename of the found simfile
 */
function getSongFile(songDir: string) {
  const files = fs.readdirSync(songDir);
  return files.find((f) => supportedExtensions.some((ext) => f.endsWith(ext)));
}

const imageExts = new Set([".png", ".jpg"]);
/**
 * Get all image files in a given directory
 * @param songDir directory
 * @returns contents filtered to supported image extentions
 */
function getImages(songDir: string): string[] {
  const files = fs.readdirSync(songDir);
  return files.filter((f) => imageExts.has(path.extname(f)));
}

/**
 * Make some best guesses about which images should be used for which fields
 * @param songDir path to a song directory
 * @param tagged image metadata found in simfile
 * @returns final image metadata
 */
function guessImages(songDir: string, tagged: ParsedImages) {
  let jacket = tagged.jacket;
  let bg = tagged.bg;
  let banner = tagged.banner;
  for (const image of getImages(songDir)) {
    const ext = path.extname(image);
    if (
      (!jacket && image.endsWith("-jacket" + ext)) ||
      image.startsWith("jacket.")
    ) {
      jacket = image;
    }
    if ((!bg && image.endsWith("-bg" + ext)) || image.startsWith("bg.")) {
      bg = image;
    }
    if ((!banner && image.endsWith("-bn" + ext)) || image.startsWith("bn.")) {
      banner = image;
    }
  }
  return { jacket, bg, banner };
}

// function toSafeName(name: string): string {
//   name = name.replace(".png", "");
//   name = name.replace(/\s/g, "-").replace(/[^\w]/g, "_");
//   return `${name}.png`;
// }

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
 * @param songDirPath path to song folder (contains a chart definition file [dwi/sm], images, etc)
 * @returns a simfile object without mix info or null if no sm/ssc file was found
 */
export function parseSong(songDirPath: string): Omit<Simfile, "mix"> | null {
  const songFile = getSongFile(songDirPath);
  if (!songFile) {
    return null;
  }
  const stepchartPath = path.join(songDirPath, songFile);
  const extension = path.extname(stepchartPath);

  const parser = parsers[extension];

  if (!parser) {
    throw new Error(`No parser registered for extension: ${extension}`);
  }

  const fileContents = fs.readFileSync(stepchartPath);
  const { images, ...rawStepchart } = parser(
    fileContents.toString(),
    songDirPath
  );

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

  return {
    ...rawStepchart,
    title: {
      titleName: rawStepchart.title,
      translitTitleName: rawStepchart.titletranslit ?? null,
      titleDir: songDirPath,
      ...guessImages(songDirPath, images),
    },
    minBpm,
    maxBpm,
    displayBpm,
    stopCount: Object.values(rawStepchart.charts)[0].stops.length,
  };
}
