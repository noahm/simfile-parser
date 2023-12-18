import { parseDwi } from "./parseDwi.js";
import { parseSm } from "./parseSm.js";
import { parseSsc } from "./parseSsc.js";
import { Parser } from "./types.js";

/**
 * the higher an item is listed, the higher the preference
 * for using it when multiple are present in a song folder
 */
export const parsers: Record<string, Parser> = {
  ".ssc": parseSsc,
  ".sm": parseSm,
  ".dwi": parseDwi,
};

/**
 * sorted in order of preference
 */
export const supportedExtensions = Object.keys(parsers);

/**
 * Given two possible filenames, compare which is a higher priority candidate for providing the song info
 *
 * This prioritizes parsers above in order of their definition, and de-prioritizes files that begin with a period
 * @param a first item
 * @param b second item
 * @returns a number indicating sort position
 */
export function sortFileCandidatesByPriority(a: string, b: string): number {
  if (a.startsWith(".")) {
    return 1;
  }
  if (b.startsWith(".")) {
    return -1;
  }
  const indexA = supportedExtensions.indexOf(getExtension(a));
  const indexB = supportedExtensions.indexOf(getExtension(b));
  return indexA - indexB;
}

/**
 * naive version of `path.extname` for use in browser as well
 * @param name file name
 * @returns file extension, with period included
 */
function getExtension(name: string) {
  const match = name.match(/(\.\w+)$/);
  if (!match) {
    return "";
  }
  return match[1];
}
