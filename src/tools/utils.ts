
export const get_from_dict = (obj: object, key: string): any => {
    let keyParts: string[] = String(key).split('.');
    let current: any = obj;

    for (let i = 0; i < keyParts.length; i++) {
        // @ts-ignore
        const part: string = keyParts[i];

        if (current instanceof Map) {
            if (!current.has(part)) {
                return null;
            }
            current = current.get(part);
        }
        else if (typeof current === 'object' && current !== null) {
            if (!(part in current)) {
                return null;
            }
            current = current[part];
        }
        else {
            return null;
        }
    }

    return current;
}


export const set_to_dict = (container: { [key: string]: any } | Map<any, any>, key: string, value: any) => {
    key = `${key}`.trim();
    const keys: string[] = key.split('.');
    let current_container = container;

    for (let i = 0; i < keys.length; i++) {
        // @ts-ignore
        const current_key: string = keys[i];

        if (i === keys.length - 1) {
            if (current_container instanceof Map) {
                current_container.set(current_key, value);
            } else {
                (current_container as { [key: string]: any })[current_key] = value;
            }
        } else {
            // const next_key = keys[i + 1];
            if (current_container instanceof Map) {
                if (!current_container.has(current_key) || !(current_container.get(current_key) instanceof Map)) {
                    current_container.set(current_key, new Map<any, any>());
                }
                current_container = current_container.get(current_key);
            } else {
                if (!current_container[current_key] || typeof current_container[current_key] !== 'object') {
                    (current_container as { [key: string]: any })[current_key] = {};
                }
                current_container = current_container[current_key];
            }
        }
    }

    return container;
};

export const generateRangeFromStep = (start: number, end: number, step: number): number[] => {
    let returnArray = [];

    for (let i = start; i <= end; i += step) {
        returnArray.push(roundTwoDecimals(i));
    }

    return returnArray;
}


export const generateRangeFromSlots = (start: number, end: number, slots: number): number[] => {
    let returnArray = [];

    let step = (end - start) / slots;

    for (let i = start; i <= end; i += step) {
        returnArray.push(roundTwoDecimals(i));
    }

    return returnArray;
}

export const distinct = (arr: any[]): any[] => {
    // @ts-ignore
    return [...new Set<any>(arr)];
}

export const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;

// flattenDict is used to flatten a nested object into a single level object
// Turns {a: {b: {c: 1, d: 2}}} into {'a.b.c': 1, 'a.b.d': 2}
export const flattenDict = (obj: any | any[], parentKey = '', result = {}) => {

    const objIsArray = Array.isArray(obj);

    for (const [key, value] of Object.entries(obj)) {
        const storeKey = objIsArray ? `[${key}]` : key;
        let newKey = parentKey ? `${parentKey}.${storeKey}` : storeKey;

        if (value && (Array.isArray(value) || typeof value === 'object')) {
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

    let returnString = '';

    Object.keys(flattenedObj).sort().forEach((key) => {
        // @ts-ignore
        returnString += `${key}: ${flattenedObj[key]}\n`;
    });

    return returnString;
};