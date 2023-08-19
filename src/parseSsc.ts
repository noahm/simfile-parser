import Fraction from "fraction.js";
import { Heaps } from "./data-structures/heaps";
import { RawSimfile } from "./parseSong";
import {
  ExtendedStep,
  Step,
  StepchartType,
  Stepchart,
  Mode,
  FreezeType,
  StepType,
  BeatOffset,
} from "./types";
import {
  determineBeat,
  mergeSimilarBpmRanges,
  normalizedDifficultyMap,
  printMaybeError,
  renameBackground,
  reportError,
} from "./util";

// Ref: https://github.com/stepmania/stepmania/wiki/ssc

// eslint-disable-next-line jsdoc/require-jsdoc
function isMetaTag(tag: string): tag is "title" | "titletranslit" | "artist" {
  return ["title", "titletranslit", "artist"].includes(tag);
}
// eslint-disable-next-line jsdoc/require-jsdoc
function isImageTag(tag: string): tag is "banner" | "background" | "jacket" {
  return ["banner", "background", "jacket"].includes(tag);
}
const chartTagsToConsume = ["stepstype", "difficulty", "meter"];

type ChartInProgress = Partial<StepchartType> & {
  chart?: Stepchart;
};

// eslint-disable-next-line jsdoc/require-jsdoc
function getStepType(notation: "1" | "M" | "L"): StepType {
  switch (notation) {
    case "1":
      return "tap";
    case "M":
      return "mine";
    case "L":
      return "lift";
  }
}
// eslint-disable-next-line jsdoc/require-jsdoc
function getFreezeType(notation: "2" | "4" | "DM"): FreezeType {
  switch (notation) {
    case "2":
      return "freeze";
    case "4":
      return "roll";
    case "DM":
      return "minepit";
  }
}

/**
 * does a given line count as the end of a notes tag/block?
 * @param line contents of the next line to check
 * @returns boolean
 */
function concludesANoteTag(line: string | undefined): boolean {
  if (line === undefined) {
    return true;
  }

  return line.startsWith(";") || line.startsWith(",;");
}

// eslint-disable-next-line jsdoc/require-jsdoc
function getMeasureLength(lines: string[], i: number): number {
  let measureLength = 0;

  for (
    ;
    i < lines.length && !concludesANoteTag(lines[i]) && lines[i][0] !== ",";
    ++i
  ) {
    if (lines[i].trim() !== "") {
      measureLength += 1;
    }
  }

  return measureLength;
}

