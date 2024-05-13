import { create, StateCreator } from "zustand";
import { CombinedState, GallerySectionConfig, GallerySize } from "./types";
import { generate } from "../../src/generate";
import { generateRangeFromStep, getFromDict, roundTwoDecimals } from "./utils";
import {
  distinctHairColors,
  distinctSkinColors,
  jerseyColorOptions,
} from "./defaultColors";
import { FaceConfig, Gender, Race } from "../../src/types";

const gallerySectionInfos: (Pick<
  GallerySectionConfig,
  "key" | "text" | "isSelected"
> &
  (
    | {
        selectionType: "color";
        colorFormat: "rgba" | "hex";
        allowAlpha: boolean;
        renderOptions: {
          valuesToRender: string[];
        };
      }
    | {
        selectionType: "colors";
        colorFormat: "rgba" | "hex";
        allowAlpha: boolean;
        renderOptions: {
          colorCount: number;
          valuesToRender: string[][];
        };
      }
    | {
        selectionType: "range";
        renderOptions: {
          rangeConfig: {
            min: number;
            max: number;
          };
        };
      }
    | {
        selectionType: "svgs";
        flip?: {
          key: string;
        };
      }
  ))[] = [
  {
    key: "body.color",
    text: "Skin Color",
    isSelected: true,
    selectionType: "color",
    colorFormat: "hex",
    allowAlpha: false,
    renderOptions: {
      valuesToRender: distinctSkinColors,
    },
  },
  {
    key: "body.size",
    text: "Body Size",
    selectionType: "range",
    renderOptions: {
      rangeConfig: {
        min: 0.8,
        max: 1.2,
      },
    },
  },
  {
    key: "body.id",
    text: "Body Shape",
    selectionType: "svgs",
  },
  {
    key: "head.id",
    text: "Head Shape",
    selectionType: "svgs",
  },
  {
    key: "fatness",
    text: "Face Size",
    selectionType: "range",
    renderOptions: {
      rangeConfig: {
        min: 0,
        max: 1,
      },
    },
  },
  {
    key: "mouth.id",
    text: "Mouth Shape",
    selectionType: "svgs",
    flip: { key: "mouth.flip" },
  },
  {
    key: "eye.id",
    text: "Eye Shape",
    selectionType: "svgs",
  },
  {
    key: "eye.angle",
    text: "Eye Angle",
    selectionType: "range",
    renderOptions: {
      rangeConfig: {
        min: -10,
        max: 15,
      },
    },
  },
  {
    key: "ear.id",
    text: "Ear Shape",
    selectionType: "svgs",
  },
  {
    key: "ear.size",
    text: "Ear Size",
    selectionType: "range",
    renderOptions: {
      rangeConfig: {
        min: 0.5,
        max: 1.5,
      },
    },
  },
  {
    key: "hair.id",
    text: "Hair Style",
    selectionType: "svgs",
    flip: { key: "hair.flip" },
  },
  {
    key: "hair.color",
    text: "Hair Color",
    selectionType: "color",
    colorFormat: "hex",
    allowAlpha: false,
    renderOptions: {
      valuesToRender: distinctHairColors,
    },
  },
  {
    key: "hairBg.id",
    text: "Hair Background",
    selectionType: "svgs",
  },
  {
    key: "facialHair.id",
    text: "Facial Hair Style",
    selectionType: "svgs",
  },
  {
    key: "head.shave",
    text: "Shave Style",
    selectionType: "color",
    colorFormat: "rgba",
    allowAlpha: true,
    renderOptions: {
      valuesToRender: [
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0.1)",
        "rgba(0,0,0,0.2)",
        "rgba(0,0,0,0.3)",
        "rgba(0,0,0,0.4)",
        "rgba(0,0,0,0.5)",
      ],
    },
  },
  {
    key: "eyebrow.id",
    text: "Eyebrow Style",
    selectionType: "svgs",
  },
  {
    key: "eyebrow.angle",
    text: "Eyebrow Angle",
    selectionType: "range",
    renderOptions: {
      rangeConfig: {
        min: -15,
        max: 20,
      },
    },
  },
  {
    key: "nose.id",
    text: "Nose Shape",
    selectionType: "svgs",
    flip: { key: "nose.flip" },
  },
  {
    key: "nose.size",
    text: "Nose Size",
    selectionType: "range",
    renderOptions: {
      rangeConfig: {
        min: 0.5,
        max: 1.25,
      },
    },
  },
  {
    key: "eyeLine.id",
    text: "Eye Line Style",
    selectionType: "svgs",
  },
  {
    key: "smileLine.id",
    text: "Smile Line Style",
    selectionType: "svgs",
  },
  {
    key: "smileLine.size",
    text: "Smile Line Size",
    selectionType: "range",
    renderOptions: {
      rangeConfig: {
        min: 0.25,
        max: 2.25,
      },
    },
  },
  {
    key: "miscLine.id",
    text: "Misc Line Style",
    selectionType: "svgs",
  },
  {
    key: "glasses.id",
    text: "Glasses Style",
    selectionType: "svgs",
  },
  {
    key: "accessories.id",
    text: "Accessories Style",
    selectionType: "svgs",
  },

  {
    key: "jersey.id",
    text: "Jersey Style",
    selectionType: "svgs",
  },
  {
    key: "teamColors",
    text: "Team Colors",
    selectionType: "colors",
    colorFormat: "hex",
    allowAlpha: false,
    renderOptions: {
      colorCount: 3,
      valuesToRender: jerseyColorOptions,
    },
  },
];

