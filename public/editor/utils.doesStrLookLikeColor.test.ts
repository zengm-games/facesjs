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

  test("returns false for invalid color with weird number of digits", () => {
    expect(doesStrLookLikeColor("#FFFFFFF")).toBe(false);
    expect(doesStrLookLikeColor("#FF")).toBe(false);
    expect(doesStrLookLikeColor("#FFFF")).toBe(false);
  });

  test("returns false for invalid characters in color", () => {
    expect(doesStrLookLikeColor("#ZZZ999")).toBe(false);
  });

  test("works for rgba colors", () => {
    expect(doesStrLookLikeColor("rgba(20,0,100,0.5)")).toBe(true);
    expect(doesStrLookLikeColor("rgba(20, 0, 100, 0.5)")).toBe(true);
    expect(doesStrLookLikeColor("rgba(20,0,100,0.5")).toBe(false);
  });
});
