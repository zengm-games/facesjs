import delve from "dlv";
import { dset } from "dset";
import { colors, generate, numberRanges } from "./generate";
import { features, races, type FaceConfig, type Gender } from "./types";
import { deepCopy } from "./utils";
import { svgsGenders, svgsIndex } from "./svgs-index";

// Currently, race just affects skin color and hair color. Let's ignore hair color (since you could imagine it being dyed anyway) and figure out someone's race just based on skin color. If no race is found, return undefined.
const imputeRace = (face: FaceConfig) => {
  return races.find((race) => colors[race].skin.includes(face.body.color));
};

export const makeRelative = ({
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

  // Always regenerate some properties
  face.accessories = randomFace.accessories;
  face.body.size = randomFace.body.size;
  face.facialHair = randomFace.facialHair;
  face.fatness = randomFace.fatness;
  face.glasses = randomFace.glasses;
  face.hair.id = randomFace.hair.id;
  face.hair.flip = randomFace.hair.flip;
  face.hairBg = randomFace.hairBg;
  face.head.shave = randomFace.head.shave;

  // Regenerate some properties with some probability
  const probRegenerate = 0.5;
  const regenerateProperties = [
    "eyeLine",
    "miscLine",
    "mouth",
    "nose",
    "smileLine",
    "eye.angle",
    "eyebrow.angle",
    "body.id",
    "ear.id",
    "eye.id",
    "eyebrow.id",
    "head.id",
    "ear.size",
  ] as const;
  for (const path of regenerateProperties) {
    if (Math.random() < probRegenerate) {
      dset(face, path, delve(randomFace, path));
    }
  }

  // Maybe apply race-appropriate new colors, if we have been able to identify the original race
  if (race !== undefined) {
    if (Math.random() < probRegenerate) {
      face.body.color = randomFace.body.color;
    }
    if (Math.random() < probRegenerate) {
      face.hair.color = randomFace.hair.color;
    }
  }

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
