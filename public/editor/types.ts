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

export type GallerySectionConfig = {
  key: string;
  text: string;
  isSelected?: boolean;
  randomizeEnabled?: boolean;
  selectedValue?: number | string | boolean;
  hasSvgs?: boolean;
  noneAllowed?: boolean;
  selectionType?: "range" | "boolean" | "color" | "svgs";
  renderOptions?: {
    rangeConfig?: {
      min: number;
      max: number;
      step?: number;
      sliderStep?: number;
    };
    isColor?: boolean;
    colorCount?: number;
    isBoolean?: boolean;
    valuesToRender?: any[];
  };
};

export type CombinedState = FaceState & GalleryState;

export type OverrideListItem = {
  override: Overrides;
  display: string;
  value: string | number | boolean;
  ref?: any;
};

export type OverrideList = OverrideListItem[];
