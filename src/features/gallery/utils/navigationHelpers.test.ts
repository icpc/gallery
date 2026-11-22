import { describe, expect, it } from "bun:test";
import type { GalleryPhotoItem } from "./gallerySections";
import { resolveActiveIndex, stepIndex } from "./navigationHelpers";

function makeItem(
  sectionKey: string,
  photoId: string,
  flatIndex: number,
): GalleryPhotoItem {
  const src = {
    url: `https://example.com/${photoId}.jpg`,
    width: 1000,
    height: 800,
  };
  return {
    entryKey: `${sectionKey}:${photoId}`,
    sectionKey,
    flatIndex,
    photo: {
      id: photoId,
      sources: [src],
      src,
      tags: [],
      events: [sectionKey],
      year: "2025",
    },
  };
}

describe("navigationHelpers", () => {
  it("steps linearly without wrapping by default and wraps in slideshow mode", () => {
    expect(stepIndex(0, -1, 3, false)).toBeNull();
    expect(stepIndex(0, -1, 3, true)).toBe(2);
    expect(stepIndex(2, 1, 3, false)).toBeNull();
    expect(stepIndex(2, 1, 3, true)).toBe(0);
    expect(stepIndex(1, 1, 3, false)).toBe(2);
  });

  it("preserves exact flatIndex on duplicate photo IDs and resolves preferred or first matching event", () => {
    const items = [
      makeItem("Photo Tour", "dup-1", 0),
      makeItem("Photo Tour", "p-2", 1),
      makeItem("Opening Ceremony", "dup-1", 2),
      makeItem("Opening Ceremony", "p-3", 3),
    ];

    // Standing at index 2 keeps index 2, never jumps back to 0
    expect(resolveActiveIndex(items, 2, "dup-1", "Photo Tour")).toBe(2);
    // Deep link with matching event prefers that event's copy
    expect(resolveActiveIndex(items, null, "dup-1", "Opening Ceremony")).toBe(
      2,
    );
    // Deep link with wrong/mismatched event falls back to the first event that contains the photo
    expect(resolveActiveIndex(items, null, "p-3", "Photo Tour")).toBe(3);
    expect(resolveActiveIndex(items, null, "dup-1", "Nonexistent Event")).toBe(
      0,
    );
    // Closing viewer resolves null
    expect(resolveActiveIndex(items, 2, null)).toBeNull();
  });
});
