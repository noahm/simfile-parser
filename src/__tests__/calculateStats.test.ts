import path from "path";
import { calculateStats } from "../calculateStats";
import { parseSong, setErrorTolerance } from "../main";

setErrorTolerance("ignore");
const packsRoot = path.resolve(__dirname, "../../packs");

test("stats", () => {
  const song = parseSong(path.join(packsRoot, "Easy As Pie 2", "Abracadabra"));
  expect(calculateStats(song.charts["single-challenge"]))
    .toMatchInlineSnapshot(`
    Object {
      "freezes": 111,
      "gallops": 0,
      "jacks": 22,
      "jumps": 8,
    }
  `);
});
