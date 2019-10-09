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

const randomRounded = () => Math.round(Math.random() * 100) / 100;

const generate = () => {
  const eyeAngle = randomRounded() * 25 - 10;

  const palette = colors[Math.floor(Math.random() * colors.length)];
  const skinColor = palette.skin;
  const hairColor =
    palette.hair[Math.floor(Math.random() * palette.hair.length)];
  const jerseyColor = "#d8519d";
  const teamColor = ["#0d435e", "#f0494a", "#cccccc"];
  const isFlipped = Math.random() < 0.5;

  const face = {
    fatness: randomRounded(),
    body: {
      id: getID("body"),
      color: skinColor
    },
    jersey: {
      id: getID("jersey"),
      primary: teamColor[0],
      secondary: teamColor[1],
      accent: teamColor[2]
    },
    ear: {
      id: getID("ear"),
      color: skinColor,
      size: 0.75 + randomRounded() * 0.5
    },
    head: {
      id: getID("head"),
      color: skinColor,
      shave: `rgba(0,0,0,${Math.random() < 0.25 ? randomRounded() / 5 : 0})`
    },
    eyeline: {
      id: Math.random() < 0.75 ? getID("smileline") : "none"
    },
    smileline: {
      id: Math.random() < 0.75 ? getID("smileline") : "none",
      size: 0.5 + randomRounded()
    },
    miscline: {
      id: Math.random() < 0.5 ? getID("miscline") : "none"
    },
    facialhair: {
      id: Math.random() < 0.5 ? getID("facialhair") : "none",
      color: hairColor
    },
    eye: { id: getID("eye"), angle: eyeAngle },
    eyebrow: {
      id: getID("eyebrow"),
      angle: Math.round(Math.random() * 35 - 15),
      color: hairColor,
      thickness: 3 + Math.random() * 12
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
      size: 0.5 + randomRounded() * 0.75
    },
    accessories: {
      id: Math.random() < 0.2 ? getID("accessories") : "none",
      primary: teamColor[0],
      secondary: teamColor[1],
      accent: teamColor[2]
    },
    glasses: {
      id: Math.random() < 0.1 ? getID("glasses") : "none",
      primary: teamColor[0],
      secondary: teamColor[1],
      accent: teamColor[2]
    }
  };

  return face;
};

export default generate;
