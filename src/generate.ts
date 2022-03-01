import override, { Overrides } from "./override";
import svgsIndex from "./svgs-index";

const getID = (type: string): string => {
  // @ts-ignore
  return svgsIndex[type][Math.floor(Math.random() * svgsIndex[type].length)];
};

type Race = "asian" | "black" | "brown" | "white";

const colors = {
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

const defaultTeamColors = [
  ["#89bfd3", "#7a1319", "#07364f"],
  ["#5c4a99", "#f0e81c", "#211e1e"],
  ["#034757", "#67c7e9", "#b78254"],
  ["#009e87", "#541f3e", "#ffffff"],
  ["#000000", "#c11616", "#2966ef"],
  ["#211e1e", "#f8e3cc", "#3f1c59"],
  ["#be2026", "#2b2e81", "#ffffff"],
  ["#2b8643", "#163a1c", "#a1d297"],
  ["#3a61b6", "#9eb7e6", "#0a1130"],
  ["#4c91c2", "#c4c4c3", "#ffffff"],
  ["#e79f02", "#00246d", "#ffffff"],
  ["#8f2100", "#ffb500", "#d4731c"],
  ["#8f2100", "#ffb500", "#d4731c"],
  ["#aeaeae", "#ea4b0f", "#dedddd"],
  ["#1c73bb", "#ffd600", "#0c5983"],
  ["#000000", "#ff6c49", "#00aedc"],
  ["#4ac1c0", "#d8519d", "#f15949"],
  ["#003600", "#fdc05f", "#007800"],
  ["#8accdc", "#3d2971", "#ed9a22"],
  ["#1a9190", "#510f0f", "#eb5924"],
  ["#195869", "#4edd61", "#0e3e33"],
  ["#1e73ba", "#ff8500", "#ffffff"],
  ["#610000", "#bbb29e", "#e4dfcf"],
  ["#dc5000", "#ffffff", "#0b7648"],
  ["#46bae6", "#ffdb33", "#d9771f"],
  ["#d17d2a", "#231f20", "#c09867"],
  ["#231f20", "#fbee28", "#fbee26"],
  ["#e41d34", "#1e1e1e", "#e7a9cc"],
  ["#4a2b14", "#30d9ff", "#704723"],
];

const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

const generate = (overrides?: Overrides, options?: { race?: Race }) => {
  const playerRace: Race = (function () {
    if (options && options.race) {
      return options.race;
    }
    switch (Math.floor(Math.random() * 4)) {
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

  const eyeAngle = Math.round(Math.random() * 25 - 10);

  const palette = (function () {
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
  const skinColor =
    palette.skin[Math.floor(Math.random() * palette.skin.length)];
  const hairColor =
    palette.hair[Math.floor(Math.random() * palette.hair.length)];
  const isFlipped = Math.random() < 0.5;

  const face = {
    fatness: roundTwoDecimals(Math.random()),
    teamColors:
      defaultTeamColors[Math.floor(Math.random() * defaultTeamColors.length)],
    hairBg: {
      id: Math.random() < 0.1 ? getID("hairBg") : "none",
    },
    body: {
      id: getID("body"),
      color: skinColor,
    },
    jersey: {
      id: getID("jersey"),
    },
    ear: {
      id: getID("ear"),
      size: roundTwoDecimals(0.5 + Math.random()),
    },
    head: {
      id: getID("head"),
      shave: `rgba(0,0,0,${
        Math.random() < 0.25 ? roundTwoDecimals(Math.random() / 5) : 0
      })`,
    },
    eyeLine: {
      id: Math.random() < 0.75 ? getID("eyeLine") : "none",
    },
    smileLine: {
      id: Math.random() < 0.75 ? getID("smileLine") : "none",
      size: roundTwoDecimals(0.25 + 2 * Math.random()),
    },
    miscLine: {
      id: Math.random() < 0.5 ? getID("miscLine") : "none",
    },
    facialHair: {
      id: Math.random() < 0.5 ? getID("facialHair") : "none",
    },
    eye: { id: getID("eye"), angle: eyeAngle },
    eyebrow: {
      id: getID("eyebrow"),
      angle: Math.round(Math.random() * 35 - 15),
    },
    hair: {
      id: getID("hair"),
      color: hairColor,
      flip: isFlipped,
    },
    mouth: {
      id: getID("mouth"),
      flip: isFlipped,
    },
    nose: {
      id: getID("nose"),
      flip: isFlipped,
      size: roundTwoDecimals(0.5 + Math.random() * 0.75),
    },
    glasses: {
      id: Math.random() < 0.1 ? getID("glasses") : "none",
    },
    accessories: {
      id: Math.random() < 1 ? getID("accessories") : "none",
      // id: Math.random() < 0.2 ? getID('accessories') : 'none',
    },
  };

  override(face, overrides);

  return face;
};

export type Face = ReturnType<typeof generate>;

export default generate;
