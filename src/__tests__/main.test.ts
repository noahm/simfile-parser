import * as path from "path";
import { parseAllPacks } from "../main";
import { setErrorTolerance } from "../util";

setErrorTolerance("bail");
const packsRoot = path.resolve(__dirname, "../../packs");

describe("parseAllPacks", () => {
  test("parses each pack separately", () => {
    expect(
      parseAllPacks(packsRoot).map((p) => ({
        name: p.name,
        songs: p.songCount,
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "name": "3rdMix",
          "songs": 38,
        },
        {
          "name": "5thMix",
          "songs": 40,
        },
        {
          "name": "A20 (beta)",
          "songs": 101,
        },
        {
          "name": "BITE6 ITG Customs",
          "songs": 2,
        },
        {
          "name": "Club Fantastic Season 1",
          "songs": 14,
        },
        {
          "name": "Club Fantastic Season 2",
          "songs": 18,
        },
        {
          "name": "Dance! @ Anime Destiny 2022",
          "songs": 7,
        },
        {
          "name": "Easy As Pie 2",
          "songs": 14,
        },
        {
          "name": "SuperNOVA2",
          "songs": 63,
        },
        {
          "name": "X2",
          "songs": 44,
        },
      ]
    `);
  });
});
