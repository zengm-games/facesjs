
export type Overrides = {
    [key: string]: boolean | string | number | any[] | Overrides;
};

export type TeamColors = [string, string, string];

export type Gender = "male" | "female";
export type GenderOptions = "male" | "female" | "both";

export type Feature =
    | "accessories"
    | "body"
    | "ear"
    | "earring"
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
    | "smileLine";

export type Race = "asian" | "black" | "brown" | "white";

export type FeatureInfo = {
    id?: string;
    name: Exclude<keyof Face, "fatness" | "teamColors" | "eyeDistance" | "lineOpacity">;
    positions: [null] | [number, number][];
    scaleFatness?: boolean;
    shiftWithEyes?: boolean;
    opaqueLines?: boolean;
};


export type Face = {
    fatness: number,
    lineOpacity: number,
    teamColors: TeamColors,
    eyeDistance: number,
    hairBg: {
        id: string,
    },
    body: {
        id: string,
        color: string,
        size: number,
    },
    jersey: {
        id: string,
    },
    ear: {
        id: string,
        size: number,
    },
    earring: {
        id: string,
    },
    head: {
        id: string,
        shaveOpacity: number,
    },
    eyeLine: {
        id: string,
    },
    smileLine: {
        id: string,
        size: number,
    },
    miscLine: {
        id: string,
    },
    facialHair: {
        id: string,
    },
    eye: {
        id: string,
        angle: number,
    },
    eyebrow: {
        id: string,
        angle: number,
    },
    hair: {
        id: string,
        color: string,
        flip: boolean,
    },
    mouth: {
        id: string,
        flip: boolean,
        size: number,
    },
    nose: {
        id: string,
        flip: boolean,
        size: number,
    },
    glasses: {
        id: string,
    },
    accessories: {
        id: string,
    },
}