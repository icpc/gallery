import { describe, expect, it } from "bun:test";
import { shouldRunSlideshow } from "./useSlideshow";

describe("shouldRunSlideshow", () => {
  it("runs when active, not paused, and multiple photos exist", () => {
    expect(
      shouldRunSlideshow({ active: true, paused: false, totalItems: 10 }),
    ).toBe(true);
  });

  it("does not run when inactive, paused, or only one photo exists", () => {
    expect(
      shouldRunSlideshow({ active: false, paused: false, totalItems: 10 }),
    ).toBe(false);
    expect(
      shouldRunSlideshow({ active: true, paused: true, totalItems: 10 }),
    ).toBe(false);
    expect(
      shouldRunSlideshow({ active: true, paused: false, totalItems: 1 }),
    ).toBe(false);
  });
});