// eslint-disable-next-line jsdoc/require-jsdoc
function trimNoteLine(line: string, mode: "single" | "double"): string {
  if (mode === "single") {
    return line.substring(0, 4);
  } else {
    return line.substring(0, 8);
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
function isRest(line: string): boolean {
  return line.split("").every((d) => d === "0");
}

/**
 * finds first non-empty measure in a chart
 * @param mode gameplay mode of this chart
 * @param lines all the lines in a current file
 * @param i starting line index
 * @returns line index for first step, and how many measures were passed in getting there
 */
function findFirstNonEmptyMeasure(
  mode: "single" | "double",
  lines: string[],
  i: number
): { firstNonEmptyMeasureIndex: number; numMeasuresSkipped: number } {
  let numMeasuresSkipped = 0;
  let measureIndex = i;

  for (; i < lines.length && !concludesANoteTag(lines[i]); ++i) {
    const line = lines[i];
    if (line.trim() === "") {
      continue;
    }

    if (line.startsWith(",")) {
      measureIndex = i + 1;
      numMeasuresSkipped += 1;
      continue;
    }

    if (!isRest(trimNoteLine(line, mode))) {
      return { firstNonEmptyMeasureIndex: measureIndex, numMeasuresSkipped };
    }
  }

  throw new Error(
    "findFirstNonEmptyMeasure, failed to find a non-empty measure in entire song"
  );
}

/**
 * parse a SSC file
 * @param ssc entire contents of the file
 * @returns parsed simfile object
 */
export function parseSsc(ssc: string): RawSimfile {
  const lines = ssc.split("\n").map((l) => l.trim());

  let i = 0;
  let bpmString: string | null = null;
  let stopsString: string | null = null;

  const sc: Partial<RawSimfile> &
    Pick<RawSimfile, "images" | "charts" | "availableTypes"> = {
    charts: {},
    availableTypes: [],
    images: {
      banner: null,
      bg: null,
      jacket: null,
    },
  };

  /**
   * parse out bpm stops
   * @param stopsString input string
   * @param emptyOffsetInMeasures number of empty measures at the head of this chart
   * @returns list of stop locations and durations
   */
  function parseStops(
    stopsString: string | null,
    emptyOffsetInMeasures: number
  ) {
    if (!stopsString) {
      return [];
    }

    const entries = stopsString.split(",");

    return entries.map((s) => {
      const [stopS, durationS] = s.split("=");
      return {
        offset: Number(stopS) * 0.25 - emptyOffsetInMeasures,
        duration: Number(durationS),
      };
    });
  }

  /**
   * parse a sequence of bpm changes
   * @param bpmString input string
   * @param emptyOffsetInMeasures number of empty measures at the head of this chart
   * @returns a sequence of bpm segments
   */
  function parseBpms(bpmString: string, emptyOffsetInMeasures: number) {
    const entries = bpmString.split(",");

    const bpms = entries.map((e, i, a) => {
      const [beatS, bpmS] = e.split("=");
      const nextBeatS = a[i + 1]?.split("=")[0] ?? null;

      return {
        startOffset: Number(beatS) * 0.25 - emptyOffsetInMeasures,
        endOffset:
          nextBeatS === null
            ? null
            : Number(nextBeatS) * 0.25 - emptyOffsetInMeasures,
        bpm: Number(bpmS),
      };
    });

    return mergeSimilarBpmRanges(bpms);
  }

  /**
   * Parse notes info for a chart
   * @param lines all lines of current file
   * @param i current line
   * @param bpmString string of bpm changes for this chart
   * @param mode chart's gameplay mode, for reporting only
   * @param difficulty chart's difficulty category, for reporting only
   * @returns number of lines parsed
   */
  function parseNotes(
    lines: string[],
    i: number,
    bpmString: string,
    mode?: string,
    difficulty?: string
  ): number {
    if (!currentChart || !currentChart.mode || !currentChart.difficulty) {
      throw new Error(
        "parseSsc: Can't parse notes before mode and difficulty are ready"
      );
    }
    // move past #NOTES into the note metadata
    i++;
    // now i is pointing at the first measure

    const steps = new Heaps<number, Step>();
    const openExtendedSteps = new Map<number, ExtendedStep | undefined>();

    const { firstNonEmptyMeasureIndex, numMeasuresSkipped } =
      findFirstNonEmptyMeasure(currentChart.mode, lines, i);
    i = firstNonEmptyMeasureIndex;

    const firstMeasureIndex = i;
    let curOffset = new Fraction(0);
    // in case the measure is size zero, fall back to dividing by one
    // this is just being defensive, this would mean the stepfile has no notes in it
    let curMeasureFraction = new Fraction(1).div(
      getMeasureLength(lines, i) || 1
    );

    for (; i < lines.length && !concludesANoteTag(lines[i]); ++i) {
      // for now, remove freeze ends as they are handled in parseFreezes
      // TODO: deal with freezes here, no need to have two functions doing basically the same thing
      const line = trimNoteLine(lines[i], currentChart.mode).replace(/3/g, "0");

      if (line.trim() === "") {
        continue;
      }

      if (line.startsWith(",")) {
        curMeasureFraction = new Fraction(1).div(
          getMeasureLength(lines, i + 1) || 1
        );
        continue;
      }

      const quantization = determineBeat(curOffset);

      let direction = 0;
      for (let d = 0; d < line.length; ++d, direction++) {
        let notation = line[d];
        if (notation === "D") {
          // read next character into notation, for DM (minepit head) or DL (hold tail with lift)
          notation += line[++d];
        }
        // skip over attacks
        if (notation === "{") {
          d = notation.indexOf("}", d);
          if (d < 0) {
            throw new Error("malformed attack syntax");
          }
          notation = line[++d];
        }
        // skip over keysounds
        if (notation === "[") {
          d = notation.indexOf("]", d);
          if (d < 0) {
            throw new Error("malformed keysound syntax");
          }
          notation = line[++d];
        }

        const currentOffset = curOffset.n / curOffset.d;

        switch (notation) {
          case "1":
          case "M":
          case "L":
            steps.add(currentOffset, {
              type: getStepType(notation),
              quantization,
              offset: currentOffset,
              direction,
            });
            break;
          case "2":
          case "4":
          case "DM": {
            if (openExtendedSteps.has(d)) {
              reportError(
                `${sc.title}, ${mode}, ${difficulty} -- error parsing freezes, found a new starting freeze before a previous one finished`
              );
            } else {
              openExtendedSteps.set(d, {
                quantization,
                type: getFreezeType(notation),
                direction,
                offset: curOffset.n / curOffset.d,
                endOffset: 0, // TBD
              });
            }
            break;
          }
          case "DL":
          case "3": {
            const thisFreeze = openExtendedSteps.get(d);
            if (!thisFreeze) {
              reportError(
                `${sc.title}, ${mode}, ${difficulty} -- error parsing freezes at offset ${i}, tried to close a freeze that never opened`
              );
            } else {
              const endBeatFraction = curOffset.add(new Fraction(1).div(4));
              thisFreeze.endOffset = endBeatFraction.n / endBeatFraction.d;
              steps.add(thisFreeze.offset, thisFreeze);
              openExtendedSteps.delete(d);
            }
            break;
          }
        }
      }

      curOffset = curOffset.add(curMeasureFraction);
    }

    const beats = Array.from(steps.entries())
      .map<BeatOffset>(([offset, steps]) => ({
        offset,
        steps,
      }))
      .sort((a, b) => a.offset - b.offset);

    currentChart.chart = {
      beats,
      bpm: parseBpms(bpmString, numMeasuresSkipped),
      stops: parseStops(stopsString, numMeasuresSkipped),
    };

    return i + 1;
  }

  let currentChart: ChartInProgress | null = null;
  /**
   * commits currentChart to output & sets a new blank currentChart
   */
  function startNextChart() {
    if (currentChart) {
      const { chart, ...info } = currentChart;
      if (!chart) {
        reportError("incomplete chart info available");
      } else {
        info.slug = `${info.mode}-${info.difficulty}`;
        sc.charts[info.slug] = chart;
        sc.availableTypes.push(info as StepchartType);
      }
    }
    currentChart = {};
  }
  /**
   * Add metadata to currentChart
   * @param key tag name
   * @param value tag value
   */
  function consumeChartTag(key: string, value: string) {
    if (!currentChart) {
      throw new Error("parseSsc: got chart tag before start of first chart");
    }
    switch (key) {
      case "stepstype":
        currentChart.mode = value.replace("dance-", "") as Mode;
        break;
      case "difficulty":
        currentChart.difficulty = normalizedDifficultyMap[value.toLowerCase()];
        break;
      case "meter":
        currentChart.feet = Number(value);
        break;
    }
  }

  /**
   * @param lines all lines of the file at hand
   * @param index current line number
   * @returns number of lines consumed
   */
  function parseTag(lines: string[], index: number): number {
    const line = lines[index];

    const r = /#([A-Za-z]+):([^;]*)/;
    const result = r.exec(line);

    if (result) {
      const tag = result[1].toLowerCase();
      const value = result[2];

      if (isMetaTag(tag)) {
        if (value) {
          sc[tag] = value;
        }
      } else if (isImageTag(tag)) {
        // @ts-expect-error: background is not an output value, will be cleaned up later
        sc.images[tag] = value;
      } else if (chartTagsToConsume.includes(tag)) {
        consumeChartTag(tag, value);
      } else if (tag === "displaybpm") {
        sc.displayBpm = value.replace(":", "-");
      } else if (tag === "bpms") {
        bpmString = value;
      } else if (tag === "stops") {
        stopsString = value;
      } else if (tag === "notedata") {
        startNextChart();
      } else if (tag === "notes") {
        if (!bpmString) {
          throw new Error("parseSsc: about to parse notes but never got bpm");
        }
        return parseNotes(
          lines,
          index,
          bpmString,
          currentChart?.mode,
          currentChart?.difficulty
        );
      }
    }

    return index + 1;
  }

  try {
    while (i < lines.length) {
      const line = lines[i];

      if (!line.length || line.startsWith("//")) {
        i += 1;
        continue;
      }

      if (line.startsWith("#")) {
        i = parseTag(lines, i);
      } else {
        i += 1;
      }
    }

    // commit last pending chart, if it exists
    if (currentChart) {
      startNextChart();
    }
    renameBackground(sc.images);
    return sc as RawSimfile;
  } catch (e) {
    throw new Error(
      `error parsing ${ssc.substring(0, 300)}\n${printMaybeError(e)}`
    );
  }
}
