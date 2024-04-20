import { describe, expect, test } from "vitest";
import { roundTwoDecimals } from "./utils";

describe("roundTwoDecimals function tests", () => {
  test("rounds a positive number correctly", () => {
    const num = 2.345;
    const expected = 2.35;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  test("rounds a negative number correctly", () => {
    const num = -2.345;
    const expected = -2.35;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  test("rounds a number requiring downward rounding correctly", () => {
    const num = 2.344;
    const expected = 2.34;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  test("handles a number that does not require rounding", () => {
    const num = 2.34;
    const expected = 2.34;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  test("handles 0", () => {
    const num = 0;
    const expected = 0;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  test("handles 1", () => {
    const num = 1;
    const expected = 1;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });

  test("handles 1.0", () => {
    const num = 1.0;
    const expected = 1.0;
    expect(roundTwoDecimals(num)).toEqual(expected);
  });
});
