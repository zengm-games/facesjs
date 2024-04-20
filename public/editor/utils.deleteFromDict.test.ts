import { describe, expect, test } from "vitest";
import { deleteFromDict } from "./utils";

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
