import { describe, expect, test } from "vitest";
import { getFromDict } from "./utils";

describe("getFromDict function tests", () => {
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
