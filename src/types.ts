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

export interface Pack {
  name: string;
  dir: string;
  songCount: number;
}

export interface Title {
  titleName: string;
  translitTitleName: string | null;
  titleDir: string;
  banner: string | null;
  bg: string | null;
  jacket: string | null;
}
