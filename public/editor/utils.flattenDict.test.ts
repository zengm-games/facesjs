import { describe, expect, test } from "vitest";
import { flattenDict } from "./utils";

describe("flattenDict", () => {
  test("flattens a simple object with no nested structures", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const expected = { a: 1, b: 2, c: 3 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens an object with nested objects", () => {
    const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
    const expected = { a: 1, "b.c": 2, "b.d.e": 3 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens an object with arrays, including the array index in the key", () => {
    const obj = { a: [1, 2], b: { c: [3, 4] } };
    const expected = { "a.[0]": 1, "a.[1]": 2, "b.c.[0]": 3, "b.c.[1]": 4 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("handles mixed objects and arrays with nested structures", () => {
    const obj = { a: 1, b: [2, { c: 3, d: [4, 5] }] };
    const expected = {
      a: 1,
      "b.[0]": 2,
      "b.[1].c": 3,
      "b.[1].d.[0]": 4,
      "b.[1].d.[1]": 5,
    };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("handles empty objects and arrays correctly", () => {
    const obj = { a: {}, b: [] };
    const expected = {};
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("handles empty objects parent correctly", () => {
    const obj = {};
    const expected = {};
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens a deeply nested object", () => {
    const obj = { a: { b: { c: { d: 1 } } } };
    const expected = { "a.b.c.d": 1 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens a deeply nested array", () => {
    const obj = [
      [
        [1, 2],
        [3, 4],
      ],
      [[5, 6]],
    ];
    const expected = {
      "[0].[0].[0]": 1,
      "[0].[0].[1]": 2,
      "[0].[1].[0]": 3,
      "[0].[1].[1]": 4,
      "[1].[0].[0]": 5,
      "[1].[0].[1]": 6,
    };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens an object with mixed nested arrays and objects", () => {
    const obj = { a: [1, { b: 2 }], c: { d: [3, 4] } };
    const expected = { "a.[0]": 1, "a.[1].b": 2, "c.d.[0]": 3, "c.d.[1]": 4 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("handles an empty object correctly", () => {
    const obj = {};
    const expected = {};
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("handles an empty array correctly", () => {
    const obj: any = [];
    const expected = {};
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens an array of objects", () => {
    const obj = [{ a: 1 }, { b: 2 }];
    const expected = { "[0].a": 1, "[1].b": 2 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens an array of arrays", () => {
    const obj = [
      [1, 2],
      [3, 4],
    ];
    const expected = { "[0].[0]": 1, "[0].[1]": 2, "[1].[0]": 3, "[1].[1]": 4 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("handles null values within the structure", () => {
    const obj = { a: null, b: { c: null } };
    const expected = { a: null, "b.c": null };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("handles undefined values within the structure", () => {
    const obj = { a: undefined, b: { c: undefined } };
    const expected = { a: undefined, "b.c": undefined };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens objects with special characters in keys", () => {
    const obj = { "a-a": { "b b": { "c.c": 1 } } };
    const expected = { "a-a.b b.c.c": 1 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test("flattens long chains of objects", () => {
    const obj = { a: { b: { c: { d: { e: { f: 1 } } } } } };
    const expected = { "a.b.c.d.e.f": 1 };
    expect(flattenDict(obj)).toEqual(expected);
  });

  test('flattens objects with "Array" and "Object" as keys', () => {
    const obj = { Array: { Object: { a: 1 } } };
    const expected = { "Array.Object.a": 1 };
    expect(flattenDict(obj)).toEqual(expected);
  });
});
