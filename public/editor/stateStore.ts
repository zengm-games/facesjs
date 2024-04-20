import { create, StateCreator } from "zustand";
import {
  CombinedState,
  FaceConfig,
  GallerySectionConfig,
  GallerySize,
} from "../../src/types";
import { generate } from "../../src/generate";
import { generateRangeFromStep, getFromDict, roundTwoDecimals } from "./utils";
import {
  distinctHairColors,
  distinctSkinColors,
  jerseyColorOptions,
} from "./globals";

let gallerySectionConfigList: GallerySectionConfig[] = [
  {
    key: "body.color",
    text: "Skin Color",
    isSelected: true,
    renderOptions: {
      isColor: true,
      valuesToRender: distinctSkinColors,
    },
  },
  {
    key: "body.size",
    text: "Body Size",
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
    hasSvgs: true,
  },
  {
    key: "head.id",
    text: "Head Shape",
    hasSvgs: true,
  },
  {
    key: "fatness",
    text: "Face Size",
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
    hasSvgs: true,
  },
  {
    key: "mouth.size",
    text: "Mouth Size",
    renderOptions: {
      rangeConfig: {
        min: 0.8,
        max: 1.2,
      },
    },
  },
  {
    key: "mouth.flip",
    text: "Mouth Flip",
    renderOptions: {
      isBoolean: true,
    },
  },

  {
    key: "eye.id",
    text: "Eye Shape",
    hasSvgs: true,
  },
  {
    key: "eye.angle",
    text: "Eye Angle",
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
    hasSvgs: true,
  },
  {
    key: "ear.size",
    text: "Ear Size",
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
    hasSvgs: true,
  },
  {
    key: "hair.color",
    text: "Hair Color",
    renderOptions: {
      isColor: true,
      valuesToRender: distinctHairColors,
    },
  },
  {
    key: "hair.flip",
    text: "Hair Flip",
    renderOptions: {
      isBoolean: true,
    },
  },
  {
    key: "hairBg.id",
    text: "Hair Background",
    hasSvgs: true,
  },

  {
    key: "facialHair.id",
    text: "Facial Hair Style",
    hasSvgs: true,
  },

  {
    key: "eyebrow.id",
    text: "Eyebrow Style",
    hasSvgs: true,
  },
  {
    key: "eyebrow.angle",
    text: "Eyebrow Angle",
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
    hasSvgs: true,
  },
  {
    key: "nose.size",
    text: "Nose Size",
    renderOptions: {
      rangeConfig: {
        min: 0.5,
        max: 1.25,
      },
    },
  },
  {
    key: "nose.flip",
    text: "Nose Flip",
    renderOptions: {
      isBoolean: true,
    },
  },

  {
    key: "eyeLine.id",
    text: "Eye Line Style",
    hasSvgs: true,
  },
  {
    key: "smileLine.id",
    text: "Smile Line Style",
    hasSvgs: true,
  },
  {
    key: "smileLine.size",
    text: "Smile Line Size",
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
    hasSvgs: true,
  },

  {
    key: "glasses.id",
    text: "Glasses Style",
    hasSvgs: true,
  },
  {
    key: "accessories.id",
    text: "Accessories Style",
    hasSvgs: true,
  },

  {
    key: "jersey.id",
    text: "Jersey Style",
    hasSvgs: true,
  },
  {
    key: "teamColors",
    text: "Team Colors",
    renderOptions: {
      isColor: true,
      colorCount: 3,
      valuesToRender: jerseyColorOptions,
    },
  },
];

for (const gallerySectionConfig of gallerySectionConfigList) {
  gallerySectionConfig.randomizeEnabled = true;

  if (
    gallerySectionConfig.renderOptions &&
    gallerySectionConfig.renderOptions.rangeConfig
  ) {
    const rangeConfig = gallerySectionConfig.renderOptions.rangeConfig;

    if (!rangeConfig.step || !rangeConfig.sliderStep) {
      let range = rangeConfig.max - rangeConfig.min;
      rangeConfig.step = roundTwoDecimals(range / 5);
      rangeConfig.sliderStep = Math.max(roundTwoDecimals(range / 35), 0.01);
    }

    gallerySectionConfig.renderOptions.valuesToRender = generateRangeFromStep(
      rangeConfig.min,
      rangeConfig.max,
      rangeConfig.step,
    );
    gallerySectionConfig.selectionType = "range";
  } else if (
    gallerySectionConfig.renderOptions &&
    gallerySectionConfig.renderOptions.isBoolean
  ) {
    gallerySectionConfig.renderOptions.valuesToRender = [false, true];
    gallerySectionConfig.selectionType = "boolean";
  } else if (
    gallerySectionConfig.renderOptions &&
    gallerySectionConfig.renderOptions.isColor
  ) {
    gallerySectionConfig.selectionType = "color";
  } else {
    gallerySectionConfig.selectionType = "svgs";
  }
}

const generateFirstFace = (): FaceConfig => {
  let faceConfig = generate() as FaceConfig;
  return faceConfig;
};

const createGallerySlice: StateCreator<CombinedState, [], [], CombinedState> = (
  set: any,
) => ({
  faceConfig: generateFirstFace(),
  setFaceStore: (newFace: FaceConfig) =>
    set((state: CombinedState) => {
      for (let gallerySectionConfig of gallerySectionConfigList) {
        gallerySectionConfig.selectedValue = getFromDict(
          newFace,
          gallerySectionConfig.key,
        );
      }

      return {
        ...state,
        gallerySectionConfigList: [...gallerySectionConfigList],
        faceConfig: { ...newFace },
      };
    }),
  gallerySectionConfigList: gallerySectionConfigList,
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

  setShuffleGenderSettingObject: (options: string[]) =>
    set((state: CombinedState) => {
      return {
        ...state,
        shuffleGenderSettingObject: options,
      };
    }),
  setShuffleRaceSettingObject: (options: string[]) =>
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
