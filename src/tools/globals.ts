import { Race, TeamColors } from "./types";
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

export const jerseyColorOptions: TeamColors[] = [
    ['#98002E', '#BC9B6A', '#FFFFFF'],
    ['#F56600', '#522D80', '#FFFFFF'],
    ['#B3A369', '#003057', '#FFFFFF'],
    ['#CC0000', '#000000', '#FFFFFF'],
    ['#0C2340', '#C99700', '#00843D'],
    ['#003594', '#FFB81C', '#FFFFFF'],
    ['#630031', '#CF4420', '#FFFFFF'],
    ['#24135F', '#AD8900', '#000000'],
    ['#311D00', '#FF3C00', '#FFFFFF'],
    ['#552583', '#FDB927', '#FFFFFF'],
    ['#00538C', '#002B5E', '#FFFFFF'],
    ['#007AC1', '#EF3B24', '#002D62'],
    ['#007A33', '#FFFFFF', '#BA9653'],
    ['#98002E', '#F9A01B', '#FFFFFF'],
    ['#00471B', '#EEE1C6', '#FFFFFF'],
    ['#F74902', '#000000', '#FFFFFF'],
    ['#6F263D', '#236192', '#A2AAAD'],
    ['#BB0000', '#666666', '#FFFFFF'],
    ['#7A0019', '#FFCC33', '#FFFFFF'],
    ['#4E2A84', '#FFFFFF', '#000000'],
    ['#FFCD00', '#000000', '#FFFFFF'],
]

export const distinctSkinColors = distinct(
    Object.values(colors).map((c) => c.skin).flat(),
)

export const distinctHairColors = distinct(
    Object.values(colors).map((c) => c.hair).flat(),
)