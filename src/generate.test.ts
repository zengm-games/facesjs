import { expect, test } from "vitest";
import { generate } from "./generate.js";

test("faces do not share teamColors", () => {
  const a = generate();
  const b = generate();
  a.teamColors[0] = "#ff0000";
  expect(b.teamColors[0]).not.toBe("#ff0000");
  expect(generate().teamColors[0]).not.toBe("#ff0000");
});
