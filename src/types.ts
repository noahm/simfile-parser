export interface Arrow {
  // other beats such as 5ths and 32nds end up being colored
  // the same as 6ths. This probably should be "color" not "beat" TODO
  beat: 4 | 6 | 8 | 12 | 16;
  direction:
    | `${0 | 1 | 2}${0 | 1 | 2}${0 | 1 | 2}${0 | 1 | 2}`
    | `${0 | 1 | 2}${0 | 1 | 2}${0 | 1 | 2}${0 | 1 | 2}${0 | 1 | 2}${
        | 0
        | 1
        | 2}${0 | 1 | 2}${0 | 1 | 2}`;
  offset: number;
}

export interface FreezeBody {
  direction: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
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

export interface Bpm {
  startOffset: number;
  endOffset: number | null;
  bpm: number;
}

export interface Stop {
  offset: number;
  duration: number;
}

export interface Stepchart {
  arrows: Arrow[];
  freezes: FreezeBody[];
  bpm: Bpm[];
  stops: Stop[];
}

export interface Simfile {
  title: Title;
  artist: string;
  pack: Pack;
  availableTypes: StepchartType[];
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
