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
  const face = {};

  face.fatness = Math.random();

  face.head = {
    id: getID("head"),
    color: colors[Math.floor(Math.random() * colors.length)]
  };

  const angle = Math.random() * 50 - 20;
  face.eye = { id: getID("eye"), angle };
  face.eyebrow = { id: getID("eyebrow") };
  face.hair = { id: getID("hair") };
  face.mouth = { id: getID("mouth") };
  face.nose = {
    id: getID("nose"),
    flip: Math.random() < 0.5,
    size: Math.random()
  };

  /*const id2 = getID(eyebrow);
    face.eyebrows[0] = {id: id2, lr: "l", cx: 135, cy: 250};
    face.eyebrows[1] = {id: id2, lr: "r", cx: 265, cy: 250};

    const flip = Math.random() > 0.5 ? true : false;
    face.nose = {id: getID(nose), lr: "l", cx: 200, cy: 330, size: Math.random(), posY: undefined, flip: flip};

    face.mouth = {id: getID(mouth), cx: 200, cy: 400};

    face.hair = {id: getID(hair)};*/

  return face;
};

export default generate;
