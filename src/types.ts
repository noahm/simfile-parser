export type Arrow = {
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
};

export type FreezeBody = {
  direction: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startOffset: number;
  endOffset: number;
};

export type Mode = "single" | "double";
export type Difficulty =
  | "beginner"
  | "basic"
  | "difficult"
  | "expert"
  | "challenge"
  | "edit";

export type StepchartType = {
  slug: string;
  mode: Mode;
  difficulty: Difficulty;
  feet: number;
};

export type Stats = {
  jumps: number;
  jacks: number;
  freezes: number;
  gallops: number;
};

export type Bpm = {
  startOffset: number;
  endOffset: number | null;
  bpm: number;
};

export type Stop = {
  offset: number;
  duration: number;
};

export type Stepchart = {
  arrows: Arrow[];
  freezes: FreezeBody[];
  bpm: Bpm[];
  stops: Stop[];
};

export type Simfile = {
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
};

export type Pack = {
  name: string;
  dir: string;
  songCount: number;
};

export type Title = {
  titleName: string;
  translitTitleName: string | null;
  titleDir: string;
  banner: string | null;
};

export type SongDifficultyType = {
  title: Title;
  pack: Pack;
  type: StepchartType;
};
