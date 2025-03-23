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

  // Regenerate some properties always, and others with some probabilityF
  const probRegenerate = 0.25;
  const regenerateProperties = {
    accessories: "always",
    "body.id": "sometimes",
    "body.size": "always",
    "ear.id": "sometimes",
    "ear.size": "sometimes",
    "eye.angle": "sometimes",
    "eye.id": "sometimes",
    "eyebrow.angle": "sometimes",
    "eyebrow.id": "sometimes",
    eyeLine: "sometimes",
    "face.body.color": "sometimesIfRaceIsKnown",
    "face.hair.color": "sometimesIfRaceIsKnown",
    facialHair: "always",
    fatness: "always",
    glasses: "always",
    "hair.flip": "always",
    "hair.id": "always",
    hairBg: "always",
    "head.id": "sometimes",
    "head.shave": "always",
    miscLine: "sometimes",
    mouth: "sometimes",
    nose: "sometimes",
    smileLine: "sometimes",
  } as const;

  for (const [path, regenerateType] of Object.entries(regenerateProperties)) {
    if (
      regenerateType === "always" ||
      ((regenerateType === "sometimes" ||
        (regenerateType === "sometimesIfRaceIsKnown" && race !== undefined)) &&
        Math.random() < probRegenerate)
    ) {
      dset(face, path, delve(randomFace, path));
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
