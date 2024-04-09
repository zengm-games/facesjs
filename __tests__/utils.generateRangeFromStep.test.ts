import { generateRangeFromStep } from "../public/utils";

describe("generateRangeFromStep function tests", () => {
  it("generates a range with a positive step", () => {
    expect(generateRangeFromStep(0, 5, 1)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("generates a range with a larger step that skips values", () => {
    expect(generateRangeFromStep(0, 10, 4)).toEqual([0, 4, 8]);
  });

  it("handles floating point steps correctly", () => {
    expect(generateRangeFromStep(1, 2, 0.5)).toEqual([1, 1.5, 2]);
  });

  it("returns a single value when start and end are the same and step is valid", () => {
    expect(generateRangeFromStep(5, 5, 1)).toEqual([5]);
  });

  it("does not include the end value if the step size skips over it", () => {
    expect(generateRangeFromStep(0, 5, 3)).toEqual([0, 3]);
  });

  it("throws an error for zero step", () => {
    expect(() => generateRangeFromStep(0, 5, 0)).toThrow(
      "Step must be greater than 0",
    );
  });

  it("throws an error for negative step", () => {
    expect(() => generateRangeFromStep(5, 10, -1)).toThrow(
      "Step must be greater than 0",
    );
  });

  it("generates a range in reverse if start is greater than end (with positive step)", () => {
    expect(() => generateRangeFromStep(10, 5, 1)).toThrow(
      "Start cannot be greater than end when step is positive",
    );
  });
});
