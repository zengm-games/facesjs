import delve from "dlv";
import { dset } from "dset";
import { colors, generate, numberRanges } from "./generate";
import { features, races, type FaceConfig, type Gender } from "./common";
import { deepCopy } from "./utils";
import { svgsGenders, svgsIndex } from "./svgs-index";

// Currently, race just affects skin color and hair color. Let's ignore hair color (since you could imagine it being dyed anyway) and figure out someone's race just based on skin color. If no race is found, return undefined.
const imputeRace = (face: FaceConfig) => {
  return races.find((race) => colors[race].skin.includes(face.body.color));
};

export const generateRelative = ({
  gender,
  relative,
}: {
  gender: Gender;
  relative: FaceConfig;
}) => {
  const face = deepCopy(relative);

  const race = imputeRace(face);

  const randomFace = generate(undefined, {
    gender,
    race,
  });

  // Regenerate some properties always, and others with some probability
  type RegenerateType = "always" | "sometimes" | "sometimesIfRaceIsKnown";
  type ToRegenerateProperties<T, U> = T extends object
    ? T extends any[]
      ? U
      : {
          [K in keyof T]: T[K] extends object
            ? ToRegenerateProperties<T[K], U> | U
            : U;
        }
    : U;
  type RegenerateProperties = ToRegenerateProperties<
    FaceConfig,
    RegenerateType
  >;

  const regenerateProperties: RegenerateProperties = {
    accessories: "always",
    body: {
      color: "sometimesIfRaceIsKnown",
      id: "sometimes",
      size: "always",
    },
    ear: "sometimes",
    eye: "sometimes",
    eyebrow: "sometimes",
    eyeLine: "sometimes",
    facialHair: "always",
    fatness: "always",
    glasses: "always",
    hair: {
      color: "sometimesIfRaceIsKnown",
      flip: "always",
      id: "always",
    },
    hairBg: "always",
    head: {
      id: "sometimes",
      shave: "always",
    },
    jersey: "always",
    miscLine: "sometimes",
    mouth: "sometimes",
    nose: "sometimes",
    smileLine: "sometimes",
    teamColors: "always",
  };

  const probRegenerate = 0.25;
  const processRegenerateProperties = (
    objOutput: any,
    objRandom: any,
    regeneratePropertiesLocal:
      | RegenerateProperties
      | Record<string, RegenerateType>,
  ) => {
    for (const [key, value] of Object.entries(regeneratePropertiesLocal)) {
      if (typeof value === "string") {
        if (
          value === "always" ||
          ((value === "sometimes" ||
            (value === "sometimesIfRaceIsKnown" && race !== undefined)) &&
            Math.random() < probRegenerate)
        ) {
          objOutput[key] = objRandom[key];
        }
      } else {
        processRegenerateProperties(objOutput[key], objRandom[key], value);
      }
    }
  };
  processRegenerateProperties(face, randomFace, regenerateProperties);

  // Override any ID properties that are not valid for the specified gender
  for (const key of features) {
    const svgIndex = svgsIndex[key].findIndex((id) => id === face[key].id);
    const svgGender = svgsGenders[key][svgIndex];
    if (
      svgIndex < 0 ||
      (svgGender === "male" && gender === "female") ||
      (svgGender === "female" && gender === "male")
    ) {
      face[key].id = randomFace[key].id;
    }
  }

  // Override any numeric properties that are not valid for the specified gender
  for (const [path, ranges] of Object.entries(numberRanges)) {
    const current = delve(face, path);
    const range = ranges[gender];
    if (current < range[0] || current > range[1]) {
      dset(face, path, delve(randomFace, path));
    }
  }

  return face;
};
