import * as path from "path";
import { parseAllPacks } from "../main";

const packsRoot = path.resolve(__dirname, "../../packs");

describe("parseAllPacks", () => {
  test("parses each pack separately", () => {
    expect(
      parseAllPacks(packsRoot).map((p) => ({
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
