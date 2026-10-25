import { describe, expect, test } from "vitest";
import { isValidColor } from "./utils.js";

describe("isValidColor", () => {
  test("accepts common color formats", () => {
    for (const color of [
      "#abc",
      "#aabbcc80",
      "blue",
      "rgba(0,0,0,0.1)",
      "rgba(10, 20, 30, 0.5)",
      "hsl(120 50% 50% / 0.5)",
    ]) {
      expect(isValidColor(color)).toBe(true);
    }
  });

  test("rejects colors that could inject markup", () => {
    for (const color of [
      '"/><image href=x onerror=alert(1)>',
      "red;background:url(x)",
      "",
      undefined,
    ]) {
      expect(isValidColor(color)).toBe(false);
    }
  });
});
