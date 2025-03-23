import type { generate } from "./generate";

export type Overrides = {
  [key: string]: boolean | string | number | any[] | Overrides;
};

export const genders = ["male", "female"] as const;
export type Gender = (typeof genders)[number];

export const features = [
  "accessories",
  "body",
  "ear",
  "eye",
  "eyebrow",
  "eyeLine",
  "facialHair",
  "glasses",
  "hair",
  "hairBg",
  "head",
  "jersey",
  "miscLine",
  "mouth",
  "nose",
  "smileLine",
] as const;
export type Feature = (typeof features)[number];

export const races = ["white", "black", "brown", "asian"] as const;
export type Race = (typeof races)[number];

export type TeamColors = [string, string, string];

export type FeatureInfo = {
  id?: string;
  name: Feature;
  positions: [null] | [number, number][];
  scaleFatness?: boolean;
  shiftWithEyes?: boolean;
  opaqueLines?: boolean;
};

export type FaceConfig = ReturnType<typeof generate>;
