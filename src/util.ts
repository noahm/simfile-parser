import Fraction from "fraction.js";
import { Arrow, Bpm, Difficulty } from "./types";

const beats = [
  new Fraction(1).div(4),
  new Fraction(1).div(6),
  new Fraction(1).div(8),
  new Fraction(1).div(12),
  new Fraction(1).div(16),
];

export function determineBeat(offset: Fraction): Arrow["beat"] {
  const match = beats.find((b) => offset.mod(b).n === 0);

  if (!match) {
    // didn't find anything? then it's a weirdo like a 5th note or 32nd note, they get colored
    // the same as 6ths
    return 6;
  }

  return match.d as Arrow["beat"];
}

export const normalizedDifficultyMap: Record<string, Difficulty> = {
  beginner: "beginner",
  easy: "basic",
  basic: "basic",
  trick: "difficult",
  another: "difficult",
  medium: "difficult",
  difficult: "expert",
  expert: "expert",
  maniac: "expert",
  ssr: "expert",
  hard: "expert",
  challenge: "challenge",
  smaniac: "challenge",
  // TODO: filter edits out altogether
  edit: "edit",
};

function similarBpm(a: Bpm, b: Bpm): boolean {
  return Math.abs(a.bpm - b.bpm) < 1;
}

export function mergeSimilarBpmRanges(bpm: Bpm[]): Bpm[] {
  return bpm.reduce<Bpm[]>((building, b, i, a) => {
    const prev = a[i - 1];
    const next = a[i + 1];

    if (prev && similarBpm(prev, b)) {
      // this bpm was merged on the last iteration, so skip it
      return building;
    }

    if (next && similarBpm(next, b)) {
      return building.concat({
        ...b,
        endOffset: next.endOffset,
      });
    }

    return building.concat(b);
  }, []);
}

export function printMaybeError(e: any) {
  if (e && typeof e.message === "string") {
    return `${e.message} ${e.stack}`;
  }
  return "mysterious non-error";
}
