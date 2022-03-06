import * as fs from "fs";
import * as path from "path";
import { parseDwi } from "./parseDwi";
import { parseSm } from "./parseSm";
import { parseSsc } from "./parseSsc";
import { Simfile } from "./types";

export type RawSimfile = Omit<Simfile, "mix" | "title"> & {
  title: string;
  titletranslit: string | null;
  banner: string | null;
  bg: string | null;
  cover: string | null;
  displayBpm: string | undefined;
};
type Parser = (simfileSource: string, titleDir: string) => RawSimfile;

// TODO: expand support to ssc files as well
const parsers: Record<string, Parser> = {
  ".sm": parseSm,
  ".ssc": parseSsc,
  ".dwi": parseDwi,
};

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
function getImages(songDir: string): string[] {
  const files = fs.readdirSync(songDir);
  return files.filter((f) => imageExts.has(path.extname(f)));
}

function guessJacketAndBg(songDir: string) {
  let jacket: string | null = null;
  let bg: string | null = null;
  for (const image of getImages(songDir)) {
    const ext = path.extname(image);
    if (image.endsWith("-jacket" + ext)) {
      jacket = image;
    }
    if (image.endsWith("-bg" + ext)) {
      bg = image;
    }
  }
  return { jacket, bg };
}

// function toSafeName(name: string): string {
//   name = name.replace(".png", "");
//   name = name.replace(/\s/g, "-").replace(/[^\w]/g, "_");
//   return `${name}.png`;
// }

function getBpms(sm: Pick<RawSimfile, "charts">): number[] {
  const chart = Object.values(sm.charts)[0];
  return chart.bpm.map((b) => b.bpm);
}

/**
 * Parse a single simfile. Automatically determines which parser to use depending on chart definition type.
 * @param songDirPath path to song folder (contains a chart definition file [dwi/sm], images, etc)
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
  const { banner, ...rawStepchart } = parser(
    fileContents.toString(),
    songDirPath
  );

  // TODO decide how to handle banner/jacket/bg images
  // if (
  //   rawStepchart.banner &&
  //   fs.existsSync(path.join(songDirPath, rawStepchart.banner))
  // ) {
  //   const publicName = toSafeName(`${mixDir}-${rawStepchart.banner}`);
  //   fs.copyFileSync(
  //     path.join(songDirPath, rawStepchart.banner),
  //     path.join("components/bannerImages", publicName)
  //   );
  //   rawStepchart.banner = publicName;
  // } else {
  //   rawStepchart.banner = null;
  // }

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
      banner,
      ...guessJacketAndBg(songDirPath),
    },
    minBpm,
    maxBpm,
    displayBpm,
    stopCount: Object.values(rawStepchart.charts)[0].stops.length,
  };
}
