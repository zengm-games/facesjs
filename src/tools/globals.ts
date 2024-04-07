import { Race } from "./types";
import { distinct } from "./utils";

export const colors: { [key in Race]: { skin: string[], hair: string[] } } = {
    white: {
        skin: ["#f2d6cb", "#ddb7a0"],
        hair: [
            "#272421",
            "#3D2314",
            "#5A3825",
            "#522719",
            "#CC9966",
            "#2C1608",
            "#B55239",
            "#C37442",
            "#e9c67b",
            "#E5BE83",
            "#CE9C4F",
            "#D7BF91",
            "#1E2021",
        ],
    },
    asian: {
        skin: ["#fedac7", "#f0c5a3", "#eab687"],
        hair: ["#272421", "#0f0902", "#1E2021",],
    },
    brown: {
        skin: ["#bb876f", "#aa816f", "#a67358"],
        hair: ["#272421", "#1c1008", "#1E2021",],
    },
    black: {
        skin: ["#ad6453", "#74453d", "#5c3937"], hair: ["#272421", "#1E2021",]
    },
};

export const distinctSkinColors = distinct(
    Object.values(colors).map((c) => c.skin).flat(),
)

export const distinctHairColors = distinct(
    Object.values(colors).map((c) => c.hair).flat(),
)