import { Face, Gender, Overrides, Race } from "../../src";

export type GenerateOptions = { gender?: Gender; race?: Race };

export type GallerySize = "sm" | "md" | "lg";

export type FaceState = {
  faceConfig: Face;
  setFaceStore: (newFace: Face) => void;
};

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
  setShuffleGenderSettingObject: (options: Gender[]) => void;
  setShuffleRaceSettingObject: (options: Race[]) => void;
};

type GallerySectionConfigBase = {
  key: string;
  text: string;
  isSelected?: boolean;
  randomizeEnabled: boolean;
  noneAllowed?: boolean;
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

type GallerySectionConfigBoolean = GallerySectionConfigBase & {
  selectionType: "boolean";
  selectedValue: boolean;
  renderOptions: {
    valuesToRender: boolean[];
  };
};

type GallerySectionConfigColor = GallerySectionConfigBase & {
  selectionType: "color";
  selectedValue: string | [string, string, string];
  renderOptions: {
    colorCount: number;
  };
};

type GallerySectionConfigSvgs = GallerySectionConfigBase & {
  selectionType: "svgs";
  selectedValue: string;
};

export type GallerySectionConfig =
  | GallerySectionConfigRange
  | GallerySectionConfigBoolean
  | GallerySectionConfigColor
  | GallerySectionConfigSvgs;

export type CombinedState = FaceState & GalleryState;

export type OverrideListItem = {
  override: Overrides;
  display: string;
  value: string | number | boolean;
  ref?: any;
};

export type OverrideList = OverrideListItem[];
