import * as fs from "fs";
import * as path from "path";
import { parseDwi } from "./parseDwi";
import { parseSm } from "./parseSm";
import { parseSsc } from "./parseSsc";
import { Simfile } from "./types";

export type RawSimfile = Omit<Simfile, "mix" | "title"> & {
  title: string;
  titletranslit: string | null;
  displayBpm: string | undefined;
  images: Images;
};
export interface Images {
  banner: string | null;
  bg: string | null;
  jacket: string | null;
}
type Parser = (simfileSource: string, titleDir: string) => RawSimfile;

const parsers: Record<string, Parser> = {
  ".sm": parseSm,
  ".ssc": parseSsc,
  ".dwi": parseDwi,
};

/**
 * Find a simfile in a given directory
 *
 * @param songDir directory path
 * @returns filename of the found simfile
 */
function getSongFile(songDir: string): string {
  const files = fs.readdirSync(songDir);
  const extensions = Object.keys(parsers);
  const songFile = files.find((f) => extensions.some((ext) => f.endsWith(ext)));
  if (!songFile) {
    throw new Error(`No song file found in ${songDir}`);
  }
  return songFile;
}

const imageExts = new Set([".png", ".jpg"]);
/**
 * Get all image files in a given directory
 *
 * @param songDir directory
 * @returns contents filtered to supported image extentions
 */
function getImages(songDir: string): string[] {
  const files = fs.readdirSync(songDir);
  return files.filter((f) => imageExts.has(path.extname(f)));
}

/**
 * Make some best guesses about which images should be used for which fields
 *
 * @param songDir path to a song directory
 * @param tagged image metadata found in simfile
 * @returns final image metadata
 */
function guessImages(songDir: string, tagged: Images) {
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
 *
 * @param sm simfile
 * @returns list of found bpms, one per chart
 */
function getBpms(sm: Pick<RawSimfile, "charts">): number[] {
  const chart = Object.values(sm.charts)[0];
  return chart.bpm.map((b) => b.bpm);
}

/**
 * Parse a single simfile. Automatically determines which parser to use depending on chart definition type.
 *
 * @param songDirPath path to song folder (contains a chart definition file [dwi/sm], images, etc)
 * @returns a simfile object without mix info
 */
export function parseSong(songDirPath: string): Omit<Simfile, "mix"> {
  const songFile = getSongFile(songDirPath);
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

  const displayBpm =
    minBpm === maxBpm ? minBpm.toString() : `${minBpm}-${maxBpm}`;

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
