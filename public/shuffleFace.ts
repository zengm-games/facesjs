import { generate } from "../src/generate";
import { raceBySkinColor } from "../src/globals";
import {
  FaceConfig,
  GallerySectionConfig,
  GenerateOptions,
  Race,
} from "../src/types";
import { deepCopy, deleteFromDict } from "./utils";

export const shuffleEntireFace = (
  faceConfig: FaceConfig,
  gallerySectionConfigList: GallerySectionConfig[],
  setFaceStore: any,
) => {
  let faceConfigCopy = deepCopy(faceConfig);

  let options: GenerateOptions = {};

  for (let gallerySectionConfig of gallerySectionConfigList) {
    if (gallerySectionConfig.randomizeEnabled) {
      deleteFromDict(faceConfigCopy, gallerySectionConfig.key);
    }

    if (
      !gallerySectionConfig.randomizeEnabled &&
      gallerySectionConfig.key === "body.color" &&
      faceConfig.body.color &&
      raceBySkinColor[faceConfig.body.color]
    ) {
      let inferredRace: Race = raceBySkinColor[
        faceConfig.body.color
      ][0] as Race;
      if (inferredRace) {
        options.race = inferredRace;
      }
    }
  }

  let newFace = generate(faceConfigCopy, options);
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
