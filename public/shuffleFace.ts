import { generate } from "../src/generate";
import {
  FaceConfig,
  GallerySectionConfig,
  GenerateOptions,
} from "../src/types";
import { deepCopy, deleteFromDict, pickRandom } from "./utils";

export const shuffleEntireFace = (
  faceConfig: FaceConfig,
  gallerySectionConfigList: GallerySectionConfig[],
  stateStore: any,
) => {
  let { setFaceStore, shuffleGenderSettingObject, shuffleRaceSettingObject } =
    stateStore;
  let faceConfigCopy: FaceConfig = deepCopy(faceConfig);

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
  faceConfig: FaceConfig,
) => {
  let faceConfigCopy = deepCopy(faceConfig);
  faceConfigCopy = deleteFromDict(faceConfigCopy, gallerySectionConfig.key);
  let newFace = generate(faceConfigCopy);
  setFaceStore(newFace);
};
