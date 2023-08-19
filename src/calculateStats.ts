import { BeatOffset, Step, Stepchart, Stats } from "./types";

/**
 * Return the step from this beat if it is an only child
 *
 * @param b beat
 * @returns a step or undefined
 */
function getSingleStep(b: BeatOffset) {
  const steps = b.steps.filter((s) => !isObstacle(s));
  return steps.length === 1 && steps[0];
}

// eslint-disable-next-line jsdoc/require-jsdoc
function isObstacle(s: Step) {
  return s.type === "mine" || s.type === "minepit" || s.type === "lift";
}

// eslint-disable-next-line jsdoc/require-jsdoc
function isJump(d: BeatOffset): boolean {
  const realSteps = d.steps.reduce<number>((total, step) => {
    if (!isObstacle(step)) {
      return total + 1;
    }
    return total;
  }, 0);

  return realSteps === 2;
}

// eslint-disable-next-line jsdoc/require-jsdoc
function isGallop(
  curr: BeatOffset,
  parent: BeatOffset | undefined,
  grantparent: BeatOffset | undefined
): boolean {
  if (!parent) {
    return false;
  }

  if (curr.steps[0].quantization !== 4) {
    return false;
  }

  // jumps are never gallops
  if (isJump(curr)) {
    return false;
  }

  const currStep = getSingleStep(curr);
  const prevStep = getSingleStep(parent);

  if (!currStep || !prevStep) {
    return false;
  }

  // the gallop must move to a new direction,
  // otherwise it's at the least a mini jack
  if (currStep.direction === prevStep.direction) {
    return false;
  }

  if (prevStep.quantization >= 12) {
    // only consider it a gallop if it's isolated
    if (!grantparent || parent.offset - grantparent.offset >= 1 / 8) {
      return curr.offset - parent.offset < 1 / 8;
    }
  }

  return false;
}

// eslint-disable-next-line jsdoc/require-jsdoc
function isJack(curr: BeatOffset, prev: BeatOffset | undefined): boolean {
  if (!prev) {
    return false;
  }

  if (isJump(curr)) {
    return false;
  }

  const currSteps = curr.steps.filter((s) => !isObstacle(s));
  const prevSteps = prev.steps.filter((s) => !isObstacle(s));

  if (
    currSteps.length === 1 &&
    prevSteps.length === 1 &&
    currSteps[0].direction !== prevSteps[0].direction
  ) {
    return false;
  }

  return curr.offset - prev.offset <= 1 / 8;
}

/**
 * Calculate human-relevant stats for a given chart
 * @param chart parsed chart object
 * @returns counts for the number of jumps, jacks, freezes, and gallops
 */
export function calculateStats(chart: Stepchart): Stats {
  // TODO: extend to recognize crossovers, scoobies, and more tech?
  let jumps = 0;
  let freezes = 0;
  let rolls = 0;
  let mines = 0;
  let lifts = 0;
  for (const beat of chart.beats) {
    if (isJump(beat)) {
      jumps += 1;
    }
    for (const step of beat.steps) {
      switch (step.type) {
        case "freeze":
          freezes += 1;
          if (step.tailIsLift) {
            lifts += 1;
          }
          break;
        case "roll":
          rolls += 1;
          if (step.tailIsLift) {
            lifts += 1;
          }
          break;
        case "lift":
          lifts += 1;
          break;
        case "mine":
        case "minepit":
          mines += 1;
          break;
      }
    }
  }

  const gallops = chart.beats.filter((beat, i, array) =>
    isGallop(beat, array[i - 1], array[i - 2])
  );
  const jacks = chart.beats.filter((beat, i, array) =>
    isJack(beat, array[i - 1])
  );

  return {
    jumps,
    jacks: jacks.length,
    freezes,
    rolls,
    mines,
    lifts,
    gallops: gallops.length,
  };
}
