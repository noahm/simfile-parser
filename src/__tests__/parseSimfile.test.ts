import * as path from "path";
import { parseSimfile } from "../parseSimfile";
import { Simfile } from "../types";

const packsRoot = path.resolve(__dirname, "../../packs");

function scrubDataForSnapshot(simfile: Simfile) {
  // drop actual step info for a smaller snapshot
  Object.values(simfile.charts).forEach((chart) => {
    expect(chart.arrows).not.toHaveLength(0);
    chart.arrows = "REDACTED" as any;
  });
  simfile.title.titleDir = path.relative(packsRoot, simfile.title.titleDir);
}

describe("parse", () => {
  test("single old song", () => {
    const simfile = parseSimfile(path.join(packsRoot, "3rdMix", "AFRONOVA"));
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
    const simfile = parseSimfile(path.join(packsRoot, "A20-(beta)", "Helios"));
    scrubDataForSnapshot(simfile);
    expect(simfile).toMatchInlineSnapshot(`
      Object {
        "artist": "xac",
        "availableTypes": Array [
          Object {
            "difficulty": "beginner",
            "feet": 4,
            "mode": "single",
            "slug": "single-beginner",
          },
          Object {
            "difficulty": "basic",
            "feet": 8,
            "mode": "single",
            "slug": "single-basic",
          },
          Object {
            "difficulty": "difficult",
            "feet": 12,
            "mode": "single",
            "slug": "single-difficult",
          },
          Object {
            "difficulty": "expert",
            "feet": 16,
            "mode": "single",
            "slug": "single-expert",
          },
          Object {
            "difficulty": "basic",
            "feet": 8,
            "mode": "double",
            "slug": "double-basic",
          },
          Object {
            "difficulty": "difficult",
            "feet": 12,
            "mode": "double",
            "slug": "double-difficult",
          },
          Object {
            "difficulty": "expert",
            "feet": 16,
            "mode": "double",
            "slug": "double-expert",
          },
        ],
        "charts": Object {
          "double-basic": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 182,
                "endOffset": null,
                "startOffset": -9,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 6,
                "endOffset": 0.875,
                "startOffset": 0,
              },
              Object {
                "direction": 3,
                "endOffset": 1.875,
                "startOffset": 1,
              },
              Object {
                "direction": 5,
                "endOffset": 2.875,
                "startOffset": 2,
              },
              Object {
                "direction": 3,
                "endOffset": 3.875,
                "startOffset": 3,
              },
              Object {
                "direction": 2,
                "endOffset": 32,
                "startOffset": 31,
              },
              Object {
                "direction": 2,
                "endOffset": 35.75,
                "startOffset": 34,
              },
              Object {
                "direction": 4,
                "endOffset": 37.75,
                "startOffset": 36,
              },
              Object {
                "direction": 6,
                "endOffset": 39.75,
                "startOffset": 38,
              },
              Object {
                "direction": 7,
                "endOffset": 41,
                "startOffset": 40,
              },
              Object {
                "direction": 5,
                "endOffset": 42,
                "startOffset": 41,
              },
              Object {
                "direction": 4,
                "endOffset": 43,
                "startOffset": 42,
              },
              Object {
                "direction": 3,
                "endOffset": 44,
                "startOffset": 43,
              },
              Object {
                "direction": 1,
                "endOffset": 45,
                "startOffset": 44,
              },
              Object {
                "direction": 0,
                "endOffset": 46,
                "startOffset": 45,
              },
              Object {
                "direction": 3,
                "endOffset": 65.25,
                "startOffset": 64,
              },
              Object {
                "direction": 5,
                "endOffset": 65.75,
                "startOffset": 65,
              },
              Object {
                "direction": 3,
                "endOffset": 66.25,
                "startOffset": 65.5,
              },
              Object {
                "direction": 4,
                "endOffset": 66.75,
                "startOffset": 66,
              },
              Object {
                "direction": 3,
                "endOffset": 67,
                "startOffset": 66.5,
              },
              Object {
                "direction": 6,
                "endOffset": 67.25,
                "startOffset": 66.75,
              },
              Object {
                "direction": 5,
                "endOffset": 67.5,
                "startOffset": 67,
              },
              Object {
                "direction": 4,
                "endOffset": 69.25,
                "startOffset": 68,
              },
              Object {
                "direction": 1,
                "endOffset": 69.75,
                "startOffset": 69,
              },
              Object {
                "direction": 4,
                "endOffset": 70.25,
                "startOffset": 69.5,
              },
              Object {
                "direction": 3,
                "endOffset": 70.75,
                "startOffset": 70,
              },
              Object {
                "direction": 4,
                "endOffset": 71,
                "startOffset": 70.5,
              },
              Object {
                "direction": 2,
                "endOffset": 71.25,
                "startOffset": 70.75,
              },
              Object {
                "direction": 1,
                "endOffset": 71.5,
                "startOffset": 71,
              },
              Object {
                "direction": 3,
                "endOffset": 73.25,
                "startOffset": 72,
              },
              Object {
                "direction": 6,
                "endOffset": 73.75,
                "startOffset": 73,
              },
              Object {
                "direction": 3,
                "endOffset": 74.25,
                "startOffset": 73.5,
              },
              Object {
                "direction": 4,
                "endOffset": 74.75,
                "startOffset": 74,
              },
              Object {
                "direction": 3,
                "endOffset": 75,
                "startOffset": 74.5,
              },
              Object {
                "direction": 5,
                "endOffset": 75.25,
                "startOffset": 74.75,
              },
              Object {
                "direction": 6,
                "endOffset": 75.5,
                "startOffset": 75,
              },
              Object {
                "direction": 4,
                "endOffset": 80,
                "startOffset": 79,
              },
            ],
            "stops": Array [],
          },
          "double-difficult": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 182,
                "endOffset": null,
                "startOffset": -9,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 6,
                "endOffset": 0.5,
                "startOffset": 0,
              },
              Object {
                "direction": 2,
                "endOffset": 1.5,
                "startOffset": 1,
              },
              Object {
                "direction": 5,
                "endOffset": 2.5,
                "startOffset": 2,
              },
              Object {
                "direction": 1,
                "endOffset": 3.5,
                "startOffset": 3,
              },
              Object {
                "direction": 4,
                "endOffset": 34.25,
                "startOffset": 32,
              },
              Object {
                "direction": 3,
                "endOffset": 36.25,
                "startOffset": 34,
              },
              Object {
                "direction": 4,
                "endOffset": 38.25,
                "startOffset": 36,
              },
              Object {
                "direction": 3,
                "endOffset": 41,
                "startOffset": 40,
              },
              Object {
                "direction": 0,
                "endOffset": 42,
                "startOffset": 40,
              },
              Object {
                "direction": 1,
                "endOffset": 43,
                "startOffset": 41,
              },
              Object {
                "direction": 3,
                "endOffset": 44,
                "startOffset": 42,
              },
              Object {
                "direction": 4,
                "endOffset": 45,
                "startOffset": 43,
              },
              Object {
                "direction": 5,
                "endOffset": 46,
                "startOffset": 44,
              },
              Object {
                "direction": 7,
                "endOffset": 46.25,
                "startOffset": 45,
              },
              Object {
                "direction": 6,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              Object {
                "direction": 0,
                "endOffset": 65,
                "startOffset": 64,
              },
              Object {
                "direction": 7,
                "endOffset": 69,
                "startOffset": 68,
              },
              Object {
                "direction": 0,
                "endOffset": 73,
                "startOffset": 72,
              },
              Object {
                "direction": 0,
                "endOffset": 80,
                "startOffset": 79,
              },
            ],
            "stops": Array [],
          },
          "double-expert": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 182,
                "endOffset": null,
                "startOffset": -9,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 6,
                "endOffset": 4.4375,
                "startOffset": 4,
              },
              Object {
                "direction": 4,
                "endOffset": 4.625,
                "startOffset": 4.1875,
              },
              Object {
                "direction": 2,
                "endOffset": 4.9375,
                "startOffset": 4.5,
              },
              Object {
                "direction": 3,
                "endOffset": 5.125,
                "startOffset": 4.6875,
              },
              Object {
                "direction": 5,
                "endOffset": 5.4375,
                "startOffset": 5,
              },
              Object {
                "direction": 4,
                "endOffset": 5.625,
                "startOffset": 5.1875,
              },
              Object {
                "direction": 1,
                "endOffset": 5.9375,
                "startOffset": 5.5,
              },
              Object {
                "direction": 3,
                "endOffset": 6.125,
                "startOffset": 5.6875,
              },
              Object {
                "direction": 6,
                "endOffset": 6.4375,
                "startOffset": 6,
              },
              Object {
                "direction": 7,
                "endOffset": 6.625,
                "startOffset": 6.1875,
              },
              Object {
                "direction": 6,
                "endOffset": 6.9375,
                "startOffset": 6.5,
              },
              Object {
                "direction": 4,
                "endOffset": 7.125,
                "startOffset": 6.6875,
              },
              Object {
                "direction": 7,
                "endOffset": 25,
                "startOffset": 24.5,
              },
              Object {
                "direction": 3,
                "endOffset": 26,
                "startOffset": 25.5,
              },
              Object {
                "direction": 3,
                "endOffset": 27,
                "startOffset": 26.5,
              },
              Object {
                "direction": 3,
                "endOffset": 28,
                "startOffset": 27.5,
              },
              Object {
                "direction": 3,
                "endOffset": 34.125,
                "startOffset": 32,
              },
              Object {
                "direction": 4,
                "endOffset": 36.125,
                "startOffset": 34,
              },
              Object {
                "direction": 3,
                "endOffset": 38.125,
                "startOffset": 36,
              },
              Object {
                "direction": 4,
                "endOffset": 41,
                "startOffset": 40,
              },
              Object {
                "direction": 7,
                "endOffset": 42,
                "startOffset": 40,
              },
              Object {
                "direction": 5,
                "endOffset": 43,
                "startOffset": 41,
              },
              Object {
                "direction": 3,
                "endOffset": 44,
                "startOffset": 42,
              },
              Object {
                "direction": 1,
                "endOffset": 45,
                "startOffset": 43,
              },
              Object {
                "direction": 2,
                "endOffset": 46,
                "startOffset": 44,
              },
              Object {
                "direction": 0,
                "endOffset": 46.25,
                "startOffset": 45,
              },
              Object {
                "direction": 1,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              Object {
                "direction": 4,
                "endOffset": 65.5,
                "startOffset": 65,
              },
              Object {
                "direction": 1,
                "endOffset": 65.875,
                "startOffset": 65.375,
              },
              Object {
                "direction": 4,
                "endOffset": 66.5,
                "startOffset": 66,
              },
              Object {
                "direction": 7,
                "endOffset": 66.875,
                "startOffset": 66.375,
              },
              Object {
                "direction": 5,
                "endOffset": 67.75,
                "startOffset": 66.75,
              },
              Object {
                "direction": 3,
                "endOffset": 69.5,
                "startOffset": 69,
              },
              Object {
                "direction": 5,
                "endOffset": 69.875,
                "startOffset": 69.375,
              },
              Object {
                "direction": 3,
                "endOffset": 70.5,
                "startOffset": 70,
              },
              Object {
                "direction": 0,
                "endOffset": 70.875,
                "startOffset": 70.375,
              },
              Object {
                "direction": 1,
                "endOffset": 71.75,
                "startOffset": 70.75,
              },
              Object {
                "direction": 4,
                "endOffset": 73.5,
                "startOffset": 73,
              },
              Object {
                "direction": 2,
                "endOffset": 73.875,
                "startOffset": 73.375,
              },
              Object {
                "direction": 4,
                "endOffset": 74.5,
                "startOffset": 74,
              },
              Object {
                "direction": 7,
                "endOffset": 74.875,
                "startOffset": 74.375,
              },
              Object {
                "direction": 6,
                "endOffset": 75.75,
                "startOffset": 74.75,
              },
            ],
            "stops": Array [],
          },
          "single-basic": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 182,
                "endOffset": null,
                "startOffset": -9,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 3,
                "endOffset": 4.625,
                "startOffset": 4,
              },
              Object {
                "direction": 0,
                "endOffset": 5.125,
                "startOffset": 4.5,
              },
              Object {
                "direction": 3,
                "endOffset": 5.625,
                "startOffset": 5,
              },
              Object {
                "direction": 0,
                "endOffset": 6.125,
                "startOffset": 5.5,
              },
              Object {
                "direction": 2,
                "endOffset": 6.625,
                "startOffset": 6,
              },
              Object {
                "direction": 1,
                "endOffset": 7.125,
                "startOffset": 6.5,
              },
              Object {
                "direction": 2,
                "endOffset": 32,
                "startOffset": 31,
              },
              Object {
                "direction": 0,
                "endOffset": 35.75,
                "startOffset": 34,
              },
              Object {
                "direction": 2,
                "endOffset": 37.75,
                "startOffset": 36,
              },
              Object {
                "direction": 3,
                "endOffset": 39.75,
                "startOffset": 38,
              },
              Object {
                "direction": 0,
                "endOffset": 41,
                "startOffset": 40,
              },
              Object {
                "direction": 1,
                "endOffset": 42,
                "startOffset": 41,
              },
              Object {
                "direction": 2,
                "endOffset": 43,
                "startOffset": 42,
              },
              Object {
                "direction": 3,
                "endOffset": 44,
                "startOffset": 43,
              },
              Object {
                "direction": 1,
                "endOffset": 45,
                "startOffset": 44,
              },
              Object {
                "direction": 2,
                "endOffset": 46,
                "startOffset": 45,
              },
              Object {
                "direction": 0,
                "endOffset": 65,
                "startOffset": 64,
              },
              Object {
                "direction": 3,
                "endOffset": 66,
                "startOffset": 65,
              },
              Object {
                "direction": 0,
                "endOffset": 66.5,
                "startOffset": 66,
              },
              Object {
                "direction": 3,
                "endOffset": 67,
                "startOffset": 66.5,
              },
              Object {
                "direction": 0,
                "endOffset": 67.5,
                "startOffset": 67,
              },
              Object {
                "direction": 3,
                "endOffset": 69,
                "startOffset": 68,
              },
              Object {
                "direction": 0,
                "endOffset": 70,
                "startOffset": 69,
              },
              Object {
                "direction": 3,
                "endOffset": 70.5,
                "startOffset": 70,
              },
              Object {
                "direction": 0,
                "endOffset": 71,
                "startOffset": 70.5,
              },
              Object {
                "direction": 3,
                "endOffset": 71.5,
                "startOffset": 71,
              },
              Object {
                "direction": 1,
                "endOffset": 73,
                "startOffset": 72,
              },
              Object {
                "direction": 3,
                "endOffset": 74,
                "startOffset": 73,
              },
              Object {
                "direction": 0,
                "endOffset": 74.5,
                "startOffset": 74,
              },
              Object {
                "direction": 3,
                "endOffset": 75,
                "startOffset": 74.5,
              },
              Object {
                "direction": 2,
                "endOffset": 75.5,
                "startOffset": 75,
              },
              Object {
                "direction": 2,
                "endOffset": 80,
                "startOffset": 79,
              },
            ],
            "stops": Array [],
          },
          "single-beginner": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 182,
                "endOffset": null,
                "startOffset": -9,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 3,
                "endOffset": 41.25,
                "startOffset": 40,
              },
              Object {
                "direction": 1,
                "endOffset": 43.25,
                "startOffset": 42,
              },
              Object {
                "direction": 0,
                "endOffset": 45.25,
                "startOffset": 44,
              },
              Object {
                "direction": 2,
                "endOffset": 47.25,
                "startOffset": 46,
              },
              Object {
                "direction": 3,
                "endOffset": 64.75,
                "startOffset": 64,
              },
              Object {
                "direction": 0,
                "endOffset": 68.75,
                "startOffset": 68,
              },
              Object {
                "direction": 1,
                "endOffset": 72.75,
                "startOffset": 72,
              },
            ],
            "stops": Array [],
          },
          "single-difficult": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 182,
                "endOffset": null,
                "startOffset": -9,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 2,
                "endOffset": 0.5,
                "startOffset": 0,
              },
              Object {
                "direction": 3,
                "endOffset": 1.5,
                "startOffset": 1,
              },
              Object {
                "direction": 2,
                "endOffset": 2.5,
                "startOffset": 2,
              },
              Object {
                "direction": 0,
                "endOffset": 3.5,
                "startOffset": 3,
              },
              Object {
                "direction": 0,
                "endOffset": 4.4375,
                "startOffset": 4,
              },
              Object {
                "direction": 3,
                "endOffset": 4.9375,
                "startOffset": 4.5,
              },
              Object {
                "direction": 0,
                "endOffset": 5.4375,
                "startOffset": 5,
              },
              Object {
                "direction": 3,
                "endOffset": 5.9375,
                "startOffset": 5.5,
              },
              Object {
                "direction": 3,
                "endOffset": 34.25,
                "startOffset": 32,
              },
              Object {
                "direction": 0,
                "endOffset": 36.25,
                "startOffset": 34,
              },
              Object {
                "direction": 2,
                "endOffset": 38.25,
                "startOffset": 36,
              },
              Object {
                "direction": 1,
                "endOffset": 39.75,
                "startOffset": 38,
              },
              Object {
                "direction": 0,
                "endOffset": 41,
                "startOffset": 40,
              },
              Object {
                "direction": 3,
                "endOffset": 42,
                "startOffset": 40,
              },
              Object {
                "direction": 1,
                "endOffset": 43,
                "startOffset": 41,
              },
              Object {
                "direction": 2,
                "endOffset": 44,
                "startOffset": 42,
              },
              Object {
                "direction": 0,
                "endOffset": 45,
                "startOffset": 43,
              },
              Object {
                "direction": 1,
                "endOffset": 46,
                "startOffset": 44,
              },
              Object {
                "direction": 2,
                "endOffset": 46.25,
                "startOffset": 45,
              },
              Object {
                "direction": 3,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              Object {
                "direction": 2,
                "endOffset": 56.625,
                "startOffset": 56.125,
              },
              Object {
                "direction": 2,
                "endOffset": 58.625,
                "startOffset": 58.125,
              },
              Object {
                "direction": 1,
                "endOffset": 60.625,
                "startOffset": 60.125,
              },
              Object {
                "direction": 1,
                "endOffset": 68,
                "startOffset": 66.75,
              },
              Object {
                "direction": 2,
                "endOffset": 72,
                "startOffset": 70.75,
              },
              Object {
                "direction": 1,
                "endOffset": 76,
                "startOffset": 74.75,
              },
              Object {
                "direction": 1,
                "endOffset": 80,
                "startOffset": 79,
              },
            ],
            "stops": Array [],
          },
          "single-expert": Object {
            "arrows": "REDACTED",
            "bpm": Array [
              Object {
                "bpm": 182,
                "endOffset": null,
                "startOffset": -9,
              },
            ],
            "freezes": Array [
              Object {
                "direction": 2,
                "endOffset": 4.4375,
                "startOffset": 4,
              },
              Object {
                "direction": 0,
                "endOffset": 4.625,
                "startOffset": 4.1875,
              },
              Object {
                "direction": 1,
                "endOffset": 4.75,
                "startOffset": 4.375,
              },
              Object {
                "direction": 2,
                "endOffset": 4.9375,
                "startOffset": 4.5,
              },
              Object {
                "direction": 3,
                "endOffset": 5.125,
                "startOffset": 4.6875,
              },
              Object {
                "direction": 1,
                "endOffset": 5.25,
                "startOffset": 4.875,
              },
              Object {
                "direction": 3,
                "endOffset": 5.4375,
                "startOffset": 5,
              },
              Object {
                "direction": 2,
                "endOffset": 5.625,
                "startOffset": 5.1875,
              },
              Object {
                "direction": 0,
                "endOffset": 5.75,
                "startOffset": 5.375,
              },
              Object {
                "direction": 3,
                "endOffset": 5.9375,
                "startOffset": 5.5,
              },
              Object {
                "direction": 1,
                "endOffset": 6.125,
                "startOffset": 5.6875,
              },
              Object {
                "direction": 0,
                "endOffset": 6.25,
                "startOffset": 5.875,
              },
              Object {
                "direction": 2,
                "endOffset": 6.4375,
                "startOffset": 6,
              },
              Object {
                "direction": 3,
                "endOffset": 6.625,
                "startOffset": 6.1875,
              },
              Object {
                "direction": 0,
                "endOffset": 6.75,
                "startOffset": 6.375,
              },
              Object {
                "direction": 1,
                "endOffset": 6.9375,
                "startOffset": 6.5,
              },
              Object {
                "direction": 3,
                "endOffset": 7.125,
                "startOffset": 6.6875,
              },
              Object {
                "direction": 0,
                "endOffset": 25,
                "startOffset": 24.5,
              },
              Object {
                "direction": 3,
                "endOffset": 26,
                "startOffset": 25.5,
              },
              Object {
                "direction": 0,
                "endOffset": 27,
                "startOffset": 26.5,
              },
              Object {
                "direction": 3,
                "endOffset": 28,
                "startOffset": 27.5,
              },
              Object {
                "direction": 3,
                "endOffset": 34.125,
                "startOffset": 32,
              },
              Object {
                "direction": 0,
                "endOffset": 36.125,
                "startOffset": 34,
              },
              Object {
                "direction": 2,
                "endOffset": 38.125,
                "startOffset": 36,
              },
              Object {
                "direction": 1,
                "endOffset": 39.75,
                "startOffset": 38,
              },
              Object {
                "direction": 3,
                "endOffset": 41,
                "startOffset": 40,
              },
              Object {
                "direction": 0,
                "endOffset": 42,
                "startOffset": 40,
              },
              Object {
                "direction": 1,
                "endOffset": 43,
                "startOffset": 41,
              },
              Object {
                "direction": 3,
                "endOffset": 44,
                "startOffset": 42,
              },
              Object {
                "direction": 0,
                "endOffset": 45,
                "startOffset": 43,
              },
              Object {
                "direction": 2,
                "endOffset": 46,
                "startOffset": 44,
              },
              Object {
                "direction": 3,
                "endOffset": 46.25,
                "startOffset": 45,
              },
              Object {
                "direction": 0,
                "endOffset": 46.75,
                "startOffset": 46,
              },
              Object {
                "direction": 2,
                "endOffset": 65.5,
                "startOffset": 65,
              },
              Object {
                "direction": 1,
                "endOffset": 65.875,
                "startOffset": 65.375,
              },
              Object {
                "direction": 3,
                "endOffset": 66.5,
                "startOffset": 66,
              },
              Object {
                "direction": 0,
                "endOffset": 66.875,
                "startOffset": 66.375,
              },
              Object {
                "direction": 2,
                "endOffset": 68,
                "startOffset": 66.75,
              },
              Object {
                "direction": 3,
                "endOffset": 69.5,
                "startOffset": 69,
              },
              Object {
                "direction": 2,
                "endOffset": 69.875,
                "startOffset": 69.375,
              },
              Object {
                "direction": 0,
                "endOffset": 70.5,
                "startOffset": 70,
              },
              Object {
                "direction": 1,
                "endOffset": 70.875,
                "startOffset": 70.375,
              },
              Object {
                "direction": 2,
                "endOffset": 72,
                "startOffset": 70.75,
              },
              Object {
                "direction": 1,
                "endOffset": 73.5,
                "startOffset": 73,
              },
              Object {
                "direction": 3,
                "endOffset": 73.875,
                "startOffset": 73.375,
              },
              Object {
                "direction": 2,
                "endOffset": 74.5,
                "startOffset": 74,
              },
              Object {
                "direction": 0,
                "endOffset": 74.875,
                "startOffset": 74.375,
              },
              Object {
                "direction": 1,
                "endOffset": 76,
                "startOffset": 74.75,
              },
            ],
            "stops": Array [],
          },
        },
        "displayBpm": "182",
        "maxBpm": 182,
        "minBpm": 182,
        "stopCount": 0,
        "title": Object {
          "banner": "Helios.png",
          "bg": null,
          "jacket": "Helios-jacket.png",
          "titleDir": "A20-(beta)/Helios",
          "titleName": "Helios",
          "translitTitleName": null,
        },
      }
    `);
  });
});
