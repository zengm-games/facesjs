export const deleteFromDict = (obj: any, key: string): any => {
  const keyParts: string[] = key.split(".");
  let current: any = obj;

  for (let i = 0; i < keyParts.length - 1; i++) {
    const part: string = keyParts[i] as string;

    if (!current[part] || typeof current[part] !== "object") {
      return obj;
    }

    current = current[part];
  }

  const lastPart = keyParts[keyParts.length - 1];
  if (lastPart !== undefined) {
    delete current[lastPart];
  }

  return obj;
};

export const getFromDict = (obj: object, key: string): any => {
  let keyParts: string[] = key.split(".");
  let current: any = obj;

  for (let part of keyParts) {
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
  container: { [key: string]: any } | Map<any, any>,
  key: string,
  value: any,
) => {
  const keys: string[] = key.trim().split(".");
  let current_container = container;

  for (let [ind, currentKey] of keys.entries()) {
    if (ind === keys.length - 1) {
      if (current_container instanceof Map) {
        current_container.set(currentKey, value);
      } else {
        (current_container as { [key: string]: any })[currentKey] = value;
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
          (current_container as { [key: string]: any })[currentKey] = {};
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

  let returnArray: number[] = [];
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
  let returnArray: number[] = [];

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

  let step = (end - start) / slots;

  for (let i = start; i <= end; i += step) {
    returnArray.push(roundTwoDecimals(i));
  }

  return returnArray;
};

export const distinct = (arr: any[]): any[] => {
  // @ts-ignore
  return [...new Set<any>(arr)];
};

export const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

// flattenDict is used to flatten a nested object into a single level object
// Turns {a: {b: {c: 1, d: 2}}} into {'a.b.c': 1, 'a.b.d': 2}
export const flattenDict = (obj: any | any[], parentKey = "", result = {}) => {
  const objIsArray = Array.isArray(obj);

  for (const [key, value] of Object.entries(obj)) {
    const storeKey = objIsArray ? `[${key}]` : key;
    let newKey = parentKey ? `${parentKey}.${storeKey}` : storeKey;

    if (value && (Array.isArray(value) || typeof value === "object")) {
      flattenDict(value, newKey, result);
    } else {
      // @ts-ignore
      result[newKey] = value;
    }
  }
  return result;
};

// objStringifyInOrder is used to stringify objects in a consistent order, flattening nested objects then sorting keys
export const objStringifyInOrder = (obj: any): string => {
  let flattenedObj = flattenDict(obj);

  let returnString = "";

  Object.keys(flattenedObj)
    .sort()
    .forEach((key) => {
      // @ts-ignore
      returnString += `${key}: ${flattenedObj[key]}\n`;
    });

  return returnString;
};

export const deepCopy = <T>(value: T): T => {
  if (typeof value !== "object" || value === null) {
    // Return the value if value is not an object or is null
    return value;
  }

  if (Array.isArray(value)) {
    // Handle arrays
    return value.map((item) => deepCopy(item)) as unknown as T;
  }

  const copiedObject: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    copiedObject[key] = deepCopy(val);
  }

  return copiedObject as T;
};

export const concatClassNames = (...classNames: string[]): string => {
  let joinedClassNames = classNames.join(" ");
  return joinedClassNames.trim().replace(/\s+/g, " ");
};

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
  const regex = /^#([0-9A-F]{3}){1,2}$/i;

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

export const pickRandom = (arr: any[]): any => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const encodeJSONForUrl = (input: { [key: string]: any }): string => {
  return encodeForUrl(JSON.stringify(input));
};

export const decodeFromUrlToJSON = (input: string): { [key: string]: any } => {
  return JSON.parse(decodeFromUrl(input));
};

export const encodeForUrl = (input: string): string => {
  return encodeURIComponent(input);
  // return compressToEncodedURIComponent(input);
};

export const decodeFromUrl = (input: string): string => {
  return decodeURIComponent(input);
  // const result = decompressFromEncodedURIComponent(input);
  // if (result === null) {
  //     throw new Error('Decompression failed');
  // }
  // return result;
};
