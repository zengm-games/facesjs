import { describe, expect, test } from "vitest";
import {
  deleteFromDict,
  distinct,
  doesStrLookLikeColor,
  generateRangeFromSlots,
  generateRangeFromStep,
  getFromDict,
  isValidJSON,
  luma,
  roundTwoDecimals,
  setToDict,
} from "./utils";

describe("deleteFromDict", () => {
  test("deletes a top-level property", () => {
    const obj = { a: 1, b: 2 };
    const result = deleteFromDict(obj, "a");
    expect(result).toEqual({ b: 2 });
  });

  test("deletes a nested property", () => {
    const obj = { a: { b: { c: 3 } } };
    const result = deleteFromDict(obj, "a.b.c");
    expect(result).toEqual({ a: { b: {} } });
  });

  test("does nothing if the property does not exist", () => {
    const obj = { a: 1, b: 2 };
    const result = deleteFromDict(obj, "c");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("does nothing if the path is invalid", () => {
    const obj = { a: { b: 2 } };
    const result = deleteFromDict(obj, "a.c");
    expect(result).toEqual({ a: { b: 2 } });
  });

  test("handles empty string as key", () => {
    const obj = { "": "empty", a: 1 };
    const result = deleteFromDict(obj, "");
    expect(result).toEqual({ a: 1 });
  });

  test("does nothing for a non-existent nested property", () => {
    const obj = { a: { b: 2 } };
    const result = deleteFromDict(obj, "a.b.c");
    expect(result).toEqual({ a: { b: 2 } });
  });

  test("deletes an array element by index (not recommended usage)", () => {
    const obj = { a: [1, 2, 3] };
    const result = deleteFromDict(obj, "a.1");
    expect(result.a).toHaveLength(3);
    expect(result.a[1]).toBeUndefined();
  });

  test("returns the original object if the first part of the path is invalid", () => {
    const obj = { a: 1 };
    const result = deleteFromDict(obj, "b.c");
    expect(result).toEqual({ a: 1 });
  });

  test("handles non-object values gracefully", () => {
    const obj = { a: "string", b: 2 };
    const result = deleteFromDict(obj, "a.b");
    expect(result).toEqual({ a: "string", b: 2 });
  });

  test("removes the last nested property correctly", () => {
    const obj = { a: { b: { c: 3, d: 4 } } };
    const result = deleteFromDict(obj, "a.b.d");
    expect(result).toEqual({ a: { b: { c: 3 } } });
  });
});

describe("distinct", () => {
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

describe("doesStrLookLikeColor", () => {
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

describe("generateRangeFromSlots", () => {
  test("generates a range with specified number of slots", () => {
    const start = 0;
    const end = 10;
    const slots = 5;
    const expected = [0, 2, 4, 6, 8, 10];
    expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
  });

  test("handles floating point steps correctly", () => {
    const start = 1;
    const end = 2;
    const slots = 3;
    const expected = [1, 1.33, 1.67, 2].map((n) => parseFloat(n.toFixed(2)));
    expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
  });

  test("returns just the start and end for 1 slot", () => {
    const start = 0;
    const end = 5;
    const slots = 1;
    const expected = [0, 5];
    expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
  });

  test("returns a single value when start and end are the same", () => {
    const start = 5;
    const end = 5;
    const slots = 3;
    const expected = [5];
    expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
  });

  test("correctly handles negative start and end values", () => {
    const start = -5;
    const end = -1;
    const slots = 4;
    const expected = [-5, -4, -3, -2, -1];
    expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
  });

  test("handles zero slots (should return an empty array)", () => {
    const start = 0;
    const end = 10;
    const slots = 0;
    const expected: number[] = [];
    expect(generateRangeFromSlots(start, end, slots)).toEqual(expected);
  });
});

describe("generateRangeFromStep", () => {
  test("generates a range with a positive step", () => {
    expect(generateRangeFromStep(0, 5, 1)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test("generates a range with a larger step that skips values", () => {
    expect(generateRangeFromStep(0, 10, 4)).toEqual([0, 4, 8]);
  });

  test("handles floating point steps correctly", () => {
    expect(generateRangeFromStep(1, 2, 0.5)).toEqual([1, 1.5, 2]);
  });

  test("returns a single value when start and end are the same and step is valid", () => {
    expect(generateRangeFromStep(5, 5, 1)).toEqual([5]);
  });

  test("does not include the end value if the step size skips over it", () => {
    expect(generateRangeFromStep(0, 5, 3)).toEqual([0, 3]);
  });

  test("throws an error for zero step", () => {
    expect(() => generateRangeFromStep(0, 5, 0)).toThrow(
      "Step must be greater than 0",
    );
  });

  test("throws an error for negative step", () => {
    expect(() => generateRangeFromStep(5, 10, -1)).toThrow(
      "Step must be greater than 0",
    );
  });

  test("generates a range in reverse if start is greater than end (with positive step)", () => {
    expect(() => generateRangeFromStep(10, 5, 1)).toThrow(
      "Start cannot be greater than end when step is positive",
    );
  });
});

describe("getFromDict", () => {
  test("retrieves a value from a plain object at root level", () => {
    const obj = { a: 1 };
    expect(getFromDict(obj, "a")).toBe(1);
  });

  test("retrieves a value from a nested object structure", () => {
    const obj = { a: { b: { c: 2 } } };
    expect(getFromDict(obj, "a.b.c")).toBe(2);
  });

  test("returns null for a non-existent key in a nested object", () => {
    const obj = { a: { b: {} } };
    expect(getFromDict(obj, "a.b.c")).toBeNull();
  });

  test("retrieves a value from a Map at root level", () => {
    const map = new Map([["a", 1]]);
    expect(getFromDict(map, "a")).toBe(1);
  });

  test("retrieves a value from a nested Map structure", () => {
    const map = new Map([["a", new Map([["b", new Map([["c", 2]])]])]]);
    expect(getFromDict(map, "a.b.c")).toBe(2);
  });

  test("returns null for a non-existent key in a nested Map", () => {
    const map = new Map([["a", new Map()]]);
    expect(getFromDict(map, "a.b")).toBeNull();
  });

  test("handles mixed structures of Maps and objects", () => {
    const mixed = { a: new Map([["b", { c: 3 }]]) };
    expect(getFromDict(mixed, "a.b.c")).toBe(3);
  });

  test("ignores leading and trailing spaces in keys", () => {
    const obj = { a: { " b ": 2 } };
    expect(getFromDict(obj, "a. b ")).toBe(2);
  });

  test("returns null when path goes beyond existing structure", () => {
    const obj = { a: { b: 2 } };
    expect(getFromDict(obj, "a.b.c")).toBeNull();
  });
});

describe("isValidJSON", () => {
  test("returns true for a valid JSON object string", () => {
    const jsonString = '{"name":"John", "age":30}';
    expect(isValidJSON(jsonString)).toBe(true);
  });

  test("returns true for a valid JSON array string", () => {
    const jsonArray = '["apple", "banana", "cherry"]';
    expect(isValidJSON(jsonArray)).toBe(true);
  });

  test("returns false for an invalid JSON string with missing quotes", () => {
    const invalidJson = '{name:"John", age:30}';
    expect(isValidJSON(invalidJson)).toBe(false);
  });

  test("returns false for an invalid JSON string with trailing comma", () => {
    const invalidJson = '{"name":"John", "age":30,}';
    expect(isValidJSON(invalidJson)).toBe(false);
  });

  test("returns true for a valid JSON string with null", () => {
    const nullJson = "null";
    expect(isValidJSON(nullJson)).toBe(true);
  });

  test("returns true for a valid JSON string with true", () => {
    const trueJson = "true";
    expect(isValidJSON(trueJson)).toBe(true);
  });

  test("returns false for a string that is not JSON", () => {
    const notJson = "Hello, world!";
    expect(isValidJSON(notJson)).toBe(false);
  });

  test("returns false for a broken JSON structure", () => {
    const brokenJson = '{"name": "John", "age": 30';
    expect(isValidJSON(brokenJson)).toBe(false);
  });
});

describe("luma", () => {
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

describe("roundTwoDecimals", () => {
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

describe("setToDict", () => {
  test("sets a value in a plain object at root level", () => {
    const obj = {};
    setToDict(obj, "a", 1);
    expect(obj).toEqual({ a: 1 });
  });

  test("sets a value in a plain object with nested structure", () => {
    const obj = {};
    setToDict(obj, "a.b.c", 2);
    expect(obj).toEqual({ a: { b: { c: 2 } } });
  });

  test("overwrites existing value in a nested object", () => {
    const obj = { a: { b: { c: 1 } } };
    setToDict(obj, "a.b.c", 2);
    expect(obj).toEqual({ a: { b: { c: 2 } } });
  });

  test("handles setting a value with empty key", () => {
    const obj = {};
    setToDict(obj, "", 1);
    expect(obj).toEqual({ "": 1 });
  });

  test("creates intermediate objects/maps if they do not exist", () => {
    const obj = {};
    setToDict(obj, "a.b.c", 3);
    expect(obj).toHaveProperty("a.b.c", 3);
  });
});
