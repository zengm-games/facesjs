import { isValidJSON } from "../public/utils";

describe("isValidJSON function tests", () => {
  it("returns true for a valid JSON object string", () => {
    const jsonString = '{"name":"John", "age":30}';
    expect(isValidJSON(jsonString)).toBe(true);
  });

  it("returns true for a valid JSON array string", () => {
    const jsonArray = '["apple", "banana", "cherry"]';
    expect(isValidJSON(jsonArray)).toBe(true);
  });

  it("returns false for an invalid JSON string with missing quotes", () => {
    const invalidJson = '{name:"John", age:30}';
    expect(isValidJSON(invalidJson)).toBe(false);
  });

  it("returns false for an invalid JSON string with trailing comma", () => {
    const invalidJson = '{"name":"John", "age":30,}';
    expect(isValidJSON(invalidJson)).toBe(false);
  });

  it("returns true for a valid JSON string with null", () => {
    const nullJson = "null";
    expect(isValidJSON(nullJson)).toBe(true);
  });

  it("returns true for a valid JSON string with true", () => {
    const trueJson = "true";
    expect(isValidJSON(trueJson)).toBe(true);
  });

  it("returns false for a string that is not JSON", () => {
    const notJson = "Hello, world!";
    expect(isValidJSON(notJson)).toBe(false);
  });

  it("returns false for a broken JSON structure", () => {
    const brokenJson = '{"name": "John", "age": 30';
    expect(isValidJSON(brokenJson)).toBe(false);
  });
});
