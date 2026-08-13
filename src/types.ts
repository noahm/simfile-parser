export const enum ArrowType {
  Empty = 0,
  Step = 1,
  Mine = 2,
}
export type ArrowRow = `${ArrowType}${ArrowType}${ArrowType}${ArrowType}`;

/**
 * One of the 8 columns of doubles play, 0 is p1 left, 7 p2 right
 */
export type ArrowColumn = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Arrow {
  /**
   * Mostly useful for color-coding an arrow.
   * Anything that doesn't cleanly fit one of
   * the possible types will be reported as a 64th.
   */
  quantization: 4 | 6 | 8 | 12 | 16 | 32 | 64;
  direction: ArrowRow | `${ArrowRow}${ArrowRow}`;
  offset: number;
}

export interface FreezeLocation {
  direction: ArrowColumn;
  startOffset: number;
  endOffset: number;
}

export type Mode = "single" | "double";
export type Difficulty =
  | "beginner"
  | "basic"
  | "difficult"
  | "expert"
  | "challenge"
  | "edit";

export interface StepchartType {
  slug: string;
  mode: Mode;
  difficulty: Difficulty;
  feet: number;
}

export interface Stats {
  jumps: number;
  jacks: number;
  freezes: number;
  gallops: number;
}

export interface BpmChange {
  startOffset: number;
  /** null if it lasts through the end of the song */
  endOffset: number | null;
  bpm: number;
}

export interface Stop {
  offset: number;
  duration: number;
}

export interface Stepchart {
  arrows: Arrow[];
  freezes: FreezeLocation[];
  /** all bpm speeds that exist within the song, and the start/end of each */
  bpm: BpmChange[];
  /** all locations at which the note field stops, and the duration of each */
  stops: Stop[];
}

export interface Simfile {
  /** metadata about the song */
  title: Title;
  subtitle: Subtitle;
  artist: string;
  /** metadata about the song's parent pack */
  pack: Pack;
  /** list all available charts */
  availableTypes: StepchartType[];
  /** dict of charts, keyed by `Difficulty` type */
  charts: Record<string, Stepchart>;
  minBpm: number;
  maxBpm: number;
  displayBpm: string;
  stopCount: number;
  stats: Stats;
}

/**
 * A reference to an image belonging to a song. The contents are read on
 * demand, so an image found while parsing is only loaded off disk or
 * decompressed out of an archive if something actually asks for it.
 */
export interface ImageRef {
  /** the image's own filename, e.g. `DDRMAX2-bn.png` */
  name: string;
  /** where the image lives on disk, or null if it came out of an archive */
  path: string | null;
  /** reads the image's contents */
  file(): Promise<File>;
}

export interface Pack {
  name: string;
  /** the name of the folder the pack lives in */
  dir: string;
  /** the pack folder's path on disk, or null if it came out of an archive */
  path: string | null;
  songCount: number;
}

export interface Title {
  titleName: string;
  translitTitleName: string | null;
  /** the name of the folder the song lives in */
  titleDir: string;
  /** the song folder's path on disk, or null if it came out of an archive */
  titlePath: string | null;
  banner: ImageRef | null;
  bg: ImageRef | null;
  jacket: ImageRef | null;
}

export interface Subtitle {
  subtitleName: string;
  translitSubtitleName: string | null;
}
