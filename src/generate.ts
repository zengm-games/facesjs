import override from "./override.js";
import { svgsGenders, svgsIndex } from "./svgs-index.js";
import { Feature, Gender, Overrides, Race, TeamColors } from "./types.js";

export const jerseyColorOptions: TeamColors[] = [
  ["#98002E", "#BC9B6A", "#FFFFFF"],
  ["#F56600", "#522D80", "#FFFFFF"],
  ["#B3A369", "#003057", "#FFFFFF"],
  ["#CC0000", "#000000", "#FFFFFF"],
  ["#0C2340", "#C99700", "#00843D"],
  ["#003594", "#FFB81C", "#FFFFFF"],
  ["#630031", "#CF4420", "#FFFFFF"],
  ["#24135F", "#AD8900", "#000000"],
  ["#311D00", "#FF3C00", "#FFFFFF"],
  ["#552583", "#FDB927", "#FFFFFF"],
  ["#00538C", "#002B5E", "#FFFFFF"],
  ["#007AC1", "#EF3B24", "#002D62"],
  ["#007A33", "#FFFFFF", "#BA9653"],
  ["#98002E", "#F9A01B", "#FFFFFF"],
  ["#00471B", "#EEE1C6", "#FFFFFF"],
  ["#F74902", "#000000", "#FFFFFF"],
  ["#6F263D", "#236192", "#A2AAAD"],
  ["#BB0000", "#666666", "#FFFFFF"],
  ["#7A0019", "#FFCC33", "#FFFFFF"],
  ["#4E2A84", "#FFFFFF", "#000000"],
  ["#FFCD00", "#000000", "#FFFFFF"],
];

export const randomGaussian = (min: number, max: number) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) num = randomGaussian(min, max);
  num *= max - min;
  num += min;
  return num;
};

const pickRandom = (arr: any[]): any => {
  return arr[Math.floor(Math.random() * arr.length)];
};

function randomInt(
  minInclusive: number,
  max: number,
  inclusiveMax: boolean = false,
) {
  if (inclusiveMax) {
    max += 1;
  }
  return Math.floor(Math.random() * (max - minInclusive)) + minInclusive;
}

const getID = (type: Feature, gender: Gender): string => {
  const validIDs = svgsIndex[type].filter((_id, index) => {
    return (
      svgsGenders[type][index] === "both" || svgsGenders[type][index] === gender
    );
  });

  return validIDs[randomInt(0, validIDs.length)];
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
    eyes: ["#b3d1ff", "#a5b8d2", "#8a7d5e"],
  },
  asian: {
    // https://imgur.com/a/GrBuWYw
    skin: ["#fedac7", "#f0c5a3", "#eab687"],
    hair: ["#272421", "#0f0902"],
    eyes: ["#b3d1ff", "#a5b8d2", "#8a7d5e"],
  },
  brown: {
    skin: ["#bb876f", "#aa816f", "#a67358"],
    hair: ["#272421", "#1c1008"],
    eyes: ["#b3d1ff", "#a5b8d2", "#8a7d5e"],
  },
  black: {
    skin: ["#ad6453", "#74453d", "#5c3937"],
    hair: ["#272421"],
    eyes: ["#b3d1ff", "#a5b8d2", "#8a7d5e"],
  },
};

const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

export const generate = (
  overrides?: Overrides,
  options?: { gender?: Gender; race?: Race },
) => {
  const playerRace: Race = (() => {
    if (options && options.race) {
      return options.race;
    }
    switch (randomInt(0, 4)) {
      case 0:
        return "white";
      case 1:
        return "asian";
      case 2:
        return "brown";
      default:
        return "black";
    }
  })();

  const gender = options && options.gender ? options.gender : "male";

  let teamColors: TeamColors = pickRandom(jerseyColorOptions);
  const eyeAngle = randomInt(-10, 15, true);

  const palette = (() => {
    switch (playerRace) {
      case "white":
        return colors.white;
      case "asian":
        return colors.asian;
      case "brown":
        return colors.brown;
      case "black":
        return colors.black;
    }
  })();

  const skinColor = pickRandom(palette.skin);
  const hairColor = pickRandom(palette.hair);
  const eyeColor = pickRandom(palette.eyes);
  const isFlipped = () => Math.random() < 0.5;

  const face = {
    fatness: roundTwoDecimals((gender === "female" ? 0.4 : 1) * Math.random()),
    height: roundTwoDecimals(
      gender === "female" ? 0.65 * Math.random() : 0.25 + 0.75 * Math.random(),
    ),
    teamColors: teamColors,
    hairBg: {
      id:
        Math.random() < (gender === "male" ? 0.1 : 0.9)
          ? getID("hairBg", gender)
          : "none",
    },
    body: {
      id: getID("body", gender),
      color: skinColor,
      size: gender === "female" ? 0.95 : 1,
    },
    jersey: {
      id: getID("jersey", gender),
    },
    ear: {
      id: getID("ear", gender),
      size: roundTwoDecimals(
        0.5 + (gender === "female" ? 0.5 : 1) * Math.random(),
      ),
    },
    earring: {
      id:
        (gender === "female" ? 1 : 0.5) * Math.random() > 0.25
          ? getID("earring", gender)
          : "none",
    },
    head: {
      id: getID("head", gender),
      shaveOpacity:
        gender === "male" && Math.random() < 0.35
          ? roundTwoDecimals(Math.random() / 5)
          : 0,
    },
    eyeLine: {
      id: Math.random() < 0.75 ? getID("eyeLine", gender) : "none",
    },
    smileLine: {
      id:
        Math.random() < (gender === "male" ? 0.75 : 0.1)
          ? getID("smileLine", gender)
          : "none",
      size: roundTwoDecimals(0.25 + 2 * Math.random()),
    },
    miscLine: {
      id: Math.random() < 0.5 ? getID("miscLine", gender) : "none",
    },
    facialHair: {
      id: Math.random() < 0.5 ? getID("facialHair", gender) : "none",
    },
    eye: {
      id: getID("eye", gender),
      angle: eyeAngle,
      color: eyeColor,
      size: roundTwoDecimals(0.85 + Math.random() * 0.3),
      distance: roundTwoDecimals(8 * Math.random() - 6),
      height: roundTwoDecimals(20 * Math.random() - 10),
    },
    eyebrow: {
      id: getID("eyebrow", gender),
      angle: randomInt(-15, 20, true),
    },
    hair: {
      id: getID("hair", gender),
      color: hairColor,
      flip: isFlipped(),
    },
    mouth: {
      id: getID("mouth", gender),
      flip: isFlipped(),
      size: roundTwoDecimals(0.6 + Math.random() * 0.6),
    },
    nose: {
      id: getID("nose", gender),
      flip: isFlipped(),
      size: roundTwoDecimals(
        0.5 + Math.random() * (gender === "female" ? 0.5 : 0.75),
      ),
      angle: randomGaussian(-3, 3),
    },
    glasses: {
      id: Math.random() < 0.1 ? getID("glasses", gender) : "none",
    },
    accessories: {
      id: Math.random() < 0.2 ? getID("accessories", gender) : "none",
    },
  };

  override(face, overrides);

  return face;
};
