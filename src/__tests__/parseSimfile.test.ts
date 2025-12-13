/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as path from "path";
import { parseSong } from "../parseSong";
import { Simfile } from "../types";
import { setErrorTolerance } from "../util";

setErrorTolerance("ignore");
const packsRoot = path.resolve(import.meta.dirname, "../../packs");

// eslint-disable-next-line jsdoc/require-jsdoc
function scrubDataForSnapshot(simfile: Simfile, assertStepsExist = true) {
  // drop actual step info for a smaller snapshot
  Object.values(simfile.charts).forEach((chart) => {
    if (assertStepsExist) expect(chart.arrows).not.toHaveLength(0);
    chart.arrows = "REDACTED" as any;
  });
  simfile.title.titleDir = path.relative(packsRoot, simfile.title.titleDir);
}

describe("parseSong", () => {
  test("single old song", () => {
    const simfile = parseSong(path.join(packsRoot, "3rdMix", "AFRONOVA"))!;
    scrubDataForSnapshot(simfile);
    expect(simfile).toMatchInlineSnapshot(`
      {
        "artist": "RE-VENGE",
        "availableTypes": [
          {
            "difficulty": "beginner",
            "feet": 2,
            "mode": "single",
            "slug": "single-beginner",
          },
          {
            "difficulty": "basic",
            "feet": 5,
            "mode": "single",
            "slug": "single-basic",
          },
          {
            "difficulty": "difficult",
            "feet": 7,
            "mode": "single",
            "slug": "single-difficult",
          },
          {
            "difficulty": "expert",
            "feet": 9,
            "mode": "single",
            "slug": "single-expert",
          },
          {
            "difficulty": "basic",
            "feet": 6,
            "mode": "double",
            "slug": "double-basic",
          },
          {
            "difficulty": "difficult",
            "feet": 7,
            "mode": "double",
            "slug": "double-difficult",
          },
          {
            "difficulty": "expert",
            "feet": 9,
            "mode": "double",
            "slug": "double-expert",
          },
        ],
        "charts": {
          "double-basic": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": [],
            "stops": [],
          },
          "double-difficult": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": [],
            "stops": [],
          },
          "double-expert": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": [],
            "stops": [],
          },
          "single-basic": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": [],
            "stops": [],
          },
          "single-beginner": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": [],
            "stops": [],
          },
          "single-difficult": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": [],
            "stops": [],
          },
          "single-expert": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": [],
            "stops": [],
          },
        },
        "displayBpm": "200",
        "maxBpm": 200,
        "minBpm": 200,
        "stopCount": 0,
        "title": {
          "banner": "AFRONOVA.png",
          "bg": "AFRONOVA-bg.png",
          "jacket": null,
          "titleDir": "3rdMix/AFRONOVA",
          "titleName": "AFRONOVA",
          "translitTitleName": null,
        },
      }
    `);
  });

  test("single varied bpm song", () => {
    const simfile = parseSong(
      path.join(packsRoot, "A20-(beta)", "Silly Love"),
    )!;
    scrubDataForSnapshot(simfile);
    expect(simfile).toMatchInlineSnapshot(`
      {
        "artist": "DÉ DÉ MOUSE",
        "availableTypes": [
          {
            "difficulty": "beginner",
            "feet": 4,
            "mode": "single",
            "slug": "single-beginner",
          },
          {
            "difficulty": "basic",
            "feet": 7,
            "mode": "single",
            "slug": "single-basic",
          },
          {
            "difficulty": "difficult",
            "feet": 11,
            "mode": "single",
            "slug": "single-difficult",
          },
          {
            "difficulty": "expert",
            "feet": 14,
            "mode": "single",
            "slug": "single-expert",
          },
          {
            "difficulty": "basic",
            "feet": 7,
            "mode": "double",
            "slug": "double-basic",
          },
          {
            "difficulty": "difficult",
            "feet": 11,
            "mode": "double",
            "slug": "double-difficult",
          },
          {
            "difficulty": "expert",
            "feet": 14,
            "mode": "double",
            "slug": "double-expert",
          },
        ],
        "charts": {
          "double-basic": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 153,
                "endOffset": 44,
                "startOffset": -5,
              },
              {
                "bpm": 154,
                "endOffset": 44.75,
                "startOffset": 44,
              },
              {
                "bpm": 153,
                "endOffset": 51.5,
                "startOffset": 44.75,
              },
              {
                "bpm": 151.5,
                "endOffset": 52,
                "startOffset": 51.5,
              },
              {
                "bpm": 124,
                "endOffset": 60,
                "startOffset": 52,
              },
              {
                "bpm": 153,
                "endOffset": null,
                "startOffset": 60,
              },
            ],
            "freezes": [
              {
                "direction": 3,
                "endOffset": 12,
                "startOffset": 11.5,
              },
              {
                "direction": 4,
                "endOffset": 12,
                "startOffset": 11.5,
              },
              {
                "direction": 3,
                "endOffset": 12.75,
                "startOffset": 12,
              },
              {
                "direction": 1,
                "endOffset": 14.75,
                "startOffset": 14,
              },
              {
                "direction": 1,
                "endOffset": 16.75,
                "startOffset": 16,
              },
              {
                "direction": 3,
                "endOffset": 18.75,
                "startOffset": 18,
              },
              {
                "direction": 4,
                "endOffset": 27.5,
                "startOffset": 27,
              },
              {
                "direction": 5,
                "endOffset": 27.75,
                "startOffset": 27.25,
              },
              {
                "direction": 4,
                "endOffset": 46,
                "startOffset": 44.75,
              },
              {
                "direction": 5,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              {
                "direction": 6,
                "endOffset": 48,
                "startOffset": 46.75,
              },
              {
                "direction": 3,
                "endOffset": 69.25,
                "startOffset": 68,
              },
              {
                "direction": 4,
                "endOffset": 69.25,
                "startOffset": 68,
              },
            ],
            "stops": [],
          },
          "double-difficult": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 153,
                "endOffset": 44,
                "startOffset": -5,
              },
              {
                "bpm": 154,
                "endOffset": 44.75,
                "startOffset": 44,
              },
              {
                "bpm": 153,
                "endOffset": 51.5,
                "startOffset": 44.75,
              },
              {
                "bpm": 151.5,
                "endOffset": 52,
                "startOffset": 51.5,
              },
              {
                "bpm": 124,
                "endOffset": 60,
                "startOffset": 52,
              },
              {
                "bpm": 153,
                "endOffset": null,
                "startOffset": 60,
              },
            ],
            "freezes": [
              {
                "direction": 3,
                "endOffset": 4,
                "startOffset": 3.5,
              },
              {
                "direction": 4,
                "endOffset": 4,
                "startOffset": 3.5,
              },
              {
                "direction": 0,
                "endOffset": 8,
                "startOffset": 7.5,
              },
              {
                "direction": 3,
                "endOffset": 8,
                "startOffset": 7.5,
              },
              {
                "direction": 1,
                "endOffset": 12.125,
                "startOffset": 11.5,
              },
              {
                "direction": 1,
                "endOffset": 13.75,
                "startOffset": 12.875,
              },
              {
                "direction": 5,
                "endOffset": 15.75,
                "startOffset": 14.875,
              },
              {
                "direction": 3,
                "endOffset": 17.75,
                "startOffset": 16.875,
              },
              {
                "direction": 4,
                "endOffset": 19.75,
                "startOffset": 18.875,
              },
              {
                "direction": 2,
                "endOffset": 28.25,
                "startOffset": 27.75,
              },
              {
                "direction": 4,
                "endOffset": 36.25,
                "startOffset": 35.75,
              },
              {
                "direction": 5,
                "endOffset": 37,
                "startOffset": 36.5,
              },
              {
                "direction": 3,
                "endOffset": 39,
                "startOffset": 38.5,
              },
              {
                "direction": 3,
                "endOffset": 41,
                "startOffset": 40.5,
              },
              {
                "direction": 3,
                "endOffset": 43.5,
                "startOffset": 43,
              },
              {
                "direction": 4,
                "endOffset": 43.75,
                "startOffset": 43.25,
              },
              {
                "direction": 1,
                "endOffset": 45.75,
                "startOffset": 44.75,
              },
              {
                "direction": 0,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              {
                "direction": 1,
                "endOffset": 47.75,
                "startOffset": 46.75,
              },
              {
                "direction": 6,
                "endOffset": 57.5,
                "startOffset": 57,
              },
              {
                "direction": 5,
                "endOffset": 57.75,
                "startOffset": 57.25,
              },
              {
                "direction": 2,
                "endOffset": 69.25,
                "startOffset": 68,
              },
            ],
            "stops": [],
          },
          "double-expert": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 153,
                "endOffset": 44,
                "startOffset": -5,
              },
              {
                "bpm": 154,
                "endOffset": 44.75,
                "startOffset": 44,
              },
              {
                "bpm": 153,
                "endOffset": 51.5,
                "startOffset": 44.75,
              },
              {
                "bpm": 151.5,
                "endOffset": 52,
                "startOffset": 51.5,
              },
              {
                "bpm": 124,
                "endOffset": 60,
                "startOffset": 52,
              },
              {
                "bpm": 153,
                "endOffset": null,
                "startOffset": 60,
              },
            ],
            "freezes": [
              {
                "direction": 7,
                "endOffset": 1.125,
                "startOffset": 0.5,
              },
              {
                "direction": 0,
                "endOffset": 3.375,
                "startOffset": 2.875,
              },
              {
                "direction": 6,
                "endOffset": 5.125,
                "startOffset": 4.5,
              },
              {
                "direction": 3,
                "endOffset": 7.375,
                "startOffset": 6.875,
              },
              {
                "direction": 3,
                "endOffset": 9,
                "startOffset": 8.5,
              },
              {
                "direction": 6,
                "endOffset": 12.125,
                "startOffset": 11.5,
              },
              {
                "direction": 2,
                "endOffset": 13.5,
                "startOffset": 12.875,
              },
              {
                "direction": 3,
                "endOffset": 15.5,
                "startOffset": 14.875,
              },
              {
                "direction": 6,
                "endOffset": 17.5,
                "startOffset": 16.875,
              },
              {
                "direction": 4,
                "endOffset": 19.5,
                "startOffset": 18.875,
              },
              {
                "direction": 3,
                "endOffset": 20.4375,
                "startOffset": 20,
              },
              {
                "direction": 2,
                "endOffset": 20.9375,
                "startOffset": 20.5,
              },
              {
                "direction": 4,
                "endOffset": 21.4375,
                "startOffset": 21,
              },
              {
                "direction": 7,
                "endOffset": 22.4375,
                "startOffset": 22,
              },
              {
                "direction": 4,
                "endOffset": 22.9375,
                "startOffset": 22.5,
              },
              {
                "direction": 3,
                "endOffset": 23.4375,
                "startOffset": 23,
              },
              {
                "direction": 3,
                "endOffset": 24.4375,
                "startOffset": 24,
              },
              {
                "direction": 4,
                "endOffset": 24.9375,
                "startOffset": 24.5,
              },
              {
                "direction": 7,
                "endOffset": 25.4375,
                "startOffset": 25,
              },
              {
                "direction": 7,
                "endOffset": 28.9375,
                "startOffset": 28.5,
              },
              {
                "direction": 1,
                "endOffset": 30.9375,
                "startOffset": 30.5,
              },
              {
                "direction": 4,
                "endOffset": 32.9375,
                "startOffset": 32.5,
              },
              {
                "direction": 3,
                "endOffset": 34.9375,
                "startOffset": 34.5,
              },
              {
                "direction": 4,
                "endOffset": 42.9375,
                "startOffset": 42.5,
              },
              {
                "direction": 4,
                "endOffset": 45.5,
                "startOffset": 44.75,
              },
              {
                "direction": 3,
                "endOffset": 45.75,
                "startOffset": 44.75,
              },
              {
                "direction": 4,
                "endOffset": 46.5,
                "startOffset": 46,
              },
              {
                "direction": 5,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              {
                "direction": 5,
                "endOffset": 47.5,
                "startOffset": 46.75,
              },
              {
                "direction": 6,
                "endOffset": 47.5,
                "startOffset": 46.75,
              },
              {
                "direction": 5,
                "endOffset": 51.75,
                "startOffset": 50.875,
              },
              {
                "direction": 6,
                "endOffset": 51.75,
                "startOffset": 50.875,
              },
              {
                "direction": 3,
                "endOffset": 57.375,
                "startOffset": 57,
              },
              {
                "direction": 1,
                "endOffset": 57.625,
                "startOffset": 57.25,
              },
              {
                "direction": 3,
                "endOffset": 59.625,
                "startOffset": 59,
              },
              {
                "direction": 3,
                "endOffset": 61.75,
                "startOffset": 61.375,
              },
              {
                "direction": 4,
                "endOffset": 61.875,
                "startOffset": 61.5,
              },
              {
                "direction": 1,
                "endOffset": 62,
                "startOffset": 61.625,
              },
              {
                "direction": 2,
                "endOffset": 62.125,
                "startOffset": 61.75,
              },
              {
                "direction": 0,
                "endOffset": 62.25,
                "startOffset": 61.875,
              },
              {
                "direction": 1,
                "endOffset": 65.75,
                "startOffset": 65.375,
              },
              {
                "direction": 3,
                "endOffset": 65.875,
                "startOffset": 65.5,
              },
              {
                "direction": 4,
                "endOffset": 66,
                "startOffset": 65.625,
              },
              {
                "direction": 3,
                "endOffset": 66.125,
                "startOffset": 65.75,
              },
              {
                "direction": 1,
                "endOffset": 66.25,
                "startOffset": 65.875,
              },
              {
                "direction": 7,
                "endOffset": 69.25,
                "startOffset": 68,
              },
            ],
            "stops": [],
          },
          "single-basic": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 153,
                "endOffset": 44,
                "startOffset": -5,
              },
              {
                "bpm": 154,
                "endOffset": 44.75,
                "startOffset": 44,
              },
              {
                "bpm": 153,
                "endOffset": 51.5,
                "startOffset": 44.75,
              },
              {
                "bpm": 151.5,
                "endOffset": 52,
                "startOffset": 51.5,
              },
              {
                "bpm": 124,
                "endOffset": 60,
                "startOffset": 52,
              },
              {
                "bpm": 153,
                "endOffset": null,
                "startOffset": 60,
              },
            ],
            "freezes": [
              {
                "direction": 0,
                "endOffset": 12,
                "startOffset": 11.5,
              },
              {
                "direction": 3,
                "endOffset": 12,
                "startOffset": 11.5,
              },
              {
                "direction": 1,
                "endOffset": 13.25,
                "startOffset": 12,
              },
              {
                "direction": 2,
                "endOffset": 15.25,
                "startOffset": 14,
              },
              {
                "direction": 0,
                "endOffset": 17.25,
                "startOffset": 16,
              },
              {
                "direction": 3,
                "endOffset": 19.25,
                "startOffset": 18,
              },
              {
                "direction": 0,
                "endOffset": 27.5,
                "startOffset": 27,
              },
              {
                "direction": 3,
                "endOffset": 27.75,
                "startOffset": 27.25,
              },
              {
                "direction": 3,
                "endOffset": 46,
                "startOffset": 44.75,
              },
              {
                "direction": 0,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              {
                "direction": 3,
                "endOffset": 48,
                "startOffset": 46.75,
              },
              {
                "direction": 0,
                "endOffset": 52.5,
                "startOffset": 52,
              },
              {
                "direction": 3,
                "endOffset": 53,
                "startOffset": 52.5,
              },
              {
                "direction": 0,
                "endOffset": 53.5,
                "startOffset": 53,
              },
              {
                "direction": 3,
                "endOffset": 54,
                "startOffset": 53.5,
              },
              {
                "direction": 1,
                "endOffset": 54.5,
                "startOffset": 54,
              },
              {
                "direction": 2,
                "endOffset": 55,
                "startOffset": 54.5,
              },
              {
                "direction": 3,
                "endOffset": 55.5,
                "startOffset": 55,
              },
              {
                "direction": 1,
                "endOffset": 56,
                "startOffset": 55.5,
              },
              {
                "direction": 0,
                "endOffset": 56.5,
                "startOffset": 56,
              },
              {
                "direction": 3,
                "endOffset": 57,
                "startOffset": 56.5,
              },
              {
                "direction": 0,
                "endOffset": 57.5,
                "startOffset": 57,
              },
              {
                "direction": 3,
                "endOffset": 58,
                "startOffset": 57.5,
              },
              {
                "direction": 1,
                "endOffset": 69.25,
                "startOffset": 68,
              },
            ],
            "stops": [],
          },
          "single-beginner": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 153,
                "endOffset": 44,
                "startOffset": -5,
              },
              {
                "bpm": 154,
                "endOffset": 44.75,
                "startOffset": 44,
              },
              {
                "bpm": 153,
                "endOffset": 51.5,
                "startOffset": 44.75,
              },
              {
                "bpm": 151.5,
                "endOffset": 52,
                "startOffset": 51.5,
              },
              {
                "bpm": 124,
                "endOffset": 60,
                "startOffset": 52,
              },
              {
                "bpm": 153,
                "endOffset": null,
                "startOffset": 60,
              },
            ],
            "freezes": [
              {
                "direction": 0,
                "endOffset": 13.25,
                "startOffset": 12,
              },
              {
                "direction": 3,
                "endOffset": 15.25,
                "startOffset": 14,
              },
              {
                "direction": 2,
                "endOffset": 17.25,
                "startOffset": 16,
              },
              {
                "direction": 1,
                "endOffset": 19.25,
                "startOffset": 18,
              },
              {
                "direction": 0,
                "endOffset": 45.75,
                "startOffset": 44.75,
              },
              {
                "direction": 3,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              {
                "direction": 0,
                "endOffset": 47.75,
                "startOffset": 46.75,
              },
              {
                "direction": 2,
                "endOffset": 48.75,
                "startOffset": 48,
              },
              {
                "direction": 1,
                "endOffset": 49.75,
                "startOffset": 48.75,
              },
              {
                "direction": 3,
                "endOffset": 50.75,
                "startOffset": 50,
              },
              {
                "direction": 1,
                "endOffset": 69.25,
                "startOffset": 68,
              },
            ],
            "stops": [],
          },
          "single-difficult": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 153,
                "endOffset": 44,
                "startOffset": -5,
              },
              {
                "bpm": 154,
                "endOffset": 44.75,
                "startOffset": 44,
              },
              {
                "bpm": 153,
                "endOffset": 51.5,
                "startOffset": 44.75,
              },
              {
                "bpm": 151.5,
                "endOffset": 52,
                "startOffset": 51.5,
              },
              {
                "bpm": 124,
                "endOffset": 60,
                "startOffset": 52,
              },
              {
                "bpm": 153,
                "endOffset": null,
                "startOffset": 60,
              },
            ],
            "freezes": [
              {
                "direction": 0,
                "endOffset": 4,
                "startOffset": 3.5,
              },
              {
                "direction": 3,
                "endOffset": 4,
                "startOffset": 3.5,
              },
              {
                "direction": 0,
                "endOffset": 8,
                "startOffset": 7.5,
              },
              {
                "direction": 3,
                "endOffset": 8,
                "startOffset": 7.5,
              },
              {
                "direction": 1,
                "endOffset": 12.125,
                "startOffset": 11.5,
              },
              {
                "direction": 1,
                "endOffset": 13.75,
                "startOffset": 12.875,
              },
              {
                "direction": 0,
                "endOffset": 15.75,
                "startOffset": 14.875,
              },
              {
                "direction": 3,
                "endOffset": 17.75,
                "startOffset": 16.875,
              },
              {
                "direction": 1,
                "endOffset": 19.75,
                "startOffset": 18.875,
              },
              {
                "direction": 0,
                "endOffset": 28.25,
                "startOffset": 27.75,
              },
              {
                "direction": 1,
                "endOffset": 36.25,
                "startOffset": 35.75,
              },
              {
                "direction": 2,
                "endOffset": 37,
                "startOffset": 36.5,
              },
              {
                "direction": 1,
                "endOffset": 39,
                "startOffset": 38.5,
              },
              {
                "direction": 2,
                "endOffset": 41,
                "startOffset": 40.5,
              },
              {
                "direction": 0,
                "endOffset": 43.5,
                "startOffset": 43,
              },
              {
                "direction": 3,
                "endOffset": 43.75,
                "startOffset": 43.25,
              },
              {
                "direction": 0,
                "endOffset": 45.5,
                "startOffset": 44.75,
              },
              {
                "direction": 3,
                "endOffset": 45.75,
                "startOffset": 44.75,
              },
              {
                "direction": 2,
                "endOffset": 46.5,
                "startOffset": 46,
              },
              {
                "direction": 0,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              {
                "direction": 1,
                "endOffset": 47.5,
                "startOffset": 46.75,
              },
              {
                "direction": 2,
                "endOffset": 47.75,
                "startOffset": 46.75,
              },
              {
                "direction": 2,
                "endOffset": 57.5,
                "startOffset": 57,
              },
              {
                "direction": 1,
                "endOffset": 57.75,
                "startOffset": 57.25,
              },
              {
                "direction": 3,
                "endOffset": 69.25,
                "startOffset": 68,
              },
            ],
            "stops": [],
          },
          "single-expert": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 153,
                "endOffset": 44,
                "startOffset": -5,
              },
              {
                "bpm": 154,
                "endOffset": 44.75,
                "startOffset": 44,
              },
              {
                "bpm": 153,
                "endOffset": 51.5,
                "startOffset": 44.75,
              },
              {
                "bpm": 151.5,
                "endOffset": 52,
                "startOffset": 51.5,
              },
              {
                "bpm": 124,
                "endOffset": 60,
                "startOffset": 52,
              },
              {
                "bpm": 153,
                "endOffset": null,
                "startOffset": 60,
              },
            ],
            "freezes": [
              {
                "direction": 2,
                "endOffset": 0.5,
                "startOffset": 0,
              },
              {
                "direction": 2,
                "endOffset": 1.125,
                "startOffset": 0.5,
              },
              {
                "direction": 0,
                "endOffset": 3.375,
                "startOffset": 2.875,
              },
              {
                "direction": 1,
                "endOffset": 5.125,
                "startOffset": 4.5,
              },
              {
                "direction": 3,
                "endOffset": 7.375,
                "startOffset": 6.875,
              },
              {
                "direction": 0,
                "endOffset": 9,
                "startOffset": 8.5,
              },
              {
                "direction": 1,
                "endOffset": 12.125,
                "startOffset": 11.5,
              },
              {
                "direction": 0,
                "endOffset": 13.5,
                "startOffset": 12.875,
              },
              {
                "direction": 3,
                "endOffset": 15.5,
                "startOffset": 14.875,
              },
              {
                "direction": 1,
                "endOffset": 17.5,
                "startOffset": 16.875,
              },
              {
                "direction": 1,
                "endOffset": 19.5,
                "startOffset": 18.875,
              },
              {
                "direction": 3,
                "endOffset": 20.4375,
                "startOffset": 20,
              },
              {
                "direction": 2,
                "endOffset": 20.9375,
                "startOffset": 20.5,
              },
              {
                "direction": 1,
                "endOffset": 21.4375,
                "startOffset": 21,
              },
              {
                "direction": 3,
                "endOffset": 22.4375,
                "startOffset": 22,
              },
              {
                "direction": 1,
                "endOffset": 22.9375,
                "startOffset": 22.5,
              },
              {
                "direction": 3,
                "endOffset": 23.4375,
                "startOffset": 23,
              },
              {
                "direction": 3,
                "endOffset": 24.4375,
                "startOffset": 24,
              },
              {
                "direction": 3,
                "endOffset": 24.9375,
                "startOffset": 24.5,
              },
              {
                "direction": 2,
                "endOffset": 25.4375,
                "startOffset": 25,
              },
              {
                "direction": 1,
                "endOffset": 28.9375,
                "startOffset": 28.5,
              },
              {
                "direction": 1,
                "endOffset": 30.9375,
                "startOffset": 30.5,
              },
              {
                "direction": 2,
                "endOffset": 32.9375,
                "startOffset": 32.5,
              },
              {
                "direction": 0,
                "endOffset": 34.9375,
                "startOffset": 34.5,
              },
              {
                "direction": 3,
                "endOffset": 42.9375,
                "startOffset": 42.5,
              },
              {
                "direction": 1,
                "endOffset": 45.5,
                "startOffset": 44.75,
              },
              {
                "direction": 2,
                "endOffset": 45.75,
                "startOffset": 44.75,
              },
              {
                "direction": 1,
                "endOffset": 46.5,
                "startOffset": 46,
              },
              {
                "direction": 2,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              {
                "direction": 0,
                "endOffset": 47.5,
                "startOffset": 46.75,
              },
              {
                "direction": 3,
                "endOffset": 47.5,
                "startOffset": 46.75,
              },
              {
                "direction": 1,
                "endOffset": 51.75,
                "startOffset": 50.875,
              },
              {
                "direction": 2,
                "endOffset": 51.75,
                "startOffset": 50.875,
              },
              {
                "direction": 1,
                "endOffset": 57.375,
                "startOffset": 57,
              },
              {
                "direction": 2,
                "endOffset": 57.625,
                "startOffset": 57.25,
              },
              {
                "direction": 2,
                "endOffset": 59.625,
                "startOffset": 59,
              },
              {
                "direction": 1,
                "endOffset": 61.75,
                "startOffset": 61.375,
              },
              {
                "direction": 2,
                "endOffset": 61.875,
                "startOffset": 61.5,
              },
              {
                "direction": 0,
                "endOffset": 62,
                "startOffset": 61.625,
              },
              {
                "direction": 3,
                "endOffset": 62.125,
                "startOffset": 61.75,
              },
              {
                "direction": 2,
                "endOffset": 62.25,
                "startOffset": 61.875,
              },
              {
                "direction": 1,
                "endOffset": 65.75,
                "startOffset": 65.375,
              },
              {
                "direction": 3,
                "endOffset": 65.875,
                "startOffset": 65.5,
              },
              {
                "direction": 2,
                "endOffset": 66,
                "startOffset": 65.625,
              },
              {
                "direction": 1,
                "endOffset": 66.125,
                "startOffset": 65.75,
              },
              {
                "direction": 0,
                "endOffset": 66.25,
                "startOffset": 65.875,
              },
              {
                "direction": 3,
                "endOffset": 69.25,
                "startOffset": 68,
              },
            ],
            "stops": [],
          },
        },
        "displayBpm": "124-153",
        "maxBpm": 154,
        "minBpm": 124,
        "stopCount": 0,
        "title": {
          "banner": "Silly Love.png",
          "bg": "Silly Love-bg.png",
          "jacket": "Silly Love-jacket.png",
          "titleDir": "A20-(beta)/Silly Love",
          "titleName": "Silly Love",
          "translitTitleName": null,
        },
      }
    `);
  });

  test("single new song", () => {
    const simfile = parseSong(
      path.join(packsRoot, "Club Fantastic Season 2", "TerpZone"),
    )!;
    scrubDataForSnapshot(simfile);
    expect(simfile).toMatchInlineSnapshot(`
      {
        "artist": "Lindsay Lowend",
        "availableTypes": [
          {
            "difficulty": "challenge",
            "feet": 10,
            "mode": "double",
            "slug": "double-challenge",
          },
          {
            "difficulty": "challenge",
            "feet": 10,
            "mode": "single",
            "slug": "single-challenge",
          },
          {
            "difficulty": "beginner",
            "feet": 1,
            "mode": "single",
            "slug": "single-beginner",
          },
          {
            "difficulty": "expert",
            "feet": 8,
            "mode": "single",
            "slug": "single-expert",
          },
          {
            "difficulty": "basic",
            "feet": 4,
            "mode": "single",
            "slug": "single-basic",
          },
          {
            "difficulty": "difficult",
            "feet": 7,
            "mode": "single",
            "slug": "single-difficult",
          },
        ],
        "charts": {
          "double-challenge": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -3,
              },
            ],
            "freezes": [
              {
                "direction": 3,
                "endOffset": 8.875,
                "startOffset": 8.375,
              },
              {
                "direction": 4,
                "endOffset": 10,
                "startOffset": 9.625,
              },
              {
                "direction": 6,
                "endOffset": 10.75,
                "startOffset": 10,
              },
              {
                "direction": 2,
                "endOffset": 12.75,
                "startOffset": 12,
              },
              {
                "direction": 4,
                "endOffset": 41.875,
                "startOffset": 41.375,
              },
              {
                "direction": 4,
                "endOffset": 68.5,
                "startOffset": 68,
              },
              {
                "direction": 4,
                "endOffset": 72.5,
                "startOffset": 72,
              },
              {
                "direction": 3,
                "endOffset": 76.5,
                "startOffset": 76,
              },
              {
                "direction": 4,
                "endOffset": 80.25,
                "startOffset": 79,
              },
              {
                "direction": 2,
                "endOffset": 80.5625,
                "startOffset": 79,
              },
            ],
            "stops": [],
          },
          "single-basic": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -4,
              },
            ],
            "freezes": [
              {
                "direction": 0,
                "endOffset": 16.5,
                "startOffset": 16,
              },
              {
                "direction": 3,
                "endOffset": 16.75,
                "startOffset": 16.25,
              },
              {
                "direction": 0,
                "endOffset": 17,
                "startOffset": 16.5,
              },
              {
                "direction": 3,
                "endOffset": 17.25,
                "startOffset": 16.75,
              },
              {
                "direction": 0,
                "endOffset": 25.25,
                "startOffset": 24,
              },
              {
                "direction": 3,
                "endOffset": 42.25,
                "startOffset": 40,
              },
              {
                "direction": 0,
                "endOffset": 43.25,
                "startOffset": 42,
              },
              {
                "direction": 0,
                "endOffset": 62.5,
                "startOffset": 62,
              },
              {
                "direction": 3,
                "endOffset": 62.75,
                "startOffset": 62.25,
              },
              {
                "direction": 0,
                "endOffset": 63,
                "startOffset": 62.5,
              },
              {
                "direction": 3,
                "endOffset": 63.25,
                "startOffset": 62.75,
              },
            ],
            "stops": [],
          },
          "single-beginner": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -4,
              },
            ],
            "freezes": [],
            "stops": [],
          },
          "single-challenge": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 138,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": [
              {
                "direction": 2,
                "endOffset": 4.75,
                "startOffset": 4.25,
              },
              {
                "direction": 1,
                "endOffset": 5.25,
                "startOffset": 4.875,
              },
              {
                "direction": 0,
                "endOffset": 5.75,
                "startOffset": 5.25,
              },
              {
                "direction": 2,
                "endOffset": 6.375,
                "startOffset": 5.75,
              },
              {
                "direction": 2,
                "endOffset": 7,
                "startOffset": 6.25,
              },
              {
                "direction": 3,
                "endOffset": 7.5,
                "startOffset": 7,
              },
              {
                "direction": 0,
                "endOffset": 8.5,
                "startOffset": 8,
              },
              {
                "direction": 2,
                "endOffset": 9.25,
                "startOffset": 8.875,
              },
              {
                "direction": 0,
                "endOffset": 9.75,
                "startOffset": 9.25,
              },
              {
                "direction": 1,
                "endOffset": 10.375,
                "startOffset": 9.75,
              },
              {
                "direction": 1,
                "endOffset": 10.875,
                "startOffset": 10.25,
              },
              {
                "direction": 3,
                "endOffset": 11.375,
                "startOffset": 11,
              },
              {
                "direction": 2,
                "endOffset": 11.5,
                "startOffset": 11.125,
              },
              {
                "direction": 1,
                "endOffset": 11.625,
                "startOffset": 11.25,
              },
              {
                "direction": 3,
                "endOffset": 11.875,
                "startOffset": 11.40625,
              },
              {
                "direction": 3,
                "endOffset": 16.625,
                "startOffset": 16.125,
              },
              {
                "direction": 0,
                "endOffset": 16.875,
                "startOffset": 16.375,
              },
              {
                "direction": 3,
                "endOffset": 17.125,
                "startOffset": 16.625,
              },
              {
                "direction": 0,
                "endOffset": 17.25,
                "startOffset": 16.875,
              },
              {
                "direction": 2,
                "endOffset": 29.75,
                "startOffset": 29.25,
              },
              {
                "direction": 1,
                "endOffset": 30.25,
                "startOffset": 29.875,
              },
              {
                "direction": 0,
                "endOffset": 30.75,
                "startOffset": 30.25,
              },
              {
                "direction": 2,
                "endOffset": 31.375,
                "startOffset": 30.75,
              },
              {
                "direction": 2,
                "endOffset": 32,
                "startOffset": 31.25,
              },
              {
                "direction": 3,
                "endOffset": 32.5,
                "startOffset": 32,
              },
              {
                "direction": 0,
                "endOffset": 33.5,
                "startOffset": 33,
              },
              {
                "direction": 2,
                "endOffset": 34.25,
                "startOffset": 33.875,
              },
              {
                "direction": 0,
                "endOffset": 34.75,
                "startOffset": 34.25,
              },
              {
                "direction": 1,
                "endOffset": 35.375,
                "startOffset": 34.75,
              },
              {
                "direction": 1,
                "endOffset": 35.875,
                "startOffset": 35.25,
              },
              {
                "direction": 1,
                "endOffset": 36.875,
                "startOffset": 36.40625,
              },
              {
                "direction": 2,
                "endOffset": 37.75,
                "startOffset": 37.25,
              },
              {
                "direction": 1,
                "endOffset": 38.25,
                "startOffset": 37.875,
              },
              {
                "direction": 3,
                "endOffset": 38.75,
                "startOffset": 38.25,
              },
              {
                "direction": 2,
                "endOffset": 39.375,
                "startOffset": 38.75,
              },
              {
                "direction": 2,
                "endOffset": 40,
                "startOffset": 39.25,
              },
              {
                "direction": 3,
                "endOffset": 41.5,
                "startOffset": 41,
              },
              {
                "direction": 2,
                "endOffset": 42.25,
                "startOffset": 41.875,
              },
              {
                "direction": 3,
                "endOffset": 42.75,
                "startOffset": 42.25,
              },
              {
                "direction": 1,
                "endOffset": 43.375,
                "startOffset": 42.75,
              },
              {
                "direction": 1,
                "endOffset": 43.875,
                "startOffset": 43.25,
              },
              {
                "direction": 0,
                "endOffset": 44.375,
                "startOffset": 44,
              },
              {
                "direction": 2,
                "endOffset": 44.5,
                "startOffset": 44.125,
              },
              {
                "direction": 1,
                "endOffset": 44.59375,
                "startOffset": 44.25,
              },
              {
                "direction": 0,
                "endOffset": 44.875,
                "startOffset": 44.40625,
              },
              {
                "direction": 3,
                "endOffset": 45,
                "startOffset": 44.625,
              },
              {
                "direction": 2,
                "endOffset": 45.125,
                "startOffset": 44.75,
              },
              {
                "direction": 1,
                "endOffset": 46.25,
                "startOffset": 44.875,
              },
              {
                "direction": 3,
                "endOffset": 54.625,
                "startOffset": 54.125,
              },
              {
                "direction": 0,
                "endOffset": 54.875,
                "startOffset": 54.375,
              },
              {
                "direction": 3,
                "endOffset": 55.125,
                "startOffset": 54.625,
              },
              {
                "direction": 0,
                "endOffset": 55.25,
                "startOffset": 54.875,
              },
              {
                "direction": 2,
                "endOffset": 59.75,
                "startOffset": 59.375,
              },
              {
                "direction": 3,
                "endOffset": 59.875,
                "startOffset": 59.5,
              },
              {
                "direction": 0,
                "endOffset": 60,
                "startOffset": 59.625,
              },
              {
                "direction": 2,
                "endOffset": 60.125,
                "startOffset": 59.75,
              },
              {
                "direction": 1,
                "endOffset": 60.25,
                "startOffset": 59.875,
              },
              {
                "direction": 0,
                "endOffset": 60.5,
                "startOffset": 60,
              },
              {
                "direction": 1,
                "endOffset": 60.625,
                "startOffset": 60.25,
              },
              {
                "direction": 2,
                "endOffset": 60.875,
                "startOffset": 60.375,
              },
              {
                "direction": 0,
                "endOffset": 61,
                "startOffset": 60.625,
              },
              {
                "direction": 3,
                "endOffset": 61.125,
                "startOffset": 60.75,
              },
              {
                "direction": 2,
                "endOffset": 61.5,
                "startOffset": 60.875,
              },
              {
                "direction": 1,
                "endOffset": 61.625,
                "startOffset": 61.25,
              },
              {
                "direction": 0,
                "endOffset": 62,
                "startOffset": 61.375,
              },
              {
                "direction": 1,
                "endOffset": 62.125,
                "startOffset": 61.75,
              },
              {
                "direction": 2,
                "endOffset": 62.375,
                "startOffset": 61.875,
              },
              {
                "direction": 2,
                "endOffset": 63.75,
                "startOffset": 63.375,
              },
              {
                "direction": 0,
                "endOffset": 63.875,
                "startOffset": 63.5,
              },
              {
                "direction": 3,
                "endOffset": 64,
                "startOffset": 63.625,
              },
              {
                "direction": 2,
                "endOffset": 64.125,
                "startOffset": 63.75,
              },
              {
                "direction": 1,
                "endOffset": 64.25,
                "startOffset": 63.875,
              },
              {
                "direction": 3,
                "endOffset": 64.5,
                "startOffset": 64,
              },
              {
                "direction": 1,
                "endOffset": 64.625,
                "startOffset": 64.25,
              },
              {
                "direction": 2,
                "endOffset": 64.875,
                "startOffset": 64.375,
              },
              {
                "direction": 3,
                "endOffset": 65,
                "startOffset": 64.625,
              },
              {
                "direction": 0,
                "endOffset": 65.125,
                "startOffset": 64.75,
              },
              {
                "direction": 2,
                "endOffset": 65.375,
                "startOffset": 64.875,
              },
              {
                "direction": 3,
                "endOffset": 65.6875,
                "startOffset": 65.125,
              },
              {
                "direction": 3,
                "endOffset": 82.6875,
                "startOffset": 81.9375,
              },
              {
                "direction": 0,
                "endOffset": 83.125,
                "startOffset": 82,
              },
            ],
            "stops": [],
          },
          "single-difficult": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -4,
              },
            ],
            "freezes": [
              {
                "direction": 2,
                "endOffset": 17.25,
                "startOffset": 16.75,
              },
              {
                "direction": 1,
                "endOffset": 23.375,
                "startOffset": 22.875,
              },
              {
                "direction": 2,
                "endOffset": 23.625,
                "startOffset": 23.125,
              },
              {
                "direction": 2,
                "endOffset": 61.375,
                "startOffset": 60.875,
              },
              {
                "direction": 1,
                "endOffset": 61.625,
                "startOffset": 61.125,
              },
              {
                "direction": 1,
                "endOffset": 69.375,
                "startOffset": 68.875,
              },
              {
                "direction": 2,
                "endOffset": 69.625,
                "startOffset": 69.125,
              },
              {
                "direction": 1,
                "endOffset": 77.375,
                "startOffset": 76.875,
              },
              {
                "direction": 2,
                "endOffset": 77.75,
                "startOffset": 77.125,
              },
            ],
            "stops": [],
          },
          "single-expert": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -4,
              },
            ],
            "freezes": [
              {
                "direction": 2,
                "endOffset": 2.375,
                "startOffset": 1.75,
              },
              {
                "direction": 2,
                "endOffset": 3,
                "startOffset": 2.25,
              },
              {
                "direction": 0,
                "endOffset": 3.5,
                "startOffset": 3,
              },
              {
                "direction": 1,
                "endOffset": 3.875,
                "startOffset": 3.375,
              },
              {
                "direction": 1,
                "endOffset": 6.375,
                "startOffset": 5.75,
              },
              {
                "direction": 1,
                "endOffset": 7,
                "startOffset": 6.25,
              },
              {
                "direction": 0,
                "endOffset": 9.75,
                "startOffset": 9,
              },
              {
                "direction": 3,
                "endOffset": 10.5,
                "startOffset": 10,
              },
              {
                "direction": 3,
                "endOffset": 11.75,
                "startOffset": 11,
              },
              {
                "direction": 1,
                "endOffset": 12.625,
                "startOffset": 12.125,
              },
              {
                "direction": 3,
                "endOffset": 12.875,
                "startOffset": 12.375,
              },
              {
                "direction": 2,
                "endOffset": 13.125,
                "startOffset": 12.625,
              },
              {
                "direction": 0,
                "endOffset": 13.375,
                "startOffset": 12.875,
              },
              {
                "direction": 2,
                "endOffset": 17.75,
                "startOffset": 17.375,
              },
              {
                "direction": 3,
                "endOffset": 17.875,
                "startOffset": 17.5,
              },
              {
                "direction": 0,
                "endOffset": 18,
                "startOffset": 17.625,
              },
              {
                "direction": 2,
                "endOffset": 18.125,
                "startOffset": 17.75,
              },
              {
                "direction": 1,
                "endOffset": 18.25,
                "startOffset": 17.875,
              },
              {
                "direction": 0,
                "endOffset": 18.375,
                "startOffset": 18,
              },
              {
                "direction": 2,
                "endOffset": 18.625,
                "startOffset": 18.25,
              },
              {
                "direction": 0,
                "endOffset": 18.75,
                "startOffset": 18.375,
              },
              {
                "direction": 2,
                "endOffset": 19.125,
                "startOffset": 18.75,
              },
              {
                "direction": 3,
                "endOffset": 19.25,
                "startOffset": 18.875,
              },
              {
                "direction": 1,
                "endOffset": 19.625,
                "startOffset": 19.25,
              },
              {
                "direction": 3,
                "endOffset": 19.75,
                "startOffset": 19.375,
              },
              {
                "direction": 3,
                "endOffset": 20.125,
                "startOffset": 19.75,
              },
              {
                "direction": 0,
                "endOffset": 20.25,
                "startOffset": 19.875,
              },
              {
                "direction": 2,
                "endOffset": 21.75,
                "startOffset": 21.375,
              },
              {
                "direction": 0,
                "endOffset": 21.875,
                "startOffset": 21.5,
              },
              {
                "direction": 3,
                "endOffset": 22,
                "startOffset": 21.625,
              },
              {
                "direction": 2,
                "endOffset": 22.125,
                "startOffset": 21.75,
              },
              {
                "direction": 1,
                "endOffset": 22.25,
                "startOffset": 21.875,
              },
              {
                "direction": 3,
                "endOffset": 22.375,
                "startOffset": 22,
              },
              {
                "direction": 2,
                "endOffset": 22.625,
                "startOffset": 22.25,
              },
              {
                "direction": 3,
                "endOffset": 22.75,
                "startOffset": 22.375,
              },
              {
                "direction": 2,
                "endOffset": 23.125,
                "startOffset": 22.75,
              },
              {
                "direction": 0,
                "endOffset": 23.25,
                "startOffset": 22.875,
              },
              {
                "direction": 3,
                "endOffset": 23.5,
                "startOffset": 23.125,
              },
              {
                "direction": 2,
                "endOffset": 27.375,
                "startOffset": 26.75,
              },
              {
                "direction": 2,
                "endOffset": 28,
                "startOffset": 27.25,
              },
              {
                "direction": 3,
                "endOffset": 28.5,
                "startOffset": 28,
              },
              {
                "direction": 1,
                "endOffset": 28.875,
                "startOffset": 28.375,
              },
              {
                "direction": 1,
                "endOffset": 31.375,
                "startOffset": 30.75,
              },
              {
                "direction": 1,
                "endOffset": 32,
                "startOffset": 31.25,
              },
              {
                "direction": 2,
                "endOffset": 35.375,
                "startOffset": 34.75,
              },
              {
                "direction": 2,
                "endOffset": 36,
                "startOffset": 35.25,
              },
              {
                "direction": 2,
                "endOffset": 36.875,
                "startOffset": 36.375,
              },
              {
                "direction": 1,
                "endOffset": 39.375,
                "startOffset": 38.75,
              },
              {
                "direction": 1,
                "endOffset": 40,
                "startOffset": 39.25,
              },
              {
                "direction": 3,
                "endOffset": 42.25,
                "startOffset": 40.875,
              },
              {
                "direction": 0,
                "endOffset": 50.625,
                "startOffset": 50.125,
              },
              {
                "direction": 1,
                "endOffset": 50.875,
                "startOffset": 50.375,
              },
              {
                "direction": 3,
                "endOffset": 51.125,
                "startOffset": 50.625,
              },
              {
                "direction": 2,
                "endOffset": 51.25,
                "startOffset": 50.875,
              },
              {
                "direction": 0,
                "endOffset": 55.75,
                "startOffset": 55.375,
              },
              {
                "direction": 1,
                "endOffset": 55.875,
                "startOffset": 55.5,
              },
              {
                "direction": 2,
                "endOffset": 56,
                "startOffset": 55.625,
              },
              {
                "direction": 3,
                "endOffset": 56.125,
                "startOffset": 55.75,
              },
              {
                "direction": 1,
                "endOffset": 56.25,
                "startOffset": 55.875,
              },
              {
                "direction": 2,
                "endOffset": 56.5,
                "startOffset": 56,
              },
              {
                "direction": 3,
                "endOffset": 56.625,
                "startOffset": 56.25,
              },
              {
                "direction": 2,
                "endOffset": 56.875,
                "startOffset": 56.375,
              },
              {
                "direction": 0,
                "endOffset": 57,
                "startOffset": 56.625,
              },
              {
                "direction": 1,
                "endOffset": 57.125,
                "startOffset": 56.75,
              },
              {
                "direction": 2,
                "endOffset": 57.5,
                "startOffset": 56.875,
              },
              {
                "direction": 3,
                "endOffset": 57.625,
                "startOffset": 57.25,
              },
              {
                "direction": 0,
                "endOffset": 58,
                "startOffset": 57.375,
              },
              {
                "direction": 3,
                "endOffset": 58.125,
                "startOffset": 57.75,
              },
              {
                "direction": 2,
                "endOffset": 59,
                "startOffset": 57.875,
              },
              {
                "direction": 3,
                "endOffset": 59.75,
                "startOffset": 59.375,
              },
              {
                "direction": 1,
                "endOffset": 59.875,
                "startOffset": 59.5,
              },
              {
                "direction": 2,
                "endOffset": 60,
                "startOffset": 59.625,
              },
              {
                "direction": 0,
                "endOffset": 60.125,
                "startOffset": 59.75,
              },
              {
                "direction": 1,
                "endOffset": 60.25,
                "startOffset": 59.875,
              },
              {
                "direction": 2,
                "endOffset": 60.5,
                "startOffset": 60,
              },
              {
                "direction": 0,
                "endOffset": 60.625,
                "startOffset": 60.25,
              },
              {
                "direction": 2,
                "endOffset": 60.875,
                "startOffset": 60.375,
              },
              {
                "direction": 3,
                "endOffset": 61,
                "startOffset": 60.625,
              },
              {
                "direction": 1,
                "endOffset": 61.125,
                "startOffset": 60.75,
              },
              {
                "direction": 2,
                "endOffset": 61.375,
                "startOffset": 60.875,
              },
              {
                "direction": 3,
                "endOffset": 61.875,
                "startOffset": 61.125,
              },
              {
                "direction": 2,
                "endOffset": 63.75,
                "startOffset": 63.375,
              },
              {
                "direction": 3,
                "endOffset": 63.875,
                "startOffset": 63.5,
              },
              {
                "direction": 0,
                "endOffset": 64,
                "startOffset": 63.625,
              },
              {
                "direction": 2,
                "endOffset": 64.125,
                "startOffset": 63.75,
              },
              {
                "direction": 1,
                "endOffset": 64.25,
                "startOffset": 63.875,
              },
              {
                "direction": 0,
                "endOffset": 64.375,
                "startOffset": 64,
              },
              {
                "direction": 2,
                "endOffset": 64.625,
                "startOffset": 64.25,
              },
              {
                "direction": 0,
                "endOffset": 64.75,
                "startOffset": 64.375,
              },
              {
                "direction": 2,
                "endOffset": 65.125,
                "startOffset": 64.75,
              },
              {
                "direction": 3,
                "endOffset": 65.25,
                "startOffset": 64.875,
              },
              {
                "direction": 1,
                "endOffset": 65.625,
                "startOffset": 65.25,
              },
              {
                "direction": 3,
                "endOffset": 65.75,
                "startOffset": 65.375,
              },
              {
                "direction": 3,
                "endOffset": 66.125,
                "startOffset": 65.75,
              },
              {
                "direction": 0,
                "endOffset": 66.25,
                "startOffset": 65.875,
              },
              {
                "direction": 2,
                "endOffset": 67.75,
                "startOffset": 67.375,
              },
              {
                "direction": 0,
                "endOffset": 67.875,
                "startOffset": 67.5,
              },
              {
                "direction": 3,
                "endOffset": 68,
                "startOffset": 67.625,
              },
              {
                "direction": 2,
                "endOffset": 68.125,
                "startOffset": 67.75,
              },
              {
                "direction": 1,
                "endOffset": 68.25,
                "startOffset": 67.875,
              },
              {
                "direction": 3,
                "endOffset": 68.375,
                "startOffset": 68,
              },
              {
                "direction": 2,
                "endOffset": 68.625,
                "startOffset": 68.25,
              },
              {
                "direction": 3,
                "endOffset": 68.75,
                "startOffset": 68.375,
              },
              {
                "direction": 2,
                "endOffset": 69.125,
                "startOffset": 68.75,
              },
              {
                "direction": 0,
                "endOffset": 69.25,
                "startOffset": 68.875,
              },
              {
                "direction": 3,
                "endOffset": 69.5,
                "startOffset": 69.125,
              },
              {
                "direction": 2,
                "endOffset": 71.75,
                "startOffset": 71.375,
              },
              {
                "direction": 0,
                "endOffset": 71.875,
                "startOffset": 71.5,
              },
              {
                "direction": 3,
                "endOffset": 72,
                "startOffset": 71.625,
              },
              {
                "direction": 2,
                "endOffset": 72.125,
                "startOffset": 71.75,
              },
              {
                "direction": 1,
                "endOffset": 72.25,
                "startOffset": 71.875,
              },
              {
                "direction": 3,
                "endOffset": 72.375,
                "startOffset": 72,
              },
              {
                "direction": 2,
                "endOffset": 72.625,
                "startOffset": 72.25,
              },
              {
                "direction": 3,
                "endOffset": 72.75,
                "startOffset": 72.375,
              },
              {
                "direction": 2,
                "endOffset": 73.125,
                "startOffset": 72.75,
              },
              {
                "direction": 0,
                "endOffset": 73.25,
                "startOffset": 72.875,
              },
              {
                "direction": 1,
                "endOffset": 73.625,
                "startOffset": 73.25,
              },
              {
                "direction": 0,
                "endOffset": 73.75,
                "startOffset": 73.375,
              },
              {
                "direction": 0,
                "endOffset": 74.125,
                "startOffset": 73.75,
              },
              {
                "direction": 3,
                "endOffset": 74.25,
                "startOffset": 73.875,
              },
              {
                "direction": 2,
                "endOffset": 75.75,
                "startOffset": 75.375,
              },
              {
                "direction": 3,
                "endOffset": 75.875,
                "startOffset": 75.5,
              },
              {
                "direction": 0,
                "endOffset": 76,
                "startOffset": 75.625,
              },
              {
                "direction": 2,
                "endOffset": 76.125,
                "startOffset": 75.75,
              },
              {
                "direction": 1,
                "endOffset": 76.25,
                "startOffset": 75.875,
              },
              {
                "direction": 0,
                "endOffset": 76.375,
                "startOffset": 76,
              },
              {
                "direction": 2,
                "endOffset": 76.625,
                "startOffset": 76.25,
              },
              {
                "direction": 0,
                "endOffset": 76.75,
                "startOffset": 76.375,
              },
              {
                "direction": 2,
                "endOffset": 77.125,
                "startOffset": 76.75,
              },
              {
                "direction": 3,
                "endOffset": 77.25,
                "startOffset": 76.875,
              },
              {
                "direction": 0,
                "endOffset": 77.5,
                "startOffset": 77.125,
              },
              {
                "direction": 0,
                "endOffset": 78.75,
                "startOffset": 77.875,
              },
              {
                "direction": 3,
                "endOffset": 78.75,
                "startOffset": 78,
              },
            ],
            "stops": [],
          },
        },
        "displayBpm": "138",
        "maxBpm": 138,
        "minBpm": 138,
        "stopCount": 0,
        "title": {
          "banner": "bn.png",
          "bg": "bg.png",
          "jacket": "jacket.png",
          "titleDir": "Club Fantastic Season 2/TerpZone",
          "titleName": "TerpZone",
          "translitTitleName": null,
        },
      }
    `);
  });

  test("modern varied bpm song", () => {
    const simfile = parseSong(
      path.join(packsRoot, "BITE6 ITG Customs", "[T10] Neutrino"),
    )!;
    scrubDataForSnapshot(simfile);
    expect(simfile).toMatchInlineSnapshot(`
      {
        "artist": "HuΣeR",
        "availableTypes": [
          {
            "difficulty": "challenge",
            "feet": 14,
            "mode": "single",
            "slug": "single-challenge",
          },
        ],
        "charts": {
          "single-challenge": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 150,
                "endOffset": 32,
                "startOffset": 0,
              },
              {
                "bpm": 205,
                "endOffset": null,
                "startOffset": 32,
              },
            ],
            "freezes": [
              {
                "direction": 0,
                "endOffset": 8.75,
                "startOffset": 8,
              },
              {
                "direction": 2,
                "endOffset": 9.25,
                "startOffset": 8.53125,
              },
              {
                "direction": 1,
                "endOffset": 9.875,
                "startOffset": 9,
              },
              {
                "direction": 0,
                "endOffset": 10.125,
                "startOffset": 9.75,
              },
              {
                "direction": 3,
                "endOffset": 10.25,
                "startOffset": 9.875,
              },
              {
                "direction": 2,
                "endOffset": 10.5,
                "startOffset": 10.03125,
              },
              {
                "direction": 1,
                "endOffset": 10.75,
                "startOffset": 10.25,
              },
              {
                "direction": 0,
                "endOffset": 11,
                "startOffset": 10.53125,
              },
              {
                "direction": 1,
                "endOffset": 11.25,
                "startOffset": 10.75,
              },
              {
                "direction": 2,
                "endOffset": 11.5,
                "startOffset": 11,
              },
              {
                "direction": 0,
                "endOffset": 11.75,
                "startOffset": 11.28125,
              },
              {
                "direction": 2,
                "endOffset": 12,
                "startOffset": 11.5,
              },
              {
                "direction": 0,
                "endOffset": 12.75,
                "startOffset": 12,
              },
              {
                "direction": 2,
                "endOffset": 13.25,
                "startOffset": 12.53125,
              },
              {
                "direction": 1,
                "endOffset": 13.875,
                "startOffset": 13,
              },
              {
                "direction": 0,
                "endOffset": 14.5,
                "startOffset": 14,
              },
              {
                "direction": 2,
                "endOffset": 14.75,
                "startOffset": 14.25,
              },
              {
                "direction": 3,
                "endOffset": 15,
                "startOffset": 14.53125,
              },
              {
                "direction": 0,
                "endOffset": 15.25,
                "startOffset": 14.75,
              },
              {
                "direction": 0,
                "endOffset": 16.5,
                "startOffset": 16,
              },
              {
                "direction": 3,
                "endOffset": 17,
                "startOffset": 16.5,
              },
              {
                "direction": 2,
                "endOffset": 17.75,
                "startOffset": 17.25,
              },
              {
                "direction": 1,
                "endOffset": 19.875,
                "startOffset": 19.5,
              },
              {
                "direction": 2,
                "endOffset": 20,
                "startOffset": 19.625,
              },
              {
                "direction": 3,
                "endOffset": 21,
                "startOffset": 20.5,
              },
              {
                "direction": 0,
                "endOffset": 21.5,
                "startOffset": 21,
              },
              {
                "direction": 1,
                "endOffset": 21.75,
                "startOffset": 21.25,
              },
              {
                "direction": 2,
                "endOffset": 22.5,
                "startOffset": 22.03125,
              },
              {
                "direction": 1,
                "endOffset": 22.75,
                "startOffset": 22.25,
              },
              {
                "direction": 0,
                "endOffset": 23,
                "startOffset": 22.53125,
              },
              {
                "direction": 1,
                "endOffset": 23.25,
                "startOffset": 22.75,
              },
              {
                "direction": 0,
                "endOffset": 23.875,
                "startOffset": 23.5,
              },
              {
                "direction": 2,
                "endOffset": 24.125,
                "startOffset": 23.75,
              },
              {
                "direction": 1,
                "endOffset": 24.25,
                "startOffset": 23.875,
              },
              {
                "direction": 3,
                "endOffset": 25.75,
                "startOffset": 25.25,
              },
              {
                "direction": 0,
                "endOffset": 28.09375,
                "startOffset": 27.75,
              },
              {
                "direction": 0,
                "endOffset": 28.21875,
                "startOffset": 27.875,
              },
              {
                "direction": 2,
                "endOffset": 29,
                "startOffset": 28.5,
              },
              {
                "direction": 2,
                "endOffset": 30.5,
                "startOffset": 30.03125,
              },
              {
                "direction": 3,
                "endOffset": 30.75,
                "startOffset": 30.25,
              },
              {
                "direction": 2,
                "endOffset": 31,
                "startOffset": 30.53125,
              },
              {
                "direction": 1,
                "endOffset": 31.25,
                "startOffset": 30.75,
              },
              {
                "direction": 2,
                "endOffset": 31.875,
                "startOffset": 31.5,
              },
              {
                "direction": 3,
                "endOffset": 32.125,
                "startOffset": 31.75,
              },
              {
                "direction": 0,
                "endOffset": 32.208333333333336,
                "startOffset": 31.875,
              },
              {
                "direction": 0,
                "endOffset": 40.125,
                "startOffset": 39.75,
              },
              {
                "direction": 3,
                "endOffset": 40.25,
                "startOffset": 39.875,
              },
              {
                "direction": 0,
                "endOffset": 48.25,
                "startOffset": 47.5,
              },
              {
                "direction": 3,
                "endOffset": 55.875,
                "startOffset": 55.5,
              },
              {
                "direction": 0,
                "endOffset": 56,
                "startOffset": 55.625,
              },
              {
                "direction": 2,
                "endOffset": 56.125,
                "startOffset": 55.75,
              },
              {
                "direction": 1,
                "endOffset": 56.25,
                "startOffset": 55.875,
              },
              {
                "direction": 3,
                "endOffset": 64.25,
                "startOffset": 63.75,
              },
            ],
            "stops": [],
          },
        },
        "displayBpm": "150-205",
        "maxBpm": 205,
        "minBpm": 150,
        "stopCount": 0,
        "title": {
          "banner": "bn.png",
          "bg": "bg.png",
          "jacket": "",
          "titleDir": "BITE6 ITG Customs/[T10] Neutrino",
          "titleName": "[T10] Neutrino",
          "translitTitleName": null,
        },
      }
    `);
  });

  test("modern display bpm song", () => {
    const simfile = parseSong(
      path.join(packsRoot, "BITE6 ITG Customs", "[T11] Fracture Ray"),
    )!;
    scrubDataForSnapshot(simfile);
    expect(simfile).toMatchInlineSnapshot(`
      {
        "artist": "削除",
        "availableTypes": [
          {
            "difficulty": "challenge",
            "feet": 12,
            "mode": "single",
            "slug": "single-challenge",
          },
        ],
        "charts": {
          "single-challenge": {
            "arrows": "REDACTED",
            "bpm": [
              {
                "bpm": 50,
                "endOffset": 4,
                "startOffset": -1,
              },
              {
                "bpm": 25,
                "endOffset": 4.75,
                "startOffset": 4,
              },
              {
                "bpm": 16.667,
                "endOffset": 4.875,
                "startOffset": 4.75,
              },
              {
                "bpm": 50,
                "endOffset": 5,
                "startOffset": 4.875,
              },
              {
                "bpm": 100,
                "endOffset": 21,
                "startOffset": 5,
              },
              {
                "bpm": 50,
                "endOffset": 23,
                "startOffset": 21,
              },
              {
                "bpm": 100,
                "endOffset": 30,
                "startOffset": 23,
              },
              {
                "bpm": 50,
                "endOffset": 30.5,
                "startOffset": 30,
              },
              {
                "bpm": 100,
                "endOffset": 48.5,
                "startOffset": 30.5,
              },
              {
                "bpm": 50,
                "endOffset": null,
                "startOffset": 48.5,
              },
            ],
            "freezes": [
              {
                "direction": 3,
                "endOffset": 0.75,
                "startOffset": 0,
              },
              {
                "direction": 0,
                "endOffset": 1,
                "startOffset": 0.5,
              },
              {
                "direction": 0,
                "endOffset": 2,
                "startOffset": 1.5,
              },
              {
                "direction": 3,
                "endOffset": 5.1875,
                "startOffset": 4.875,
              },
              {
                "direction": 0,
                "endOffset": 5.4375,
                "startOffset": 5,
              },
              {
                "direction": 3,
                "endOffset": 5.75,
                "startOffset": 5.25,
              },
              {
                "direction": 1,
                "endOffset": 6.0625,
                "startOffset": 5.75,
              },
              {
                "direction": 0,
                "endOffset": 6.375,
                "startOffset": 6,
              },
              {
                "direction": 2,
                "endOffset": 6.75,
                "startOffset": 6.25,
              },
              {
                "direction": 3,
                "endOffset": 7.4375,
                "startOffset": 7,
              },
              {
                "direction": 0,
                "endOffset": 7.75,
                "startOffset": 7.25,
              },
              {
                "direction": 0,
                "endOffset": 8.5,
                "startOffset": 8,
              },
              {
                "direction": 2,
                "endOffset": 9.375,
                "startOffset": 9,
              },
              {
                "direction": 3,
                "endOffset": 9.625,
                "startOffset": 9.25,
              },
              {
                "direction": 3,
                "endOffset": 10.1875,
                "startOffset": 9.75,
              },
              {
                "direction": 2,
                "endOffset": 10.5,
                "startOffset": 10,
              },
              {
                "direction": 0,
                "endOffset": 11.5,
                "startOffset": 11,
              },
              {
                "direction": 2,
                "endOffset": 12.125,
                "startOffset": 11.75,
              },
              {
                "direction": 3,
                "endOffset": 12.5,
                "startOffset": 12,
              },
              {
                "direction": 2,
                "endOffset": 13.6875,
                "startOffset": 13.25,
              },
              {
                "direction": 2,
                "endOffset": 14.71875,
                "startOffset": 14.375,
              },
              {
                "direction": 3,
                "endOffset": 15.1875,
                "startOffset": 14.875,
              },
              {
                "direction": 2,
                "endOffset": 19.4375,
                "startOffset": 19,
              },
              {
                "direction": 2,
                "endOffset": 20,
                "startOffset": 19.625,
              },
              {
                "direction": 0,
                "endOffset": 20.5,
                "startOffset": 20.125,
              },
              {
                "direction": 1,
                "endOffset": 20.75,
                "startOffset": 20.3125,
              },
              {
                "direction": 3,
                "endOffset": 20.875,
                "startOffset": 20.5625,
              },
              {
                "direction": 3,
                "endOffset": 23.75,
                "startOffset": 23,
              },
              {
                "direction": 3,
                "endOffset": 24.5,
                "startOffset": 24,
              },
              {
                "direction": 2,
                "endOffset": 24.75,
                "startOffset": 24.25,
              },
              {
                "direction": 1,
                "endOffset": 25.125,
                "startOffset": 24.5,
              },
              {
                "direction": 0,
                "endOffset": 25.75,
                "startOffset": 25,
              },
              {
                "direction": 3,
                "endOffset": 26,
                "startOffset": 25.5,
              },
              {
                "direction": 1,
                "endOffset": 26.25,
                "startOffset": 25.75,
              },
              {
                "direction": 2,
                "endOffset": 26.5,
                "startOffset": 26,
              },
              {
                "direction": 1,
                "endOffset": 26.75,
                "startOffset": 26.25,
              },
              {
                "direction": 3,
                "endOffset": 27.125,
                "startOffset": 26.5,
              },
              {
                "direction": 0,
                "endOffset": 27.8125,
                "startOffset": 27,
              },
              {
                "direction": 1,
                "endOffset": 28,
                "startOffset": 27.5625,
              },
              {
                "direction": 2,
                "endOffset": 28.5,
                "startOffset": 28.0625,
              },
              {
                "direction": 0,
                "endOffset": 28.75,
                "startOffset": 28.25,
              },
              {
                "direction": 1,
                "endOffset": 29.125,
                "startOffset": 28.5,
              },
              {
                "direction": 0,
                "endOffset": 29.75,
                "startOffset": 29,
              },
              {
                "direction": 2,
                "endOffset": 30,
                "startOffset": 29.5,
              },
              {
                "direction": 1,
                "endOffset": 30.125,
                "startOffset": 29.75,
              },
              {
                "direction": 0,
                "endOffset": 31,
                "startOffset": 30.5,
              },
              {
                "direction": 0,
                "endOffset": 31.59375,
                "startOffset": 31.25,
              },
              {
                "direction": 1,
                "endOffset": 33,
                "startOffset": 32.5,
              },
              {
                "direction": 3,
                "endOffset": 33.9375,
                "startOffset": 33.5,
              },
              {
                "direction": 2,
                "endOffset": 34.625,
                "startOffset": 34.25,
              },
              {
                "direction": 1,
                "endOffset": 34.875,
                "startOffset": 34.5,
              },
              {
                "direction": 0,
                "endOffset": 35.125,
                "startOffset": 34.75,
              },
              {
                "direction": 2,
                "endOffset": 35.375,
                "startOffset": 35,
              },
              {
                "direction": 1,
                "endOffset": 35.65625,
                "startOffset": 35.25,
              },
              {
                "direction": 3,
                "endOffset": 37,
                "startOffset": 36.5,
              },
              {
                "direction": 2,
                "endOffset": 37.625,
                "startOffset": 37.25,
              },
              {
                "direction": 2,
                "endOffset": 37.9375,
                "startOffset": 37.5,
              },
              {
                "direction": 3,
                "endOffset": 40,
                "startOffset": 39.5,
              },
              {
                "direction": 2,
                "endOffset": 40.25,
                "startOffset": 39.75,
              },
              {
                "direction": 1,
                "endOffset": 40.375,
                "startOffset": 40,
              },
              {
                "direction": 0,
                "endOffset": 40.5,
                "startOffset": 40.125,
              },
              {
                "direction": 2,
                "endOffset": 40.625,
                "startOffset": 40.25,
              },
              {
                "direction": 3,
                "endOffset": 40.9375,
                "startOffset": 40.5,
              },
              {
                "direction": 3,
                "endOffset": 42.9375,
                "startOffset": 42.5,
              },
              {
                "direction": 3,
                "endOffset": 45.916666666666664,
                "startOffset": 45.5,
              },
              {
                "direction": 3,
                "endOffset": 46.75,
                "startOffset": 46.375,
              },
              {
                "direction": 1,
                "endOffset": 47.5,
                "startOffset": 47.125,
              },
              {
                "direction": 0,
                "endOffset": 49.5,
                "startOffset": 49,
              },
            ],
            "stops": [],
          },
        },
        "displayBpm": "50-100",
        "maxBpm": 100,
        "minBpm": 17,
        "stopCount": 0,
        "title": {
          "banner": "fracture-bn.png",
          "bg": "fracture-bg.png",
          "jacket": "",
          "titleDir": "BITE6 ITG Customs/[T11] Fracture Ray",
          "titleName": "[T11] Fracture Ray",
          "translitTitleName": null,
        },
      }
    `);
  });

  test("prefer newer file formats when multiple are available", () => {
    const simfile = parseSong(
      path.join(packsRoot, "Bhop Ball", "[T07] Ants (No CMOD)"),
    )!;
    scrubDataForSnapshot(simfile, false);
    expect(simfile.title.titleName).toBe("[T07] Ants (No CMOD)");
  });
});
