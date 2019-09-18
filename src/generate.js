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
    "#2c222b",
    "#3b302a",
    "#4e433f",
    "#504444",
    "#a7856a",
    "#b89778",
    "#debc99",
    "#977961",
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
