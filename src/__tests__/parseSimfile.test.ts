import * as path from "path";
import { parseSong } from "../parseSong";
import { Simfile } from "../types";
import { setErrorTolerance } from "../util";

setErrorTolerance("ignore");
const packsRoot = path.resolve(__dirname, "../../packs");

function scrubDataForSnapshot(simfile: Simfile) {
  // drop actual step info for a smaller snapshot
  Object.values(simfile.charts).forEach((chart) => {
    expect(chart.arrows).not.toHaveLength(0);
    chart.arrows = "REDACTED" as any;
  });
  simfile.title.titleDir = path.relative(packsRoot, simfile.title.titleDir);
}

describe("parseSong", () => {
  test("single old song", () => {
    const simfile = parseSong(path.join(packsRoot, "3rdMix", "AFRONOVA"));
    scrubDataForSnapshot(simfile);
    expect(simfile).toMatchInlineSnapshot(`
      Object {
        "artist": "RE-VENGE",
        "availableTypes": Array [
          Object {
            "difficulty": "beginner",
            "feet": 2,
            "mode": "single",
            "slug": "single-beginner",
          },
          Object {
            "difficulty": "basic",
            "feet": 5,
            "mode": "single",
            "slug": "single-basic",
          },
          Object {
            "difficulty": "difficult",
            "feet": 7,
            "mode": "single",
            "slug": "single-difficult",
          },
          Object {
            "difficulty": "expert",
            "feet": 9,
            "mode": "single",
            "slug": "single-expert",
          },
          Object {
            "difficulty": "basic",
            "feet": 6,
            "mode": "double",
            "slug": "double-basic",
          },
          Object {
            "difficulty": "difficult",
            "feet": 7,
            "mode": "double",
            "slug": "double-difficult",
          },
          Object {
            "difficulty": "expert",
            "feet": 9,
            "mode": "double",
            "slug": "double-expert",
          },
        ],
        "charts": Object {
          "double-basic": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": Array [],
            "stops": Array [],
          },
          "double-difficult": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": Array [],
            "stops": Array [],
          },
          "double-expert": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": Array [],
            "stops": Array [],
          },
          "single-basic": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": Array [],
            "stops": Array [],
          },
          "single-beginner": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": Array [],
            "stops": Array [],
          },
          "single-difficult": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": Array [],
            "stops": Array [],
          },
          "single-expert": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 200,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": Array [],
            "stops": Array [],
          },
        },
        "displayBpm": "200",
        "maxBpm": 200,
        "minBpm": 200,
        "stopCount": 0,
        "title": Object {
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

  test("single new song", () => {
    const simfile = parseSong(
      path.join(packsRoot, "Club Fantastic Season 2", "TerpZone")
    );
    scrubDataForSnapshot(simfile);
    expect(simfile).toMatchInlineSnapshot(`
      Object {
        "artist": "Lindsay Lowend",
        "availableTypes": Array [
          Object {
            "difficulty": "challenge",
            "feet": 10,
            "mode": "double",
            "slug": "double-challenge",
          },
          Object {
            "difficulty": "challenge",
            "feet": 10,
            "mode": "single",
            "slug": "single-challenge",
          },
          Object {
            "difficulty": "beginner",
            "feet": 1,
            "mode": "single",
            "slug": "single-beginner",
          },
          Object {
            "difficulty": "expert",
            "feet": 8,
            "mode": "single",
            "slug": "single-expert",
          },
          Object {
            "difficulty": "basic",
            "feet": 4,
            "mode": "single",
            "slug": "single-basic",
          },
        ],
        "charts": Object {
          "double-challenge": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -3,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 3,
                "endOffset": 8.875,
                "startOffset": 8.375,
              },
              Object {
                "direction": 4,
                "endOffset": 10,
                "startOffset": 9.625,
              },
              Object {
                "direction": 6,
                "endOffset": 10.75,
                "startOffset": 10,
              },
              Object {
                "direction": 2,
                "endOffset": 12.75,
                "startOffset": 12,
              },
              Object {
                "direction": 4,
                "endOffset": 41.875,
                "startOffset": 41.375,
              },
              Object {
                "direction": 4,
                "endOffset": 68.5,
                "startOffset": 68,
              },
              Object {
                "direction": 4,
                "endOffset": 72.5,
                "startOffset": 72,
              },
              Object {
                "direction": 3,
                "endOffset": 76.5,
                "startOffset": 76,
              },
              Object {
                "direction": 4,
                "endOffset": 80.25,
                "startOffset": 79,
              },
              Object {
                "direction": 2,
                "endOffset": 80.5625,
                "startOffset": 79,
              },
            ],
            "stops": Array [],
          },
          "single-basic": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -4,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 0,
                "endOffset": 16.5,
                "startOffset": 16,
              },
              Object {
                "direction": 3,
                "endOffset": 16.75,
                "startOffset": 16.25,
              },
              Object {
                "direction": 0,
                "endOffset": 17,
                "startOffset": 16.5,
              },
              Object {
                "direction": 3,
                "endOffset": 17.25,
                "startOffset": 16.75,
              },
              Object {
                "direction": 0,
                "endOffset": 25.25,
                "startOffset": 24,
              },
              Object {
                "direction": 3,
                "endOffset": 42.25,
                "startOffset": 40,
              },
              Object {
                "direction": 0,
                "endOffset": 43.25,
                "startOffset": 42,
              },
              Object {
                "direction": 0,
                "endOffset": 62.5,
                "startOffset": 62,
              },
              Object {
                "direction": 3,
                "endOffset": 62.75,
                "startOffset": 62.25,
              },
              Object {
                "direction": 0,
                "endOffset": 63,
                "startOffset": 62.5,
              },
              Object {
                "direction": 3,
                "endOffset": 63.25,
                "startOffset": 62.75,
              },
            ],
            "stops": Array [],
          },
          "single-beginner": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -4,
              },
            ],
            "freezes": Array [],
            "stops": Array [],
          },
          "single-challenge": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 138,
                "endOffset": null,
                "startOffset": 0,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 2,
                "endOffset": 4.75,
                "startOffset": 4.25,
              },
              Object {
                "direction": 1,
                "endOffset": 5.25,
                "startOffset": 4.875,
              },
              Object {
                "direction": 0,
                "endOffset": 5.75,
                "startOffset": 5.25,
              },
              Object {
                "direction": 2,
                "endOffset": 6.375,
                "startOffset": 5.75,
              },
              Object {
                "direction": 2,
                "endOffset": 7,
                "startOffset": 6.25,
              },
              Object {
                "direction": 3,
                "endOffset": 7.5,
                "startOffset": 7,
              },
              Object {
                "direction": 0,
                "endOffset": 8.5,
                "startOffset": 8,
              },
              Object {
                "direction": 2,
                "endOffset": 9.25,
                "startOffset": 8.875,
              },
              Object {
                "direction": 0,
                "endOffset": 9.75,
                "startOffset": 9.25,
              },
              Object {
                "direction": 1,
                "endOffset": 10.375,
                "startOffset": 9.75,
              },
              Object {
                "direction": 1,
                "endOffset": 10.875,
                "startOffset": 10.25,
              },
              Object {
                "direction": 3,
                "endOffset": 11.375,
                "startOffset": 11,
              },
              Object {
                "direction": 2,
                "endOffset": 11.5,
                "startOffset": 11.125,
              },
              Object {
                "direction": 1,
                "endOffset": 11.625,
                "startOffset": 11.25,
              },
              Object {
                "direction": 3,
                "endOffset": 11.875,
                "startOffset": 11.40625,
              },
              Object {
                "direction": 3,
                "endOffset": 16.625,
                "startOffset": 16.125,
              },
              Object {
                "direction": 0,
                "endOffset": 16.875,
                "startOffset": 16.375,
              },
              Object {
                "direction": 3,
                "endOffset": 17.125,
                "startOffset": 16.625,
              },
              Object {
                "direction": 0,
                "endOffset": 17.25,
                "startOffset": 16.875,
              },
              Object {
                "direction": 2,
                "endOffset": 29.75,
                "startOffset": 29.25,
              },
              Object {
                "direction": 1,
                "endOffset": 30.25,
                "startOffset": 29.875,
              },
              Object {
                "direction": 0,
                "endOffset": 30.75,
                "startOffset": 30.25,
              },
              Object {
                "direction": 2,
                "endOffset": 31.375,
                "startOffset": 30.75,
              },
              Object {
                "direction": 2,
                "endOffset": 32,
                "startOffset": 31.25,
              },
              Object {
                "direction": 3,
                "endOffset": 32.5,
                "startOffset": 32,
              },
              Object {
                "direction": 0,
                "endOffset": 33.5,
                "startOffset": 33,
              },
              Object {
                "direction": 2,
                "endOffset": 34.25,
                "startOffset": 33.875,
              },
              Object {
                "direction": 0,
                "endOffset": 34.75,
                "startOffset": 34.25,
              },
              Object {
                "direction": 1,
                "endOffset": 35.375,
                "startOffset": 34.75,
              },
              Object {
                "direction": 1,
                "endOffset": 35.875,
                "startOffset": 35.25,
              },
              Object {
                "direction": 1,
                "endOffset": 36.875,
                "startOffset": 36.40625,
              },
              Object {
                "direction": 2,
                "endOffset": 37.75,
                "startOffset": 37.25,
              },
              Object {
                "direction": 1,
                "endOffset": 38.25,
                "startOffset": 37.875,
              },
              Object {
                "direction": 3,
                "endOffset": 38.75,
                "startOffset": 38.25,
              },
              Object {
                "direction": 2,
                "endOffset": 39.375,
                "startOffset": 38.75,
              },
              Object {
                "direction": 2,
                "endOffset": 40,
                "startOffset": 39.25,
              },
              Object {
                "direction": 3,
                "endOffset": 41.5,
                "startOffset": 41,
              },
              Object {
                "direction": 2,
                "endOffset": 42.25,
                "startOffset": 41.875,
              },
              Object {
                "direction": 3,
                "endOffset": 42.75,
                "startOffset": 42.25,
              },
              Object {
                "direction": 1,
                "endOffset": 43.375,
                "startOffset": 42.75,
              },
              Object {
                "direction": 1,
                "endOffset": 43.875,
                "startOffset": 43.25,
              },
              Object {
                "direction": 0,
                "endOffset": 44.375,
                "startOffset": 44,
              },
              Object {
                "direction": 2,
                "endOffset": 44.5,
                "startOffset": 44.125,
              },
              Object {
                "direction": 1,
                "endOffset": 44.59375,
                "startOffset": 44.25,
              },
              Object {
                "direction": 0,
                "endOffset": 44.875,
                "startOffset": 44.40625,
              },
              Object {
                "direction": 3,
                "endOffset": 45,
                "startOffset": 44.625,
              },
              Object {
                "direction": 2,
                "endOffset": 45.125,
                "startOffset": 44.75,
              },
              Object {
                "direction": 1,
                "endOffset": 46.25,
                "startOffset": 44.875,
              },
              Object {
                "direction": 3,
                "endOffset": 54.625,
                "startOffset": 54.125,
              },
              Object {
                "direction": 0,
                "endOffset": 54.875,
                "startOffset": 54.375,
              },
              Object {
                "direction": 3,
                "endOffset": 55.125,
                "startOffset": 54.625,
              },
              Object {
                "direction": 0,
                "endOffset": 55.25,
                "startOffset": 54.875,
              },
              Object {
                "direction": 2,
                "endOffset": 59.75,
                "startOffset": 59.375,
              },
              Object {
                "direction": 3,
                "endOffset": 59.875,
                "startOffset": 59.5,
              },
              Object {
                "direction": 0,
                "endOffset": 60,
                "startOffset": 59.625,
              },
              Object {
                "direction": 2,
                "endOffset": 60.125,
                "startOffset": 59.75,
              },
              Object {
                "direction": 1,
                "endOffset": 60.25,
                "startOffset": 59.875,
              },
              Object {
                "direction": 0,
                "endOffset": 60.5,
                "startOffset": 60,
              },
              Object {
                "direction": 1,
                "endOffset": 60.625,
                "startOffset": 60.25,
              },
              Object {
                "direction": 2,
                "endOffset": 60.875,
                "startOffset": 60.375,
              },
              Object {
                "direction": 0,
                "endOffset": 61,
                "startOffset": 60.625,
              },
              Object {
                "direction": 3,
                "endOffset": 61.125,
                "startOffset": 60.75,
              },
              Object {
                "direction": 2,
                "endOffset": 61.5,
                "startOffset": 60.875,
              },
              Object {
                "direction": 1,
                "endOffset": 61.625,
                "startOffset": 61.25,
              },
              Object {
                "direction": 0,
                "endOffset": 62,
                "startOffset": 61.375,
              },
              Object {
                "direction": 1,
                "endOffset": 62.125,
                "startOffset": 61.75,
              },
              Object {
                "direction": 2,
                "endOffset": 62.375,
                "startOffset": 61.875,
              },
              Object {
                "direction": 2,
                "endOffset": 63.75,
                "startOffset": 63.375,
              },
              Object {
                "direction": 0,
                "endOffset": 63.875,
                "startOffset": 63.5,
              },
              Object {
                "direction": 3,
                "endOffset": 64,
                "startOffset": 63.625,
              },
              Object {
                "direction": 2,
                "endOffset": 64.125,
                "startOffset": 63.75,
              },
              Object {
                "direction": 1,
                "endOffset": 64.25,
                "startOffset": 63.875,
              },
              Object {
                "direction": 3,
                "endOffset": 64.5,
                "startOffset": 64,
              },
              Object {
                "direction": 1,
                "endOffset": 64.625,
                "startOffset": 64.25,
              },
              Object {
                "direction": 2,
                "endOffset": 64.875,
                "startOffset": 64.375,
              },
              Object {
                "direction": 3,
                "endOffset": 65,
                "startOffset": 64.625,
              },
              Object {
                "direction": 0,
                "endOffset": 65.125,
                "startOffset": 64.75,
              },
              Object {
                "direction": 2,
                "endOffset": 65.375,
                "startOffset": 64.875,
              },
              Object {
                "direction": 3,
                "endOffset": 65.6875,
                "startOffset": 65.125,
              },
              Object {
                "direction": 3,
                "endOffset": 82.6875,
                "startOffset": 81.9375,
              },
              Object {
                "direction": 0,
                "endOffset": 83.125,
                "startOffset": 82,
              },
            ],
            "stops": Array [],
          },
          "single-expert": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 138,
                "endOffset": null,
                "startOffset": -4,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 2,
                "endOffset": 2.375,
                "startOffset": 1.75,
              },
              Object {
                "direction": 2,
                "endOffset": 3,
                "startOffset": 2.25,
              },
              Object {
                "direction": 0,
                "endOffset": 3.5,
                "startOffset": 3,
              },
              Object {
                "direction": 1,
                "endOffset": 3.875,
                "startOffset": 3.375,
              },
              Object {
                "direction": 1,
                "endOffset": 6.375,
                "startOffset": 5.75,
              },
              Object {
                "direction": 1,
                "endOffset": 7,
                "startOffset": 6.25,
              },
              Object {
                "direction": 0,
                "endOffset": 9.75,
                "startOffset": 9,
              },
              Object {
                "direction": 3,
                "endOffset": 10.5,
                "startOffset": 10,
              },
              Object {
                "direction": 3,
                "endOffset": 11.75,
                "startOffset": 11,
              },
              Object {
                "direction": 1,
                "endOffset": 12.625,
                "startOffset": 12.125,
              },
              Object {
                "direction": 3,
                "endOffset": 12.875,
                "startOffset": 12.375,
              },
              Object {
                "direction": 2,
                "endOffset": 13.125,
                "startOffset": 12.625,
              },
              Object {
                "direction": 0,
                "endOffset": 13.375,
                "startOffset": 12.875,
              },
              Object {
                "direction": 2,
                "endOffset": 17.75,
                "startOffset": 17.375,
              },
              Object {
                "direction": 3,
                "endOffset": 17.875,
                "startOffset": 17.5,
              },
              Object {
                "direction": 0,
                "endOffset": 18,
                "startOffset": 17.625,
              },
              Object {
                "direction": 2,
                "endOffset": 18.125,
                "startOffset": 17.75,
              },
              Object {
                "direction": 1,
                "endOffset": 18.25,
                "startOffset": 17.875,
              },
              Object {
                "direction": 0,
                "endOffset": 18.375,
                "startOffset": 18,
              },
              Object {
                "direction": 2,
                "endOffset": 18.625,
                "startOffset": 18.25,
              },
              Object {
                "direction": 0,
                "endOffset": 18.75,
                "startOffset": 18.375,
              },
              Object {
                "direction": 2,
                "endOffset": 19.125,
                "startOffset": 18.75,
              },
              Object {
                "direction": 3,
                "endOffset": 19.25,
                "startOffset": 18.875,
              },
              Object {
                "direction": 1,
                "endOffset": 19.625,
                "startOffset": 19.25,
              },
              Object {
                "direction": 3,
                "endOffset": 19.75,
                "startOffset": 19.375,
              },
              Object {
                "direction": 3,
                "endOffset": 20.125,
                "startOffset": 19.75,
              },
              Object {
                "direction": 0,
                "endOffset": 20.25,
                "startOffset": 19.875,
              },
              Object {
                "direction": 2,
                "endOffset": 21.75,
                "startOffset": 21.375,
              },
              Object {
                "direction": 0,
                "endOffset": 21.875,
                "startOffset": 21.5,
              },
              Object {
                "direction": 3,
                "endOffset": 22,
                "startOffset": 21.625,
              },
              Object {
                "direction": 2,
                "endOffset": 22.125,
                "startOffset": 21.75,
              },
              Object {
                "direction": 1,
                "endOffset": 22.25,
                "startOffset": 21.875,
              },
              Object {
                "direction": 3,
                "endOffset": 22.375,
                "startOffset": 22,
              },
              Object {
                "direction": 2,
                "endOffset": 22.625,
                "startOffset": 22.25,
              },
              Object {
                "direction": 3,
                "endOffset": 22.75,
                "startOffset": 22.375,
              },
              Object {
                "direction": 2,
                "endOffset": 23.125,
                "startOffset": 22.75,
              },
              Object {
                "direction": 0,
                "endOffset": 23.25,
                "startOffset": 22.875,
              },
              Object {
                "direction": 3,
                "endOffset": 23.5,
                "startOffset": 23.125,
              },
              Object {
                "direction": 2,
                "endOffset": 27.375,
                "startOffset": 26.75,
              },
              Object {
                "direction": 2,
                "endOffset": 28,
                "startOffset": 27.25,
              },
              Object {
                "direction": 3,
                "endOffset": 28.5,
                "startOffset": 28,
              },
              Object {
                "direction": 1,
                "endOffset": 28.875,
                "startOffset": 28.375,
              },
              Object {
                "direction": 1,
                "endOffset": 31.375,
                "startOffset": 30.75,
              },
              Object {
                "direction": 1,
                "endOffset": 32,
                "startOffset": 31.25,
              },
              Object {
                "direction": 2,
                "endOffset": 35.375,
                "startOffset": 34.75,
              },
              Object {
                "direction": 2,
                "endOffset": 36,
                "startOffset": 35.25,
              },
              Object {
                "direction": 2,
                "endOffset": 36.875,
                "startOffset": 36.375,
              },
              Object {
                "direction": 1,
                "endOffset": 39.375,
                "startOffset": 38.75,
              },
              Object {
                "direction": 1,
                "endOffset": 40,
                "startOffset": 39.25,
              },
              Object {
                "direction": 3,
                "endOffset": 42.25,
                "startOffset": 40.875,
              },
              Object {
                "direction": 0,
                "endOffset": 50.625,
                "startOffset": 50.125,
              },
              Object {
                "direction": 1,
                "endOffset": 50.875,
                "startOffset": 50.375,
              },
              Object {
                "direction": 3,
                "endOffset": 51.125,
                "startOffset": 50.625,
              },
              Object {
                "direction": 2,
                "endOffset": 51.25,
                "startOffset": 50.875,
              },
              Object {
                "direction": 0,
                "endOffset": 55.75,
                "startOffset": 55.375,
              },
              Object {
                "direction": 1,
                "endOffset": 55.875,
                "startOffset": 55.5,
              },
              Object {
                "direction": 2,
                "endOffset": 56,
                "startOffset": 55.625,
              },
              Object {
                "direction": 3,
                "endOffset": 56.125,
                "startOffset": 55.75,
              },
              Object {
                "direction": 1,
                "endOffset": 56.25,
                "startOffset": 55.875,
              },
              Object {
                "direction": 2,
                "endOffset": 56.5,
                "startOffset": 56,
              },
              Object {
                "direction": 3,
                "endOffset": 56.625,
                "startOffset": 56.25,
              },
              Object {
                "direction": 2,
                "endOffset": 56.875,
                "startOffset": 56.375,
              },
              Object {
                "direction": 0,
                "endOffset": 57,
                "startOffset": 56.625,
              },
              Object {
                "direction": 1,
                "endOffset": 57.125,
                "startOffset": 56.75,
              },
              Object {
                "direction": 2,
                "endOffset": 57.5,
                "startOffset": 56.875,
              },
              Object {
                "direction": 3,
                "endOffset": 57.625,
                "startOffset": 57.25,
              },
              Object {
                "direction": 0,
                "endOffset": 58,
                "startOffset": 57.375,
              },
              Object {
                "direction": 3,
                "endOffset": 58.125,
                "startOffset": 57.75,
              },
              Object {
                "direction": 2,
                "endOffset": 59,
                "startOffset": 57.875,
              },
              Object {
                "direction": 3,
                "endOffset": 59.75,
                "startOffset": 59.375,
              },
              Object {
                "direction": 1,
                "endOffset": 59.875,
                "startOffset": 59.5,
              },
              Object {
                "direction": 2,
                "endOffset": 60,
                "startOffset": 59.625,
              },
              Object {
                "direction": 0,
                "endOffset": 60.125,
                "startOffset": 59.75,
              },
              Object {
                "direction": 1,
                "endOffset": 60.25,
                "startOffset": 59.875,
              },
              Object {
                "direction": 2,
                "endOffset": 60.5,
                "startOffset": 60,
              },
              Object {
                "direction": 0,
                "endOffset": 60.625,
                "startOffset": 60.25,
              },
              Object {
                "direction": 2,
                "endOffset": 60.875,
                "startOffset": 60.375,
              },
              Object {
                "direction": 3,
                "endOffset": 61,
                "startOffset": 60.625,
              },
              Object {
                "direction": 1,
                "endOffset": 61.125,
                "startOffset": 60.75,
              },
              Object {
                "direction": 2,
                "endOffset": 61.375,
                "startOffset": 60.875,
              },
              Object {
                "direction": 3,
                "endOffset": 61.875,
                "startOffset": 61.125,
              },
              Object {
                "direction": 2,
                "endOffset": 63.75,
                "startOffset": 63.375,
              },
              Object {
                "direction": 3,
                "endOffset": 63.875,
                "startOffset": 63.5,
              },
              Object {
                "direction": 0,
                "endOffset": 64,
                "startOffset": 63.625,
              },
              Object {
                "direction": 2,
                "endOffset": 64.125,
                "startOffset": 63.75,
              },
              Object {
                "direction": 1,
                "endOffset": 64.25,
                "startOffset": 63.875,
              },
              Object {
                "direction": 0,
                "endOffset": 64.375,
                "startOffset": 64,
              },
              Object {
                "direction": 2,
                "endOffset": 64.625,
                "startOffset": 64.25,
              },
              Object {
                "direction": 0,
                "endOffset": 64.75,
                "startOffset": 64.375,
              },
              Object {
                "direction": 2,
                "endOffset": 65.125,
                "startOffset": 64.75,
              },
              Object {
                "direction": 3,
                "endOffset": 65.25,
                "startOffset": 64.875,
              },
              Object {
                "direction": 1,
                "endOffset": 65.625,
                "startOffset": 65.25,
              },
              Object {
                "direction": 3,
                "endOffset": 65.75,
                "startOffset": 65.375,
              },
              Object {
                "direction": 3,
                "endOffset": 66.125,
                "startOffset": 65.75,
              },
              Object {
                "direction": 0,
                "endOffset": 66.25,
                "startOffset": 65.875,
              },
              Object {
                "direction": 2,
                "endOffset": 67.75,
                "startOffset": 67.375,
              },
              Object {
                "direction": 0,
                "endOffset": 67.875,
                "startOffset": 67.5,
              },
              Object {
                "direction": 3,
                "endOffset": 68,
                "startOffset": 67.625,
              },
              Object {
                "direction": 2,
                "endOffset": 68.125,
                "startOffset": 67.75,
              },
              Object {
                "direction": 1,
                "endOffset": 68.25,
                "startOffset": 67.875,
              },
              Object {
                "direction": 3,
                "endOffset": 68.375,
                "startOffset": 68,
              },
              Object {
                "direction": 2,
                "endOffset": 68.625,
                "startOffset": 68.25,
              },
              Object {
                "direction": 3,
                "endOffset": 68.75,
                "startOffset": 68.375,
              },
              Object {
                "direction": 2,
                "endOffset": 69.125,
                "startOffset": 68.75,
              },
              Object {
                "direction": 0,
                "endOffset": 69.25,
                "startOffset": 68.875,
              },
              Object {
                "direction": 3,
                "endOffset": 69.5,
                "startOffset": 69.125,
              },
              Object {
                "direction": 2,
                "endOffset": 71.75,
                "startOffset": 71.375,
              },
              Object {
                "direction": 0,
                "endOffset": 71.875,
                "startOffset": 71.5,
              },
              Object {
                "direction": 3,
                "endOffset": 72,
                "startOffset": 71.625,
              },
              Object {
                "direction": 2,
                "endOffset": 72.125,
                "startOffset": 71.75,
              },
              Object {
                "direction": 1,
                "endOffset": 72.25,
                "startOffset": 71.875,
              },
              Object {
                "direction": 3,
                "endOffset": 72.375,
                "startOffset": 72,
              },
              Object {
                "direction": 2,
                "endOffset": 72.625,
                "startOffset": 72.25,
              },
              Object {
                "direction": 3,
                "endOffset": 72.75,
                "startOffset": 72.375,
              },
              Object {
                "direction": 2,
                "endOffset": 73.125,
                "startOffset": 72.75,
              },
              Object {
                "direction": 0,
                "endOffset": 73.25,
                "startOffset": 72.875,
              },
              Object {
                "direction": 1,
                "endOffset": 73.625,
                "startOffset": 73.25,
              },
              Object {
                "direction": 0,
                "endOffset": 73.75,
                "startOffset": 73.375,
              },
              Object {
                "direction": 0,
                "endOffset": 74.125,
                "startOffset": 73.75,
              },
              Object {
                "direction": 3,
                "endOffset": 74.25,
                "startOffset": 73.875,
              },
              Object {
                "direction": 2,
                "endOffset": 75.75,
                "startOffset": 75.375,
              },
              Object {
                "direction": 3,
                "endOffset": 75.875,
                "startOffset": 75.5,
              },
              Object {
                "direction": 0,
                "endOffset": 76,
                "startOffset": 75.625,
              },
              Object {
                "direction": 2,
                "endOffset": 76.125,
                "startOffset": 75.75,
              },
              Object {
                "direction": 1,
                "endOffset": 76.25,
                "startOffset": 75.875,
              },
              Object {
                "direction": 0,
                "endOffset": 76.375,
                "startOffset": 76,
              },
              Object {
                "direction": 2,
                "endOffset": 76.625,
                "startOffset": 76.25,
              },
              Object {
                "direction": 0,
                "endOffset": 76.75,
                "startOffset": 76.375,
              },
              Object {
                "direction": 2,
                "endOffset": 77.125,
                "startOffset": 76.75,
              },
              Object {
                "direction": 3,
                "endOffset": 77.25,
                "startOffset": 76.875,
              },
              Object {
                "direction": 0,
                "endOffset": 77.5,
                "startOffset": 77.125,
              },
              Object {
                "direction": 0,
                "endOffset": 78.75,
                "startOffset": 77.875,
              },
              Object {
                "direction": 3,
                "endOffset": 78.75,
                "startOffset": 78,
              },
            ],
            "stops": Array [],
          },
        },
        "displayBpm": "138",
        "maxBpm": 138,
        "minBpm": 138,
        "stopCount": 0,
        "title": Object {
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
});
