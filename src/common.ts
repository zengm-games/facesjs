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

export type FaceConfig = {
  fatness: number;
  teamColors: TeamColors;
  hairBg: {
    id: string;
  };
  body: {
    id: string;
    color: string;
    size: number;
  };
  jersey: {
    id: string;
  };
  ear: {
    id: string;
    size: number;
  };
  head: {
    id: string;
    shave: string;
  };
  eyeLine: {
    id: string;
  };
  smileLine: {
    id: string;
    size: number;
  };
  miscLine: {
    id: string;
  };
  facialHair: {
    id: string;
  };
  eye: {
    id: string;
    angle: number;
  };
  eyebrow: {
    id: string;
    angle: number;
  };
  hair: {
    id: string;
    color: string;
    flip: boolean;
  };
  mouth: {
    id: string;
    flip: boolean;
  };
  nose: {
    id: string;
    flip: boolean;
    size: number;
  };
  glasses: {
    id: string;
  };
  accessories: {
    id: string;
  };
};
