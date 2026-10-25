import { expect, test } from "vitest";
import { generate } from "./generate.js";
import { faceToSvgString, getShapesBBox } from "./faceToSvgString.js";
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

test("getShapesBBox handles circles, ellipses, and transforms", () => {
  const expectBBox = (xml: string, expected: number[]) => {
    const bbox = getShapesBBox(xml);
    expect(bbox).toHaveLength(4);
    bbox!.forEach((x, i) => expect(x).toBeCloseTo(expected[i]!));
  };

  expectBBox('<path d="M0 0L10 20"/>', [0, 0, 10, 20]);
  expectBBox('<circle cx="10" cy="20" r="5"/>', [5, 15, 15, 25]);
  expectBBox('<ellipse cx="0" cy="0" rx="10" ry="5"/>', [-10, -5, 10, 5]);
  expectBBox(
    '<ellipse cx="0" cy="0" rx="10" ry="5" transform="rotate(90)"/>',
    [-5, -10, 5, 10],
  );
  expectBBox(
    '<path d="M0 0L10 20" transform="matrix(-1 0 0 1 100 0)"/>',
    [90, 0, 100, 20],
  );
  expectBBox(
    '<path d="M0 0L10 20" transform="translate(5 5) scale(2)"/>',
    [5, 5, 25, 45],
  );
  expectBBox(
    '<g><path d="M0 0L10 20"/><circle cx="30" cy="0" r="5"/></g>',
    [0, -5, 35, 20],
  );
  expect(getShapesBBox("")).toBeUndefined();
});
