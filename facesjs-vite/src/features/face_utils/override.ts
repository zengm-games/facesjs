import { Overrides } from "./types";

const override = (obj: Overrides, overrides?: Overrides) => {
    if (!overrides || !obj) {
        return;
    }

    for (const [key, value] of Object.entries(overrides)) {
        if (
            typeof value === "boolean" ||
            typeof value === "string" ||
            typeof value === "number" ||
            Array.isArray(value)
        ) {
            obj[key] = value;
        } else {
            // @ts-ignore
            override(obj[key], value);
        }
    }
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
}

export const overrideCopy = (obj: Overrides, overrides?: Overrides) => {
    return override(deepCopy(obj), overrides);
}

export default override;
