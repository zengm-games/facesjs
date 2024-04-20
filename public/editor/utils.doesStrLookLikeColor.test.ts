import { describe, expect, test } from "vitest";
import { doesStrLookLikeColor } from "./utils";

describe("doesStrLookLikeColor function tests", () => {
  test("returns true for valid 6-digit hexadecimal color", () => {
    expect(doesStrLookLikeColor("#FFFFFF")).toBe(true);
  });

  test("returns true for valid 3-digit shorthand hexadecimal color", () => {
    expect(doesStrLookLikeColor("#FFF")).toBe(true);
  });

  test("returns false for invalid color without #", () => {
    expect(doesStrLookLikeColor("FFFFFF")).toBe(false);
  });

  test("returns false for invalid color with more than 6 digits", () => {
    expect(doesStrLookLikeColor("#FFFFFFF")).toBe(false);
  });

  test("returns false for invalid color with less than 3 digits", () => {
    expect(doesStrLookLikeColor("#FF")).toBe(false);
  });

  test("returns false for invalid characters in color", () => {
    expect(doesStrLookLikeColor("#ZZZ999")).toBe(false);
  });
});
