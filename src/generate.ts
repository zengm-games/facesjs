import override from "./override.js";
import { svgsGenders, svgsIndex } from "./svgs-index.js";
import {
  type FaceConfig,
  type Feature,
  type Gender,
  type Overrides,
  type Race,
  races,
  type TeamColors,
} from "./common.js";
import { randChoice, randInt, randUniform } from "./utils.js";
import { generateRelative } from "./generateRelative.js";

const getID = (type: Feature, gender: Gender): string => {
  const validIDs = svgsIndex[type].filter((_id, index) => {
    return (
      svgsGenders[type][index] === "both" || svgsGenders[type][index] === gender
    );
  });

  return randChoice(validIDs);
};

export const colors = {
  white: {
    skin: ["#f2d6cb", "#ddb7a0"],
    hair: [
      "#272421",
      "#3D2314",
      "#5A3825",
      "#CC9966",
      "#2C1608",
      "#B55239",
      "#e9c67b",
      "#D7BF91",
    ],
  },
  asian: {
    // https://imgur.com/a/GrBuWYw
    skin: ["#fedac7", "#f0c5a3", "#eab687"],
    hair: ["#272421", "#0f0902"],
  },
  brown: {
    skin: ["#bb876f", "#aa816f", "#a67358"],
    hair: ["#272421", "#1c1008"],
  },
  black: { skin: ["#ad6453", "#74453d", "#5c3937"], hair: ["#272421"] },
};

const defaultTeamColors: TeamColors = ["#89bfd3", "#7a1319", "#07364f"];

const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

export const numberRanges = {
  "body.size": {
    female: [0.8, 0.9],
    male: [0.95, 1.05],
  },
  fatness: {
    female: [0, 0.4],
    male: [0, 1],
  },
  "ear.size": {
    female: [0.5, 1],
    male: [0.5, 1.5],
  },
  "eye.angle": {
    female: [-10, 15],
    male: [-10, 15],
  },
  "eyebrow.angle": {
    female: [-15, 20],
    male: [-15, 20],
  },
  "head.shave": {
    female: [0, 0],
    male: [0, 0.2],
  },
  "nose.size": {
    female: [0.5, 1],
    male: [0.5, 1.25],
  },
  "smileLine.size": {
    female: [0.25, 2.25],
    male: [0.25, 2.25],
  },
} as const;

const getRandInt = (key: keyof typeof numberRanges, gender: Gender) => {
  return randInt(numberRanges[key][gender][0], numberRanges[key][gender][1]);
};

const getRandUniform = (key: keyof typeof numberRanges, gender: Gender) => {
  return roundTwoDecimals(
    randUniform(numberRanges[key][gender][0], numberRanges[key][gender][1]),
  );
};

export const generate = (
  overrides?: Overrides,
  options?: { gender?: Gender; race?: Race; relative?: FaceConfig },
): FaceConfig => {
  const gender = options?.gender ?? "male";

  let face;
  if (options?.relative) {
    face = generateRelative({
      gender,
      race: options.race,
      relative: options.relative,
    });
  } else {
    const race = options?.race ?? randChoice(races);

    const palette = colors[race];
    const skinColor = randChoice(palette.skin);
    const hairColor = randChoice(palette.hair);

    face = {
      fatness: getRandUniform("fatness", gender),
      teamColors: defaultTeamColors,
      hairBg: {
        id:
          Math.random() < (gender === "male" ? 0.1 : 0.9)
            ? getID("hairBg", gender)
            : "none",
      },
      body: {
        id: getID("body", gender),
        color: skinColor,
        size: getRandUniform("body.size", gender),
      },
      jersey: {
        id: getID("jersey", gender),
      },
      ear: {
        id: getID("ear", gender),
        size: getRandUniform("ear.size", gender),
      },
      head: {
        id: getID("head", gender),
        shave: `rgba(0,0,0,${
          gender === "male" && Math.random() < 0.25
            ? getRandUniform("head.shave", gender)
            : 0
        })`,
      },
      eyeLine: {
        id: Math.random() < 0.75 ? getID("eyeLine", gender) : "none",
      },
      smileLine: {
        id:
          Math.random() < (gender === "male" ? 0.75 : 0.1)
            ? getID("smileLine", gender)
            : "none",
        size: getRandUniform("smileLine.size", gender),
      },
      miscLine: {
        id: Math.random() < 0.5 ? getID("miscLine", gender) : "none",
      },
      facialHair: {
        id: Math.random() < 0.5 ? getID("facialHair", gender) : "none",
      },
      eye: { id: getID("eye", gender), angle: getRandInt("eye.angle", gender) },
      eyebrow: {
        id: getID("eyebrow", gender),
        angle: getRandInt("eyebrow.angle", gender),
      },
      hair: {
        id: getID("hair", gender),
        color: hairColor,
        flip: Math.random() < 0.5,
      },
      mouth: {
        id: getID("mouth", gender),
        flip: Math.random() < 0.5,
      },
      nose: {
        id: getID("nose", gender),
        flip: Math.random() < 0.5,
        size: getRandUniform("nose.size", gender),
      },
      glasses: {
        id: Math.random() < 0.1 ? getID("glasses", gender) : "none",
      },
      accessories: {
        id: Math.random() < 0.2 ? getID("accessories", gender) : "none",
      },
    };
  }

  override(face, overrides);

  return face;
};
