import { FaceConfig, Gender, Overrides, Race } from "../../src";

export type GallerySize = "sm" | "md" | "lg";
export type ColorFormat = "hex" | "rgba";

export type FaceState = {
  faceConfig: FaceConfig;
  setFaceStore: (newFace: FaceConfig) => void;
};

export type OtherSetting = "relative";

export type GalleryState = {
  gallerySize: GallerySize;
  gallerySectionConfigList: GallerySectionConfig[];
  setGallerySize: (size: GallerySize) => void;
  lastClickedSectionIndex: number;
  setLastClickedSectionIndex: (index: number) => void;
  lastSelectedFaceIndex: number;
  setLastSelectedFaceIndex: (index: number) => void;
  setRandomizeEnabledForSection: (
    sectionIndex: number,
    enabled: boolean,
  ) => void;

  shuffleGenderSettingObject: Gender[];
  shuffleRaceSettingObject: Race[];
  shuffleOtherSettingObject: OtherSetting[];
  setShuffleGenderSettingObject: (options: Gender[]) => void;
  setShuffleRaceSettingObject: (options: Race[]) => void;
  setShuffleOtherSettingObject: (options: OtherSetting[]) => void;
};

type GallerySectionConfigBase = {
  key: string;
  text: string;
  isSelected?: boolean;
  randomizeEnabled: boolean;
};

type GallerySectionConfigRange = GallerySectionConfigBase & {
  selectionType: "range";
  selectedValue: number;
  renderOptions: {
    rangeConfig: {
      min: number;
      max: number;
      step: number;
      sliderStep: number;
    };
    valuesToRender: number[];
  };
};

type GallerySectionConfigColor = GallerySectionConfigBase & {
  selectionType: "color";
  selectedValue: string;
  colorFormat: ColorFormat;
  renderOptions: {
    valuesToRender: string[];
  };
};

type GallerySectionConfigColors = GallerySectionConfigBase & {
  selectionType: "colors";
  selectedValue: string[];
  colorFormat: ColorFormat;
  renderOptions: {
    colorCount: number;
    valuesToRender: string[][];
  };
};

type GallerySectionConfigSvgs = GallerySectionConfigBase & {
  selectionType: "svgs";
  selectedValue: string;
  flip?: {
    key: string;
    selectedValue: boolean;
  };
};

export type GallerySectionConfig =
  | GallerySectionConfigRange
  | GallerySectionConfigColor
  | GallerySectionConfigColors
  | GallerySectionConfigSvgs;

export type CombinedState = FaceState &
  GalleryState & {
    fromParent: { key: number; opener: (typeof window)["opener"] } | undefined;
  };

export type OverrideListItem = {
  override: Overrides;
  value: string | number | string[];
};
