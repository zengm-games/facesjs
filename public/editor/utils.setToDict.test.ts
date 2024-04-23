import { describe, expect, test } from "vitest";
import { setToDict } from "./utils";

describe("setToDict function tests", () => {
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
