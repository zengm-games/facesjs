import { setToDict } from "../public/utils";

describe("setToDict function tests", () => {
  it("sets a value in a plain object at root level", () => {
    const obj = {};
    setToDict(obj, "a", 1);
    expect(obj).toEqual({ a: 1 });
  });

  it("sets a value in a plain object with nested structure", () => {
    const obj = {};
    setToDict(obj, "a.b.c", 2);
    expect(obj).toEqual({ a: { b: { c: 2 } } });
  });

  it("overwrites existing value in a nested object", () => {
    const obj = { a: { b: { c: 1 } } };
    setToDict(obj, "a.b.c", 2);
    expect(obj).toEqual({ a: { b: { c: 2 } } });
  });

  it("handles setting a value with empty key", () => {
    const obj = {};
    setToDict(obj, "", 1);
    expect(obj).toEqual({ "": 1 });
  });

  it("creates intermediate objects/maps if they do not exist", () => {
    const obj = {};
    setToDict(obj, "a.b.c", 3);
    expect(obj).toHaveProperty("a.b.c", 3);
  });
});
