import * as path from "path";
import { getAllPacks, parseSimfile } from "../main";

const packsRoot = path.resolve(__dirname, "../../packs");

describe("getAllPacks", () => {
  test("parses each pack separately", () => {
    expect(
      getAllPacks(packsRoot).map((p) => ({
        name: p.name,
        songs: p.songCount,
      }))
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "name": "3rdMix",
          "songs": 38,
        },
        Object {
          "name": "5thMix",
          "songs": 40,
        },
        Object {
          "name": "A20 (beta)",
          "songs": 101,
        },
        Object {
          "name": "SuperNOVA2",
          "songs": 63,
        },
        Object {
          "name": "X2",
          "songs": 44,
        },
      ]
    `);
  });
});

describe("parse", () => {
  test("single song", () => {
    const simfile = parseSimfile(path.join(packsRoot, "3rdMix", "AFRONOVA"));
    // drop actual step info for a smaller snapshot
    Object.values(simfile.charts).forEach((chart) => {
      expect(chart.arrows).not.toHaveLength(0);
      chart.arrows = "REDACTED" as any;
    });
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
        "banner": "AFRONOVA.png",
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
          "titleDir": "/home/noah/dev/simfile-parser/packs/3rdMix/AFRONOVA",
          "titleName": "AFRONOVA",
          "translitTitleName": null,
        },
      }
    `);
  });
});
