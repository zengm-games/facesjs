import { concatClassNames } from "../public/utils";

describe("concatClassNames function tests", () => {
  it("returns an empty string when no classnames are provided", () => {
    expect(concatClassNames()).toBe("");
  });

  it("returns the same classname when only one is provided", () => {
    const className = "my-class";
    expect(concatClassNames(className)).toBe("my-class");
  });

  it("concatenates multiple classnames with a space", () => {
    const classNames = ["my-class", "another-class", "third-class"];
    expect(concatClassNames(...classNames)).toBe(
      "my-class another-class third-class",
    );
  });

  it("handles and trims extra whitespace in classnames", () => {
    const classNames = ["  my-class  ", " another-class ", "third-class "];
    expect(concatClassNames(...classNames)).toBe(
      "my-class another-class third-class",
    );
  });
});
