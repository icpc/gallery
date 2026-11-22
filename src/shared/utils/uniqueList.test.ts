import { describe, expect, it } from "bun:test";
import { uniqueList } from "./uniqueList";

describe("uniqueList", () => {
  it("deduplicates items while preserving first-seen order", () => {
    expect(uniqueList(["b", "a", "b", "c", "a"])).toEqual(["b", "a", "c"]);
  });

  it("handles empty arrays", () => {
    expect(uniqueList([])).toEqual([]);
  });
});
