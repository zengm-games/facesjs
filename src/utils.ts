export const deepCopy = <T>(object: T): T => {
  return JSON.parse(JSON.stringify(object));
};
