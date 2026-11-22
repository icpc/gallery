import { describe, expect, it } from "bun:test";
import { detectHorizontalSwipe, detectSwipe } from "./useSwipeNavigation";

describe("detectSwipe", () => {
  it("detects left swipe as next and right swipe as prev", () => {
    expect(detectSwipe(300, 200, 180, 210)).toBe("next");
    expect(detectSwipe(120, 200, 260, 195)).toBe("prev");
  });

  it("detects vertical swipes as up and down", () => {
    expect(detectSwipe(200, 400, 190, 280)).toBe("up");
    expect(detectSwipe(200, 200, 210, 320)).toBe("down");
    expect(detectSwipe(200, 300, 205, 265)).toBe("up");
  });

  it("ignores short taps below threshold", () => {
    expect(detectSwipe(200, 200, 175, 202)).toBeNull();
    expect(detectSwipe(200, 200, 202, 180)).toBeNull();
  });

  it("ignores ambiguous diagonal drags", () => {
    expect(detectSwipe(200, 200, 120, 120)).toBeNull();
    expect(detectSwipe(200, 200, 280, 270)).toBeNull();
  });
});

describe("detectHorizontalSwipe", () => {
  it("returns next/prev for horizontal swipes and null for vertical swipes", () => {
    expect(detectHorizontalSwipe(300, 200, 180, 210)).toBe("next");
    expect(detectHorizontalSwipe(120, 200, 260, 195)).toBe("prev");
    expect(detectHorizontalSwipe(200, 400, 190, 150)).toBeNull();
    expect(detectHorizontalSwipe(200, 150, 210, 420)).toBeNull();
  });
});
