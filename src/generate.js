import svgsIndex from "./svgs-index";

const getID = type => {
  return svgsIndex[type][Math.floor(Math.random() * svgsIndex[type].length)];
};

const colors = [
  {
    skin: "#f2d6cb",
    hair: ["#272421", "#423125", "#ab5513", "#e9c67b", "#D7BF91"]
  },
  { skin: "#ddb7a0", hair: ["#272421", "#423125", "#ab5513", "#e9c67b"] },
  { skin: "#ce967d", hair: ["#272421", "#423125"] },
  { skin: "#bb876f", hair: ["#272421"] },
  { skin: "#aa816f", hair: ["#272421"] },
  { skin: "#a67358", hair: ["#272421"] },
  { skin: "#ad6453", hair: ["#272421"] },
  { skin: "#74453d", hair: ["#272421"] },
  { skin: "#5c3937", hair: ["#171411"] }
];

const randomRounded = () => Math.round(Math.random() * 100) / 100;

const generate = () => {
  const eyeAngle = randomRounded() * 25 - 10;

  const palette = colors[Math.floor(Math.random() * colors.length)];
  const skinColor = palette.skin;
  const hairColor =
    palette.hair[Math.floor(Math.random() * palette.hair.length)];
  const jerseyColor = "#b44f4f";
  const isFlipped = Math.random() < 0.5;

  const face = {
    fatness: randomRounded(),
    body: {
      id: getID("body"),
      color: skinColor
    },
    jersey: {
      id: getID("jersey"),
      color: jerseyColor
    },
    ear: {
      id: getID("ear"),
      color: skinColor,
      size: 0.75 + randomRounded() * 0.5
    },
    head: {
      id: getID("head"),
      color: skinColor,
      shave: `rgba(0,0,0,${Math.random() < 0.25 ? randomRounded() / 5 : 0})`,
      baldness: [
        `rgba(0,0,0,${Math.random() < 0.25 ? randomRounded() / 5 : 0})`,
        `rgba(0,0,0,${Math.random() < 0.25 ? randomRounded() / 5 : 0})`
      ]
    },
    eyeline: {
      id: getID("eyeline")
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
    }
  };

  return face;
};

export default generate;
