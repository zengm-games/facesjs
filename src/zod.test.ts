import { describe, expect, test } from "vitest";
import { generate } from "./generate.js";
import { faceConfigSchema } from "./zod.js";

describe("faceConfigSchema", () => {
  test("accepts generated faces", () => {
    for (let i = 0; i < 100; i++) {
      const face = generate();
      expect(faceConfigSchema.parse(face)).toEqual(face);
    }
  });

  test("rejects faces with missing features", () => {
    const { hair, ...face } = generate();
    expect(faceConfigSchema.safeParse(face).success).toBe(false);
  });

  test("keeps unknown properties", () => {
    const face = { ...generate(), foo: { id: "bar" } };
    expect(faceConfigSchema.parse(face)).toEqual(face);
  });

  test("rejects colors that could inject markup", () => {
    const face = generate();
    face.body.color = '"/><image href=x onerror=alert(1)>';
    expect(faceConfigSchema.safeParse(face).success).toBe(false);
  });
});
