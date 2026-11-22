import { describe, expect, it } from "bun:test";
import {
  computeMobileInfoHeight,
  fitDimensions,
  MOBILE_TOOLBAR_OFFSET_PX,
  resolveSheetSnap,
} from "./imageFit";

describe("fitDimensions", () => {
  it("fits a landscape photo into a narrower desktop stage with sidebar open", () => {
    expect(fitDimensions(2000, 1000, 1000, 900)).toEqual({
      width: 1000,
      height: 500,
    });
  });

  it("fits a portrait photo into a wide container by height", () => {
    expect(fitDimensions(1000, 2000, 1200, 800)).toEqual({
      width: 400,
      height: 800,
    });
  });

  it("handles zero container or missing natural dimensions safely", () => {
    expect(fitDimensions(1600, 1200, 0, 800)).toEqual({ width: 0, height: 0 });
    expect(fitDimensions(0, 0, 800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe("computeMobileInfoHeight", () => {
  it("attaches info drawer flush beneath a landscape photo with zero black gap", () => {
    // 400x780 phone, 3:2 photo -> photo height at 400px width is 267px
    const infoHeight = computeMobileInfoHeight(400, 780, 1600, 1067);
    const stagePhotoHeight = 780 - infoHeight - MOBILE_TOOLBAR_OFFSET_PX;
    expect(stagePhotoHeight).toBe(267);
    expect(infoHeight).toBe(457);
  });

  it("keeps at least 55% height for portrait photos so the bottom still sits flush", () => {
    const infoHeight = computeMobileInfoHeight(400, 780, 1067, 1600);
    expect(infoHeight).toBe(Math.round(780 * 0.55));
  });

  it("falls back safely when dimensions are missing", () => {
    expect(computeMobileInfoHeight(0, 780, 1600, 1000)).toBe(0);
    expect(computeMobileInfoHeight(400, 780, 0, 0)).toBe(
      Math.round(780 * 0.55),
    );
  });
});

describe("resolveSheetSnap", () => {
  it("snaps open on quick upward flick and closed on quick downward flick", () => {
    expect(resolveSheetSnap(60, 450, false, -0.6)).toBe(true);
    expect(resolveSheetSnap(400, 450, true, 0.6)).toBe(false);
  });

  it("uses distance thresholds for slow drags", () => {
    expect(resolveSheetSnap(150, 450, false, 0)).toBe(true);
    expect(resolveSheetSnap(100, 450, false, 0)).toBe(false);
    expect(resolveSheetSnap(320, 450, true, 0)).toBe(true);
    expect(resolveSheetSnap(250, 450, true, 0)).toBe(false);
  });
});
