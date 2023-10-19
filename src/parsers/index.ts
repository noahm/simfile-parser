import { parseDwi } from "./parseDwi.js";
import { parseSm } from "./parseSm.js";
import { parseSsc } from "./parseSsc.js";
import { Parser } from "./types.js";

export const parsers: Record<string, Parser> = {
  ".sm": parseSm,
  ".ssc": parseSsc,
  ".dwi": parseDwi,
};

export const supportedExtensions = Object.keys(parsers);
