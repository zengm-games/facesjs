import { Overrides } from "../types";
import { deepCopy } from "../utils";

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

export const overrideCopy = (obj: Overrides, overrides?: Overrides) => {
    return override(deepCopy(obj), overrides);
}

export default override;
