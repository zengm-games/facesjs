const override = (obj, overrides) => {
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
      override(obj[key], value);
    }
  }
};

export default override;
