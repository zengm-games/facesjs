import override from "../src/override";
import { svgsIndex } from "../src/svgs-index";
import {
  FaceConfig,
  GallerySectionConfig,
  OverrideList,
  Overrides,
} from "../src/types";
import {
  deepCopy,
  doesStrLookLikeColor,
  getFromDict,
  luma,
  setToDict,
} from "./utils";

export const getOverrideListForItem = (
  gallerySectionConfig: GallerySectionConfig | null,
): OverrideList => {
  if (!gallerySectionConfig) return [];

  let overrideList: OverrideList = [];

  if (gallerySectionConfig.selectionType === "svgs") {
    if (gallerySectionConfig.key.includes("id")) {
      let featureName = gallerySectionConfig.key.split(".")[0] as string;
      let svgNames: any[] = getFromDict(svgsIndex, featureName);

      svgNames = svgNames.sort((a, b) => {
        if (a === "none" || a === "bald") return -1;
        if (b === "none" || b === "bald") return 1;

        if (doesStrLookLikeColor(a) && doesStrLookLikeColor(b)) {
          return luma(a) - luma(b);
        }

        let regex = /^([a-zA-Z-]+)(\d*)$/;
        let matchA = a.match(regex);
        let matchB = b.match(regex);

        let textA = matchA ? matchA[1] : a,
          numA = matchA ? matchA[2] : "";
        let textB = matchB ? matchB[1] : b,
          numB = matchB ? matchB[2] : "";

        if (textA < textB) return -1;
        if (textA > textB) return 1;

        if (numA && numB) {
          return parseInt(numA, 10) - parseInt(numB, 10);
        }

        if (numA) return 1;
        if (numB) return -1;

        return 0;
      });

      for (let i = 0; i < svgNames.length; i++) {
        let overrides: Overrides = { [featureName]: { id: svgNames[i] } };
        overrideList.push({
          override: overrides,
          display: svgNames[i],
          value: svgNames[i],
        });
      }
    }
  } else if (gallerySectionConfig.renderOptions?.valuesToRender) {
    for (
      let i = 0;
      i < gallerySectionConfig.renderOptions.valuesToRender.length;
      i++
    ) {
      let valueToRender = gallerySectionConfig.renderOptions.valuesToRender[i];
      let overrides: Overrides = setToDict(
        {},
        gallerySectionConfig.key,
        valueToRender,
      ) as Overrides;
      overrideList.push({
        override: overrides,
        display: valueToRender,
        value: valueToRender,
      });
    }
  }

  return overrideList;
};

export const newFaceConfigFromOverride = (
  faceConfig: FaceConfig,
  gallerySectionConfig: GallerySectionConfig,
  chosenValue: any,
): FaceConfig => {
  let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
  let newOverride: Overrides = setToDict(
    {},
    gallerySectionConfig?.key || "",
    chosenValue,
  ) as Overrides;
  override(faceConfigCopy, newOverride);
  return faceConfigCopy;
};
