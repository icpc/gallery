import { describe, expect, it } from "bun:test";
import { resolveViewerHotkey } from "./viewerHotkeys";

describe("resolveViewerHotkey", () => {
  const viewing = { editMode: false, isSlideShow: false };
  const slideshow = { editMode: false, isSlideShow: true };
  const editing = { editMode: true, isSlideShow: false };

  it("maps navigation, slideshow, info, download, flickr, edit, and escape shortcuts in view mode", () => {
    expect(resolveViewerHotkey({ key: "ArrowLeft" }, viewing)).toBe("prev");
    expect(resolveViewerHotkey({ key: "ArrowRight" }, viewing)).toBe("next");
    expect(resolveViewerHotkey({ key: " ", code: "Space" }, viewing)).toBe(
      "toggleSlideshow",
    );
    expect(resolveViewerHotkey({ key: "Escape" }, viewing)).toBe("close");
    expect(resolveViewerHotkey({ key: "i", code: "KeyI" }, viewing)).toBe(
      "toggleInfo",
    );
    expect(resolveViewerHotkey({ key: "d", code: "KeyD" }, viewing)).toBe(
      "download",
    );
    expect(resolveViewerHotkey({ key: "f", code: "KeyF" }, viewing)).toBe(
      "openFlickr",
    );
    expect(resolveViewerHotkey({ key: "e", code: "KeyE" }, viewing)).toBe(
      "toggleEdit",
    );
  });

  it("supports non-Latin keyboard layouts via physical key codes", () => {
    expect(resolveViewerHotkey({ key: "ш", code: "KeyI" }, viewing)).toBe(
      "toggleInfo",
    );
    expect(resolveViewerHotkey({ key: "в", code: "KeyD" }, viewing)).toBe(
      "download",
    );
    expect(resolveViewerHotkey({ key: "а", code: "KeyF" }, viewing)).toBe(
      "openFlickr",
    );
    expect(resolveViewerHotkey({ key: "у", code: "KeyE" }, viewing)).toBe(
      "toggleEdit",
    );
  });

  it("ignores shortcuts with browser modifiers or already-prevented events", () => {
    expect(
      resolveViewerHotkey({ key: "f", code: "KeyF", ctrlKey: true }, viewing),
    ).toBeNull();
    expect(
      resolveViewerHotkey({ key: "d", code: "KeyD", metaKey: true }, viewing),
    ).toBeNull();
    expect(
      resolveViewerHotkey({ key: "i", code: "KeyI", altKey: true }, viewing),
    ).toBeNull();
    expect(
      resolveViewerHotkey({ key: "Escape", defaultPrevented: true }, viewing),
    ).toBeNull();
  });

  it("restricts shortcuts appropriately during edit mode and slideshow", () => {
    expect(resolveViewerHotkey({ key: "ArrowRight" }, editing)).toBeNull();
    expect(resolveViewerHotkey({ key: "i", code: "KeyI" }, editing)).toBeNull();
    expect(resolveViewerHotkey({ key: "e", code: "KeyE" }, editing)).toBe(
      "toggleEdit",
    );
    expect(resolveViewerHotkey({ key: "Escape" }, editing)).toBe("close");

    expect(resolveViewerHotkey({ key: " ", code: "Space" }, slideshow)).toBe(
      "toggleSlideshow",
    );
    expect(resolveViewerHotkey({ key: "ArrowRight" }, slideshow)).toBe("next");
    expect(
      resolveViewerHotkey({ key: "i", code: "KeyI" }, slideshow),
    ).toBeNull();
    expect(
      resolveViewerHotkey({ key: "d", code: "KeyD" }, slideshow),
    ).toBeNull();
    expect(
      resolveViewerHotkey({ key: "f", code: "KeyF" }, slideshow),
    ).toBeNull();
    expect(resolveViewerHotkey({ key: "e", code: "KeyE" }, slideshow)).toBe(
      "toggleEdit",
    );
  });
});
