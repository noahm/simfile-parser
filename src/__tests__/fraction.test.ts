import { Fraction } from "../fraction";

describe("custom fraciton.js", () => {
  test("add two fractions", () => {
    const a = new Fraction(3, 4);
    const b = new Fraction(1, 8);
    expect(a.add(b).toString()).toBe("0.875");
    expect(new Fraction(25, 2).add(new Fraction(0)).toString()).toBe("12.5");
  });

  test("modulo to fractions", () => {
    const a = new Fraction(13, 3);
    const b = new Fraction(7, 8);
    expect(a.mod(b).toString()).toBe((5 / 6).toString());
    expect(new Fraction(13 / 26).mod(new Fraction(1)).toString()).toBe("0.5");
  });
});
