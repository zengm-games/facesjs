import { Overrides } from "./common.js";

const override = (obj: Overrides, overrides?: Overrides) => {
  if (!overrides || !obj) {
    return;
  }

  for (const [key, value] of Object.entries(overrides)) {
    // Overrides may come from untrusted JSON, so prevent prototype pollution
    if (key === "__proto__") {
      continue;
    }

    if (
      typeof value === "boolean" ||
      typeof value === "string" ||
      typeof value === "number" ||
      Array.isArray(value)
    ) {
      obj[key] = value;
    } else if (Object.hasOwn(obj, key)) {
      // Only recurse into own properties, so inherited ones like "constructor" can't be used to reach shared objects
      // @ts-expect-error
      override(obj[key], value);
    }
  }
};

export default override;
