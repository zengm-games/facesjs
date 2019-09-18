import svgsIndex from "./svgs-index";

const getID = type => {
    return svgsIndex[type][Math.floor(Math.random() * svgsIndex[type].length)];
};

const skinColors = [
    "#f2d6cb",
    "#ddb7a0",
    "#ce967d",
    "#bb876f",
    "#aa816f",
    "#a67358",
    "#ad6453",
    "#74453d",
    "#5c3937",
    "#FBEAE2",
    "#FCE1D6",
    "#FDD2C2",
    "#FFC2AD",
    "#F5B399",
    "#E39D7E",
    "#DB9073",
    "#CE7A58",
    "#B1674A",
    "#7F4C3B",
    "#F8EBDB",
    "#FDE5CD",
    "#FDD5B1",
    "#F3C79A",
    "#E2AF82",
    "#D39E69",
    "#B88A58",
    "#997249",
    "#805737",
    "#68492D",
];

const hairColors = [
    "#090806",
    "#2C222B",
    "#71635A",
    "#B7A69E",
    "#D6C4C2",
    "#CABFB1",
    "#DCD0BA",
    "#FFF5E1",
    "#E6CEA8",
    "#E5C8A8",
    "#DEBC99",
    "#B89778",
    "#A56B46",
    "#B55239",
    "#8D4A43",
    "#91553D",
    "#533D32",
    "#3B3024",
    "#554838",
    "#4E433F",
    "#504444",
    "#6A4E42",
    "#A7856A",
    "#977961"
];


const randomRounded = () => Math.round(Math.random() * 100) / 100;

const generate = () => {
    const eyeAngle = Math.round(Math.random() * 50 - 20);
    const eyebrowAngle = Math.round(Math.random() * 50 - 20);

    const face = {
        fatness: randomRounded(),
        head: {
            id: getID("head"),
            color: skinColors[Math.floor(Math.random() * skinColors.length)]
        },
        eye: {id: getID("eye"), angle: eyeAngle},
        eyebrow: {id: getID("eyebrow"), size: randomRounded(), angle: eyebrowAngle},
        hair: {id: getID("hair"), color: hairColors[Math.floor(Math.random() * hairColors.length)]},
        mouth: {id: getID("mouth"), flip: Math.random() < 0.5, size: randomRounded()},
        nose: {
            id: getID("nose"),
            flip: Math.random() < 0.5,
            size: randomRounded()
        }
    };

    return face;
};

export default generate;
