import svgsIndex from "./svgs-index";

const getID = type => {
  return svgsIndex[type][Math.floor(Math.random() * svgsIndex[type].length)];
};

// hair: ["#272421", "#423125", "#b55239", "#e9c67b", "#D7BF91"]

const colors = [
  {
    skin: "#f2d6cb",
    hair: [
      "#272421",
      "#3D2314",
      "#5A3825",
      "#CC9966",
      "#2C1608",
      "#B55239",
      "#e9c67b",
      "#D7BF91"
    ]
  },
  {
    skin: "#ddb7a0",
    hair: [
      "#272421",
      "#3D2314",
      "#5A3825",
      "#CC9966",
      "#2C1608",
      "#B55239",
      "#e9c67b",
      "#D7BF91"
    ]
  },
  { skin: "#ce967d", hair: ["#272421", "#423125"] },
  { skin: "#bb876f", hair: ["#272421"] },
  { skin: "#aa816f", hair: ["#272421"] },
  { skin: "#a67358", hair: ["#272421"] },
  { skin: "#ad6453", hair: ["#272421"] },
  { skin: "#74453d", hair: ["#272421"] },
  { skin: "#5c3937", hair: ["#272421"] }
];

const defaultTeamColors = ["#0d435e", "#f0494a", "#cccccc"];

const roundTwoDecimals = x => Math.round(x * 100) / 100;

const generate = () => {
  const eyeAngle = Math.round(Math.random() * 25 - 10);

  const palette = colors[Math.floor(Math.random() * colors.length)];
  const skinColor = palette.skin;
  const hairColor =
    palette.hair[Math.floor(Math.random() * palette.hair.length)];
  const isFlipped = Math.random() < 0.5;

  const face = {
    fatness: roundTwoDecimals(Math.random()),
    teamColors: defaultTeamColors,
    body: {
      id: getID("body"),
      color: skinColor
    },
    jersey: {
      id: getID("jersey")
    },
    ear: {
      id: getID("ear"),
      color: skinColor,
      size: roundTwoDecimals(0.75 + Math.random() * 0.5)
    },
    head: {
      id: getID("head"),
      color: skinColor,
      shave: `rgba(0,0,0,${
        Math.random() < 0.25 ? roundTwoDecimals(Math.random() / 5) : 0
      })`
    },
    eyeLine: {
      id: Math.random() < 0.75 ? getID("eyeLine") : "none"
    },
    smileLine: {
      id: Math.random() < 0.75 ? getID("smileLine") : "none",
      size: roundTwoDecimals(0.5 + Math.random())
    },
    miscLine: {
      id: Math.random() < 0.5 ? getID("miscLine") : "none"
    },
    facialHair: {
      id: Math.random() < 0.5 ? getID("facialHair") : "none",
      color: hairColor
    },
    eye: { id: getID("eye"), angle: eyeAngle },
    eyebrow: {
      id: getID("eyebrow"),
      angle: Math.round(Math.random() * 35 - 15),
      color: hairColor
    },
    hair: {
      id: getID("hair"),
      color: hairColor
    },
    mouth: {
      id: getID("mouth"),
      flip: isFlipped
    },
    nose: {
      id: getID("nose"),
      flip: isFlipped,
      color: skinColor,
      size: roundTwoDecimals(0.5 + Math.random() * 0.75)
    },
    glasses: {
      id: Math.random() < 0.1 ? getID("glasses") : "none"
    },
    accessories: {
      id: Math.random() < 0.2 ? getID("accessories") : "none"
    }
  };

  return face;
};

export default generate;
