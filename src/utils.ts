export const deepCopy = <T>(object: T): T => {
  return JSON.parse(JSON.stringify(object));
};

export const randInt = (a: number, b: number): number => {
  return Math.floor(Math.random() * (1 + b - a)) + a;
};

export const randUniform = (a: number, b: number): number => {
  return Math.random() * (b - a) + a;
};

export const randChoice = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Allows hex, named, rgb(), rgba(), hsl(), etc. but not quotes, angle brackets, semicolons, colons, or anything else that could break out of an SVG attribute or style
export const colorRegex = /^[#a-zA-Z0-9(),.%/ +-]+$/;

export const isValidColor = (color: unknown): color is string => {
  return typeof color === "string" && colorRegex.test(color);
};