const gallerySectionConfigList: GallerySectionConfig[] =
  gallerySectionInfos.map((gallerySectionConfig) => {
    if (gallerySectionConfig.selectionType === "range") {
      const rangeConfig = gallerySectionConfig.renderOptions.rangeConfig;

      const range = rangeConfig.max - rangeConfig.min;
      const step = roundTwoDecimals(range / 5);
      const sliderStep = Math.max(roundTwoDecimals(range / 35), 0.01);

      const valuesToRender = generateRangeFromStep(
        rangeConfig.min,
        rangeConfig.max,
        step,
      );

      return {
        ...gallerySectionConfig,
        renderOptions: {
          ...gallerySectionConfig.renderOptions,
          rangeConfig: {
            ...gallerySectionConfig.renderOptions.rangeConfig,
            step,
            sliderStep,
          },
          valuesToRender,
        },
        randomizeEnabled: true,
        selectedValue: rangeConfig.min,
      };
    } else if (gallerySectionConfig.selectionType === "color") {
      return {
        ...gallerySectionConfig,
        randomizeEnabled: true,
        selectedValue: "???",
      };
    } else if (gallerySectionConfig.selectionType === "colors") {
      return {
        ...gallerySectionConfig,
        randomizeEnabled: true,
        selectedValue: Array(
          gallerySectionConfig.renderOptions.colorCount,
        ).fill("#000000"),
      };
    } else {
      const flip = gallerySectionConfig.flip
        ? {
            ...gallerySectionConfig.flip,
            selectedValue: false,
          }
        : undefined;

      return {
        ...gallerySectionConfig,
        randomizeEnabled: true,
        selectedValue: "???",
        flip,
      };
    }
  });

const generateInitialFace = () => {
  let faceConfig: FaceConfig;
  if (location.hash.length <= 1) {
    faceConfig = generate();
  } else {
    try {
      faceConfig = JSON.parse(atob(location.hash.slice(1)));
    } catch (error) {
      console.error(error);
      faceConfig = generate();
    }
  }
  return faceConfig;
};

const applyValuesToGallerySectionConfigList = (
  gallerySectionConfigList: GallerySectionConfig[],
  face: FaceConfig,
) => {
  for (const row of gallerySectionConfigList) {
    row.selectedValue = getFromDict(face, row.key);

    if (row.selectionType === "svgs" && row.flip) {
      row.flip.selectedValue = getFromDict(face, row.flip.key);
    }
  }
};

const updateUrlHash = (face: FaceConfig) => {
  history.replaceState(undefined, "", `#${btoa(JSON.stringify(face))}`);
};

const initialFace = generateInitialFace();
applyValuesToGallerySectionConfigList(gallerySectionConfigList, initialFace);
updateUrlHash(initialFace);

const createGallerySlice: StateCreator<CombinedState, [], [], CombinedState> = (
  set,
) => ({
  faceConfig: initialFace,
  setFaceStore: (newFace: FaceConfig) =>
    set((state: CombinedState) => {
      history.replaceState(undefined, "", `#${btoa(JSON.stringify(newFace))}`);

      applyValuesToGallerySectionConfigList(gallerySectionConfigList, newFace);
      updateUrlHash(newFace);

      return {
        ...state,
        gallerySectionConfigList: [...gallerySectionConfigList],
        faceConfig: { ...newFace },
      };
    }),
  gallerySectionConfigList,
  gallerySize: "md",
  setGallerySize: (size: GallerySize) =>
    set((state: CombinedState) => {
      return { ...state, gallerySize: size };
    }),
  lastClickedSectionIndex: -1,
  setLastClickedSectionIndex: (index: number) =>
    set((state: CombinedState) => {
      return { ...state, lastClickedSectionIndex: index };
    }),
  lastSelectedFaceIndex: -1,
  setLastSelectedFaceIndex: (index: number) =>
    set((state: CombinedState) => {
      return { ...state, lastSelectedIndex: index };
    }),
  setRandomizeEnabledForSection: (sectionIndex: number, enabled: boolean) =>
    set((state: CombinedState) => {
      if (!state.gallerySectionConfigList[sectionIndex]) {
        return state;
      }
      state.gallerySectionConfigList[sectionIndex]!.randomizeEnabled = enabled;
      return {
        ...state,
        gallerySectionConfigList: [...state.gallerySectionConfigList],
      };
    }),

  shuffleGenderSettingObject: ["male"],
  shuffleRaceSettingObject: ["white", "brown", "black", "asian"],

  setShuffleGenderSettingObject: (options: Gender[]) =>
    set((state: CombinedState) => {
      return {
        ...state,
        shuffleGenderSettingObject: options,
      };
    }),
  setShuffleRaceSettingObject: (options: Race[]) =>
    set((state: CombinedState) => {
      return {
        ...state,
        shuffleRaceSettingObject: options,
      };
    }),
});

export const useStateStore = create<CombinedState>()(
  (...a: [any, any, any]) => ({
    ...createGallerySlice(...a),
  }),
);
