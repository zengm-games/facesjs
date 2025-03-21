export const deepCopy = <T>(object: T): T => {
  return JSON.parse(JSON.stringify(object));
};

export const randInt = (a: number, b: number): number => {
  return Math.floor(Math.random() * (1 + b - a)) + a;
};

export const randUniform = (a: number, b: number): number => {
  return Math.random() * (b - a) + a;
};

export const randChoice = <T>(array: T[] | readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};
