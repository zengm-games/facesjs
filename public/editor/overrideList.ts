import override from "../../src/override";
import { svgsIndex } from "../../src/svgs-index";
import { FaceConfig as FaceType, Overrides } from "../../src/common";
import { deepCopy } from "../../src/utils";
import { GallerySectionConfig, OverrideListItem } from "./types";
import { doesStrLookLikeColor, luma, setToDict } from "./utils";

export const getOverrideListForItem = (
  gallerySectionConfig: GallerySectionConfig,
) => {
  const overrideList: OverrideListItem[] = [];

  if (gallerySectionConfig.selectionType === "svgs") {
    if (gallerySectionConfig.key.includes("id")) {
      const featureName = gallerySectionConfig.key.split(".")[0];

      const svgNames = [
        ...(svgsIndex as Record<string, readonly string[]>)[featureName],
      ];
      svgNames.sort((a, b) => {
        if (a === "none" || a === "bald") return -1;
        if (b === "none" || b === "bald") return 1;

        if (doesStrLookLikeColor(a) && doesStrLookLikeColor(b)) {
          return luma(a) - luma(b);
        }

        const regex = /^([a-zA-Z-]+)(\d*)$/;
        const matchA = a.match(regex);
        const matchB = b.match(regex);

        const textA = matchA ? matchA[1] : a,
          numA = matchA ? matchA[2] : "";
        const textB = matchB ? matchB[1] : b,
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

      for (const svgName of svgNames) {
        const overrides: Overrides = { [featureName]: { id: svgName } };
        overrideList.push({
          override: overrides,
          value: svgName,
        });
      }
    }
  } else if (
    gallerySectionConfig.selectionType === "range" ||
    gallerySectionConfig.selectionType === "color" ||
    gallerySectionConfig.selectionType === "colors"
  ) {
    for (
      let i = 0;
      i < gallerySectionConfig.renderOptions.valuesToRender.length;
      i++
    ) {
      const valueToRender =
        gallerySectionConfig.renderOptions.valuesToRender[i];
      const overrides: Overrides = setToDict(
        {},
        gallerySectionConfig.key,
        valueToRender,
      ) as Overrides;
      overrideList.push({
        override: overrides,
        value: valueToRender,
      });
    }
  }

  return overrideList;
};

export const newFaceConfigFromOverride = (
  faceConfig: FaceType,
  key: string,
  chosenValue: unknown,
) => {
  const faceConfigCopy = deepCopy(faceConfig);
  const newOverride: Overrides = setToDict({}, key, chosenValue) as Overrides;
  override(faceConfigCopy, newOverride);
  return faceConfigCopy;
};
