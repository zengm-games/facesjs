import { FaceConfig, Overrides } from "../../src/types";
import { generate } from "../../src/generate";
import { CombinedState, GallerySectionConfig } from "./types";
import { deepCopy, deleteFromDict, pickRandom } from "./utils";
import { jerseyColorOptions } from "./defaultColors";

type GenerateOptions = Parameters<typeof generate>[1];

export const shuffleEntireFace = (
  faceConfig: FaceConfig,
  gallerySectionConfigList: GallerySectionConfig[],
  stateStore: CombinedState,
) => {
  const { setFaceStore, shuffleGenderSettingObject, shuffleRaceSettingObject } =
    stateStore;
  const faceConfigCopy: Overrides = deepCopy(faceConfig);

  const options: GenerateOptions = {};

  for (const gallerySectionConfig of gallerySectionConfigList) {
    if (gallerySectionConfig.randomizeEnabled) {
      deleteFromDict(faceConfigCopy, gallerySectionConfig.key);

      if (
        gallerySectionConfig.selectionType === "svgs" &&
        gallerySectionConfig.flip
      ) {
        deleteFromDict(faceConfigCopy, gallerySectionConfig.flip.key);
      }
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

  // Special case for team colors
  if (!(faceConfigCopy as any).teamColors) {
    (faceConfigCopy as any).teamColors = pickRandom(jerseyColorOptions);
  }

  const newFace = generate(faceConfigCopy, options);
  setFaceStore(newFace);
};

export const shuffleFeature = (
  gallerySectionConfig: GallerySectionConfig,
  stateStore: CombinedState,
  faceConfig: FaceConfig,
) => {
  const { setFaceStore, shuffleGenderSettingObject, shuffleRaceSettingObject } =
    stateStore;

  // Special case for team colors
  if (gallerySectionConfig.key === "teamColors") {
    const newFace = {
      ...faceConfig,
      teamColors: pickRandom(jerseyColorOptions),
    };
    setFaceStore(newFace);
  } else {
    const overrides = deleteFromDict(
      deepCopy(faceConfig),
      gallerySectionConfig.key,
    );

    if (
      gallerySectionConfig.selectionType === "svgs" &&
      gallerySectionConfig.flip
    ) {
      deleteFromDict(overrides, gallerySectionConfig.flip.key);
    }

    const options: GenerateOptions = {};
    if (shuffleGenderSettingObject.length > 0) {
      options.gender = pickRandom(shuffleGenderSettingObject);
    }
    if (shuffleRaceSettingObject.length > 0) {
      options.race = pickRandom(shuffleRaceSettingObject);
    }

    const newFace = generate(overrides, options);
    setFaceStore(newFace);
  }
};
