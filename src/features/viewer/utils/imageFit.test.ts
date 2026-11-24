import { describe, expect, it } from "bun:test";
import {
  applyEdgeResistance,
  computeMobileInfoHeight,
  fitDimensions,
  MOBILE_TOOLBAR_OFFSET_PX,
  resolveDismissSnap,
  resolveHorizontalSnap,
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

describe("horizontal mobile swipe helpers", () => {
  it("applies soft rubber-band resistance only at album edges", () => {
    expect(applyEdgeResistance(100, true, true)).toBe(100);
    expect(applyEdgeResistance(100, false, true)).toBe(25);
    expect(applyEdgeResistance(-100, true, false)).toBe(-25);
  });

  it("snaps to next/prev on flick velocity or past 22% width and springs back otherwise", () => {
    expect(resolveHorizontalSnap(-30, 400, true, true, -0.6)).toBe("next");
    expect(resolveHorizontalSnap(30, 400, true, true, 0.6)).toBe("prev");
    expect(resolveHorizontalSnap(-100, 400, true, true, 0)).toBe("next");
    expect(resolveHorizontalSnap(100, 400, true, true, 0)).toBe("prev");
    expect(resolveHorizontalSnap(-40, 400, true, true, 0)).toBeNull();
    expect(resolveHorizontalSnap(-150, 400, true, false, -0.8)).toBeNull();
    expect(resolveHorizontalSnap(150, 400, false, true, 0.8)).toBeNull();
  });
});

describe("resolveDismissSnap", () => {
  it("dismisses on quick downward flick past minimum travel", () => {
    expect(resolveDismissSnap(40, 800, 0.6)).toBe(true);
    expect(resolveDismissSnap(16, 800, 0.6)).toBe(false);
  });

  it("dismisses on slow drag past threshold and cancels on short drag or upward flick", () => {
    expect(resolveDismissSnap(145, 800, 0)).toBe(true);
    expect(resolveDismissSnap(90, 800, 0)).toBe(false);
    expect(resolveDismissSnap(200, 800, -0.5)).toBe(false);
    expect(resolveDismissSnap(80, 400, 0)).toBe(true);
  });

  it("never dismisses for non-positive drag or invalid viewport height", () => {
    expect(resolveDismissSnap(0, 800, 0.8)).toBe(false);
    expect(resolveDismissSnap(-50, 800, 0.8)).toBe(false);
    expect(resolveDismissSnap(200, 0, 0.8)).toBe(false);
  });
});
