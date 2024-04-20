import { describe, expect, test } from "vitest";
import { luma } from "./utils";

describe("luma function tests", () => {
  test("calculates the luma of a dark color correctly", () => {
    expect(luma("#000000")).toBeCloseTo(0);
  });

  test("calculates the luma of a light color correctly", () => {
    expect(luma("#FFFFFF")).toBeCloseTo(1);
  });

  test("handles shorthand hexadecimal colors", () => {
    expect(luma("#FFF")).toBeCloseTo(1);
    expect(luma("#000")).toBeCloseTo(0);
  });

  test("throws an error for invalid hexadecimal colors", () => {
    expect(() => luma("123456")).toThrow("Invalid hexadecimal color");
    expect(() => luma("#GGGGGG")).toThrow("Invalid hexadecimal color");
  });

  test("calculates the luma of a mid-range color correctly", () => {
    expect(luma("#7F7F7F")).toBeCloseTo(0.5);
  });
});
