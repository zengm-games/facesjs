import { generate } from "../src/generate";
import { FaceConfig, GallerySectionConfig } from "../src/types";
import { deepCopy, deleteFromDict } from "./utils";

export const shuffleEntireFace = (
  faceConfig: FaceConfig,
  gallerySectionConfigList: GallerySectionConfig[],
  setFaceStore: any,
) => {
  let faceConfigCopy = deepCopy(faceConfig);

  for (let gallerySectionConfig of gallerySectionConfigList) {
    if (gallerySectionConfig.randomizeEnabled) {
      deleteFromDict(faceConfigCopy, gallerySectionConfig.key);
    }
  }

  let newFace = generate(faceConfigCopy);
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
