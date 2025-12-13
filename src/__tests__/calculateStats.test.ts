import path from "path";
import { calculateStats } from "../calculateStats";
import { parseSong, setErrorTolerance } from "../main";

setErrorTolerance("ignore");
const packsRoot = path.resolve(import.meta.dirname, "../../packs");

test("stats", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const song = parseSong(path.join(packsRoot, "Easy As Pie 2", "Abracadabra"))!;
  expect(calculateStats(song.charts["single-challenge"]))
    .toMatchInlineSnapshot(`
    {
      "freezes": 111,
      "gallops": 0,
      "jacks": 22,
      "jumps": 8,
    }
  `);
});
