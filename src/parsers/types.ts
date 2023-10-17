import type { Simfile } from "../types.js";

export type RawSimfile = Omit<
  Simfile,
  "mix" | "title" | "minBpm" | "maxBpm"
> & {
  title: string;
  titletranslit: string | null;
  displayBpm: string | undefined;
  images: ParsedImages;
};

export interface ParsedImages {
  banner: string | null;
  bg: string | null;
  jacket: string | null;
}

export type Parser = (simfileSource: string, titleDir: string) => RawSimfile;
