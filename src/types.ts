import type { generate } from "./generate";

export type Overrides = {
  [key: string]: boolean | string | number | any[] | Overrides;
};

export type Gender = "male" | "female";

export type Feature =
  | "accessories"
  | "body"
  | "ear"
  | "eye"
  | "eyebrow"
  | "eyeLine"
  | "facialHair"
  | "glasses"
  | "hair"
  | "hairBg"
  | "head"
  | "jersey"
  | "miscLine"
  | "mouth"
  | "nose"
  | "smileLine"
  | "earring";

export type Race = "asian" | "black" | "brown" | "white";

export type TeamColors = [string, string, string];

export type FeatureInfo = {
  id?: string;
  name: Feature;
  positions: [null] | [number, number][];
  scaleFatness?: boolean;
  shiftWithEyes?: boolean;
  opaqueLines?: boolean;
  placeBeginning?: boolean;
  flip?: boolean;
  size?: number;
};

export type Face = ReturnType<typeof generate>;

export type HSL = {
  h: number;
  s: number;
  l: number;
};

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type HEX = string;
