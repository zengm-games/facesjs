import { Face } from "../../src/types";
import { generate } from "../../src/generate";
import { GallerySectionConfig, GenerateOptions } from "./types";
import { deepCopy, deleteFromDict, pickRandom } from "./utils";

export const shuffleEntireFace = (
  faceConfig: Face,
  gallerySectionConfigList: GallerySectionConfig[],
  stateStore: any,
) => {
  const { setFaceStore, shuffleGenderSettingObject, shuffleRaceSettingObject } =
    stateStore;
  const faceConfigCopy = deepCopy(faceConfig);

  let options: GenerateOptions = {};
  console.log("shuffleEntireFace", {
    shuffleGenderSettingObject,
    shuffleRaceSettingObject,
  });

  for (let gallerySectionConfig of gallerySectionConfigList) {
    if (gallerySectionConfig.randomizeEnabled) {
      deleteFromDict(faceConfigCopy, gallerySectionConfig.key);
    }
  }

  for (let [featureName, featureVal] of Object.entries(faceConfigCopy)) {
    if (
      featureVal === undefined ||
      (typeof featureVal == "object" && Object.keys(featureVal).length === 0)
    ) {
      // @ts-ignore
      delete faceConfigCopy[featureName];
    }
  }

  if (shuffleGenderSettingObject.length > 0) {
    options.gender = pickRandom(shuffleGenderSettingObject);
  }

  if (shuffleRaceSettingObject.length > 0) {
    options.race = pickRandom(shuffleRaceSettingObject);
  }

  let newFace = generate(faceConfigCopy, options);
  console.log("newFace", {
    newFace,
    faceConfigCopy,
    options,
    shuffleRaceSettingObject,
    shuffleGenderSettingObject,
  });
  setFaceStore(newFace);
};

export const shuffleOptions = (
  gallerySectionConfig: GallerySectionConfig,
  setFaceStore: any,
  faceConfig: Face,
) => {
  let faceConfigCopy = deepCopy(faceConfig);
  faceConfigCopy = deleteFromDict(faceConfigCopy, gallerySectionConfig.key);
  const newFace = generate(faceConfigCopy);
  setFaceStore(newFace);
};
