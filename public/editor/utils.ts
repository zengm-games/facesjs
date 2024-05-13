export const deleteFromDict = (obj: Record<string, any>, key: string): any => {
  const keyParts = key.split(".");
  let current = obj;

  for (let i = 0; i < keyParts.length - 1; i++) {
    const part = keyParts[i];

    if (!current[part] || typeof current[part] !== "object") {
      return obj;
    }

    current = current[part];
  }

  const lastPart = keyParts.at(-1);
  if (lastPart !== undefined) {
    delete current[lastPart];
  }

  return obj;
};

export const getFromDict = (obj: Record<string, any>, key: string): any => {
  const keyParts = key.split(".");
  let current = obj;

  for (const part of keyParts) {
    if (current instanceof Map) {
      if (!current.has(part)) {
        return null;
      }
      current = current.get(part);
    } else if (typeof current === "object" && current !== null) {
      if (!(part in current)) {
        return null;
      }
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
};

export const setToDict = (
  container: Record<string, any>,
  key: string,
  value: any,
) => {
  const keys: string[] = key.trim().split(".");
  let current_container = container;

  for (const [ind, currentKey] of keys.entries()) {
    if (ind === keys.length - 1) {
      if (current_container instanceof Map) {
        current_container.set(currentKey, value);
      } else {
        current_container[currentKey] = value;
      }
    } else {
      if (current_container instanceof Map) {
        if (
          !current_container.has(currentKey) ||
          !(current_container.get(currentKey) instanceof Map)
        ) {
          current_container.set(currentKey, new Map<any, any>());
        }
        current_container = current_container.get(currentKey);
      } else {
        if (
          !current_container[currentKey] ||
          typeof current_container[currentKey] !== "object"
        ) {
          current_container[currentKey] = {};
        }
        current_container = current_container[currentKey];
      }
    }
  }

  return container;
};

export const generateRangeFromStep = (
  start: number,
  end: number,
  step: number,
): number[] => {
  if (step <= 0) {
    throw new Error("Step must be greater than 0");
  }
  if (start > end && step > 0) {
    throw new Error("Start cannot be greater than end when step is positive");
  }

  const returnArray: number[] = [];
  let track = start;
  while (track <= end) {
    returnArray.push(track);
    track = roundTwoDecimals(track + step);
  }

  return returnArray;
};

export const generateRangeFromSlots = (
  start: number,
  end: number,
  slots: number,
): number[] => {
  const returnArray: number[] = [];

  if (slots === 0) {
    return returnArray;
  }
  if (slots === 1) {
    return [start, end];
  }
  if (start === end) {
    return [start];
  }
  if (start > end) {
    [start, end] = [end, start];
  }

  const step = (end - start) / slots;

  for (let i = start; i <= end; i += step) {
    returnArray.push(roundTwoDecimals(i));
  }

  return returnArray;
};

export const distinct = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

export const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

export const luma = (colorHex: string): number => {
  if (!doesStrLookLikeColor(colorHex)) {
    throw new Error("Invalid hexadecimal color");
  }

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  let hex = colorHex.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const doesStrLookLikeColor = (str: string): boolean => {
  const regex =
    /^(#([0-9A-F]{3,4}){1,2}$|rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*((0?\.\d+)|(1\.0?)|1))?\))$/i;

  return regex.test(str);
};

export const isValidJSON = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return false;
  }
};

export const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const getCurrentTimestampAsString = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const second = now.getSeconds().toString().padStart(2, "0");

  return `${year}${month}${day}${hour}${minute}${second}`;
};

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
