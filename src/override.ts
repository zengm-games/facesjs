export type Overrides = {
  [key: string]: boolean | string | number | any[] | Overrides;
};

const override = (obj: Overrides, overrides?: Overrides) => {
  if (!overrides) {
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

export default override;
