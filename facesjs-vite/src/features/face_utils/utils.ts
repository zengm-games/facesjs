
export const get_from_dict = (obj: object, key: string): any => {
    let keyParts: string[] = String(key).split('.');
    let current: any = obj;

    for (let i = 0; i < keyParts.length; i++) {
        // @ts-ignore
        const part: string = keyParts[i];

        // Check if current is a Map and get the value
        if (current instanceof Map) {
            if (!current.has(part)) {
                return null; // Key not found in Map
            }
            current = current.get(part);
        }
        // Check if current is an object and get the value
        else if (typeof current === 'object' && current !== null) {
            if (!(part in current)) {
                return null; // Key not found in object
            }
            current = current[part];
        }
        // If current is neither an object nor a Map
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

export const distinct = (arr: any[]) => {
    return [...new Set(arr)];
}

export const roundTwoDecimals = (x: number) => Math.round(x * 100) / 100;
