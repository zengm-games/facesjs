import * as z from "zod/v4";
import type { FaceConfig } from "./common.js";
import { colorRegex } from "./utils.js";

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

const idSchema = z.object({ id: z.string() });
const colorSchema = z.string().regex(colorRegex);

const faceConfigStrictSchema = z.object({
  fatness: z.number(),
  teamColors: z.tuple([colorSchema, colorSchema, colorSchema]),
  hairBg: idSchema,
  body: z.object({ id: z.string(), color: colorSchema, size: z.number() }),
  jersey: idSchema,
  ear: z.object({ id: z.string(), size: z.number() }),
  head: z.object({ id: z.string(), shave: colorSchema }),
  eyeLine: idSchema,
  smileLine: z.object({ id: z.string(), size: z.number() }),
  miscLine: idSchema,
  facialHair: idSchema,
  eye: z.object({ id: z.string(), angle: z.number() }),
  eyebrow: z.object({ id: z.string(), angle: z.number() }),
  hair: z.object({ id: z.string(), color: colorSchema, flip: z.boolean() }),
  mouth: z.object({ id: z.string(), flip: z.boolean() }),
  nose: z.object({ id: z.string(), flip: z.boolean(), size: z.number() }),
  glasses: idSchema,
  accessories: idSchema,
});

// Compile error if FaceConfig and the schema ever differ, in either direction
true satisfies Equals<FaceConfig, z.infer<typeof faceConfigStrictSchema>>;

// Unknown properties are kept rather than rejected or stripped
export const faceConfigSchema = faceConfigStrictSchema.loose();
