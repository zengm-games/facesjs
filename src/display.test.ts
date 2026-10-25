import { describe, expect, test } from "vitest";
import { generate } from "./generate.js";
import { faceToSvgString } from "./faceToSvgString.js";
import { deepCopy } from "./utils.js";

describe("display", () => {
  test("does not modify the input face", () => {
    const face = generate({ accessories: { id: "hat" }, hair: { id: "afro" } });
    const original = deepCopy(face);
    faceToSvgString(face, { body: { color: "blue" } });
    expect(face).toEqual(original);
  });

  test("accepts common color formats", () => {
    for (const color of [
      "#abc",
      "#aabbcc80",
      "blue",
      "rgba(0,0,0,0.1)",
      "rgba(10, 20, 30, 0.5)",
      "hsl(120 50% 50% / 0.5)",
    ]) {
      expect(() =>
        faceToSvgString(generate({ body: { color } })),
      ).not.toThrow();
    }
  });

  test("rejects colors that could inject markup", () => {
    for (const color of [
      '"/><image href=x onerror=alert(1)>',
      "red;background:url(x)",
      "",
    ]) {
      expect(() => faceToSvgString(generate({ body: { color } }))).toThrow(
        "Invalid color",
      );
      expect(() =>
        faceToSvgString(generate({ teamColors: ["#000", "#000", color] })),
      ).toThrow("Invalid color");
    }
  });
});

describe("generate", () => {
  test("faces do not share teamColors", () => {
    const a = generate();
    const b = generate();
    a.teamColors[0] = "#ff0000";
    expect(b.teamColors[0]).not.toBe("#ff0000");
    expect(generate().teamColors[0]).not.toBe("#ff0000");
  });
});
