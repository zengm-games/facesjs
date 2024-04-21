import { Face, Overrides } from "../../src/types";
import { generate } from "../../src/generate";
import { GallerySectionConfig, GenerateOptions } from "./types";
import { deepCopy, deleteFromDict, pickRandom } from "./utils";
import { jerseyColorOptions } from "./defaultColors";

export const shuffleEntireFace = (
  faceConfig: Face,
  gallerySectionConfigList: GallerySectionConfig[],
  stateStore: any,
) => {
  const { setFaceStore, shuffleGenderSettingObject, shuffleRaceSettingObject } =
    stateStore;
  const faceConfigCopy: Overrides = deepCopy(faceConfig);

  const options: GenerateOptions = {};

  for (const gallerySectionConfig of gallerySectionConfigList) {
    if (gallerySectionConfig.randomizeEnabled) {
      deleteFromDict(faceConfigCopy, gallerySectionConfig.key);
    }
  }

  for (const [featureName, featureVal] of Object.entries(faceConfigCopy)) {
    if (
      featureVal === undefined ||
      (typeof featureVal == "object" && Object.keys(featureVal).length === 0)
    ) {
      delete faceConfigCopy[featureName];
    }
  }

  if (shuffleGenderSettingObject.length > 0) {
    options.gender = pickRandom(shuffleGenderSettingObject);
  }

  if (shuffleRaceSettingObject.length > 0) {
    options.race = pickRandom(shuffleRaceSettingObject);
  }

  const newFace = generate(faceConfigCopy, options);
  setFaceStore(newFace);
};

export const shuffleOptions = (
  gallerySectionConfig: GallerySectionConfig,
  setFaceStore: any,
  faceConfig: Face,
) => {
  // Special case for team colors
  if (gallerySectionConfig.key === "teamColors") {
    const newFace = {
      ...faceConfig,
      teamColors: pickRandom(jerseyColorOptions),
    };
    setFaceStore(newFace);
  } else {
    const faceConfigCopy = deleteFromDict(
      deepCopy(faceConfig),
      gallerySectionConfig.key,
    );
    const newFace = generate(faceConfigCopy);
    setFaceStore(newFace);
  }
};
