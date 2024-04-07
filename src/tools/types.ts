
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
    name: Feature;
    positions: [null] | [number, number][];
    scaleFatness?: boolean;
    shiftWithEyes?: boolean;
    opaqueLines?: boolean;
};

// export type FaceConfigSections = Exclude<keyof FaceConfig, FaceConfigGlobalAttrs>;
export type FaceConfigGlobalAttrs = "fatness" | "teamColors" | "eyeDistance" | "lineOpacity";


export type FaceConfig = {
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
        color?: string,
        flip?: boolean,
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

export type FaceState = {
    faceConfig: FaceConfig
    setFaceStore: (newFace: FaceConfig) => void
}


export type ToolbarItemConfig = {
    key: string,
    text: string,
    isSelected?: boolean,
    hasSvgs?: boolean,
    noneAllowed?: boolean,
    selectionType?: 'range' | 'boolean' | 'color' | 'svgs',
    renderOptions?: {
        rangeConfig?: {
            min: number,
            max: number,
            step: number,
            sliderStep?: number
        },
        isColor?: boolean,
        isBoolean?: boolean,
        valuesToRender?: any[],
    }
}
export type ToolbarConfig = {
    [key: string]: ToolbarItemConfig[]
}

export type ToolbarState = {
    toolbarConfig: ToolbarConfig
    getSelectedItem: () => ToolbarItemConfig | null
    isSelectedItem: (key: string) => boolean
    setSelectedItem: (key: string) => void
    setSelectedFeatureSection: (section: string) => void
    selectedFeatureSection: string
}

export type CombinedState = ToolbarState & FaceState