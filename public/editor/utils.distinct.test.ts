import { describe, expect, test } from "vitest";
import { distinct } from "./utils";

describe("distinct function tests", () => {
  test("removes duplicate numbers from an array", () => {
    const arr = [1, 2, 2, 3];
    const expected = [1, 2, 3];
    expect(distinct(arr)).toEqual(expected);
  });

  test("removes duplicate strings from an array", () => {
    const arr = ["a", "b", "b", "c"];
    const expected = ["a", "b", "c"];
    expect(distinct(arr)).toEqual(expected);
  });

  test("handles an array with mixed types correctly", () => {
    const arr = [1, "1", 2, "2", "2"];
    const expected = [1, "1", 2, "2"];
    expect(distinct(arr)).toEqual(expected);
  });

  test("returns an empty array when given an empty array", () => {
    const arr: unknown[] = [];
    const expected: unknown[] = [];
    expect(distinct(arr)).toEqual(expected);
  });

  test("removes duplicate boolean values from an array", () => {
    const arr = [true, false, true, false];
    const expected = [true, false];
    expect(distinct(arr)).toEqual(expected);
  });

  test("removes duplicates when array contains objects (by reference)", () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const arr = [obj1, obj1, obj2, obj2];
    const expected = [obj1, obj2]; // Note: objects are considered distinct by reference, not by value
    expect(distinct(arr)).toEqual(expected);
  });

  test("handles an array with falsy values correctly", () => {
    const arr = [0, "", null, undefined, false, 0];
    const expected = [0, "", null, undefined, false];
    expect(distinct(arr)).toEqual(expected);
  });

  test("removes duplicates in an array of complex mixed types", () => {
    const arr = [1, "a", 1, "a", null, undefined, null, true, false, true];
    const expected = [1, "a", null, undefined, true, false];
    expect(distinct(arr)).toEqual(expected);
  });
});
