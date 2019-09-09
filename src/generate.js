import svgs from "./svgs";

const getID = type => {
  const keys = Object.keys(svgs[type]);
  return keys[Math.floor(Math.random() * keys.length)];
};

const colors = [
  "#f2d6cb",
  "#ddb7a0",
  "#ce967d",
  "#bb876f",
  "#aa816f",
  "#a67358",
  "#ad6453",
  "#74453d",
  "#5c3937"
];

const generate = () => {
  const eyeAngle = Math.random() * 50 - 20;

  const face = {
    fatness: Math.random(),
    head: {
      id: getID("head"),
      color: colors[Math.floor(Math.random() * colors.length)]
    },
    eye: { id: getID("eye"), angle: eyeAngle },
    eyebrow: { id: getID("eyebrow") },
    hair: { id: getID("hair") },
    mouth: { id: getID("mouth") },
    nose: {
      id: getID("nose"),
      flip: Math.random() < 0.5,
      size: Math.random()
    }
  };

  return face;
};

export default generate;
