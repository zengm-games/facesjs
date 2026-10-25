import { expect, test } from "vitest";
import { generate } from "./generate.js";
import { faceToSvgString } from "./faceToSvgString.js";
import { deepCopy } from "./utils.js";

test("does not modify the input face", () => {
  const face = generate({ accessories: { id: "hat" }, hair: { id: "afro" } });
  const original = deepCopy(face);
  faceToSvgString(face, { body: { color: "blue" } });
  expect(face).toEqual(original);
});

test("throws on invalid colors", () => {
  const color = '"/><image href=x onerror=alert(1)>';
  expect(() => faceToSvgString(generate({ body: { color } }))).toThrow(
    "Invalid color",
  );
  expect(() =>
    faceToSvgString(generate({ teamColors: ["#000", "#000", color] })),
  ).toThrow("Invalid color");
});

test("escapes attribute values", () => {
  const payload = '1)" onload="alert(1)" x="<';
  const svg = faceToSvgString(
    generate({ body: { size: payload }, nose: { size: payload } }),
  );
  expect(svg).not.toContain('" onload="');
  expect(svg).not.toContain('x="<');
  expect(svg).toContain("&quot; onload=&quot;alert(1)&quot; x=&quot;&lt;");
});
