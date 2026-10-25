import { afterEach, expect, test } from "vitest";
import override from "./override.js";

afterEach(() => {
  // In case a test fails, don't let pollution leak into other tests
  // @ts-expect-error
  delete Object.prototype.polluted;
});

test("applies nested overrides", () => {
  const obj = { a: 1, b: { c: "x", d: true } };
  override(obj, { a: 2, b: { c: "y" } });
  expect(obj).toEqual({ a: 2, b: { c: "y", d: true } });
});

test("does not pollute Object.prototype via __proto__", () => {
  const obj = { a: 1 };
  override(obj, JSON.parse('{"__proto__": {"polluted": "yes"}}'));
  // @ts-expect-error
  expect({}.polluted).toBeUndefined();
});

test("does not pollute Object.prototype via constructor.prototype", () => {
  const obj = { a: 1 };
  override(obj, { constructor: { prototype: { polluted: "yes" } } });
  // @ts-expect-error
  expect({}.polluted).toBeUndefined();
});

test("does not change an object's prototype", () => {
  const obj = { a: 1 };
  override(obj, JSON.parse('{"__proto__": []}'));
  expect(Object.getPrototypeOf(obj)).toBe(Object.prototype);
});
