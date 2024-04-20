import { roundTwoDecimals } from "../public/editor/utils";

describe("roundTwoDecimals function tests", () => {
  it("rounds a positive number correctly", () => {
    const num = 2.345;
    const expected = 2.35;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  it("rounds a negative number correctly", () => {
    const num = -2.345;
    const expected = -2.35;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  it("rounds a number requiring downward rounding correctly", () => {
    const num = 2.344;
    const expected = 2.34;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  it("handles a number that does not require rounding", () => {
    const num = 2.34;
    const expected = 2.34;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  it("handles 0", () => {
    const num = 0;
    const expected = 0;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  it("handles 1", () => {
    const num = 1;
    const expected = 1;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  it("handles 1.0", () => {
    const num = 1.0;
    const expected = 1.0;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });
});
