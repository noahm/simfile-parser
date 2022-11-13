import { parseAllPacks } from "../main";
import { setErrorTolerance } from "../util";

setErrorTolerance("warn");

describe("parseAllPacks", () => {
  test.skip("parses a lot of itg junk", () => {
    expect(() => parseAllPacks("/mnt/z/StepmaniaLibrary/ITG")).not.toThrow();
  });
});
