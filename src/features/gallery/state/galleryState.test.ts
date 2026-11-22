import { describe, expect, it } from "bun:test";
import {
  parseGallerySearchParams,
  selectEvent,
  selectPerson,
  selectTeam,
  selectText,
  selectYear,
  serializeGallerySearchParams,
} from "./galleryState";

describe("galleryState", () => {
  it("parses default album, event, photo, and slideshow params directly from URLSearchParams", () => {
    const parsed = parseGallerySearchParams(
      new URLSearchParams(
        "album=2025&photo=42&slideshow=true&slideshowSpeed=3.5",
      ),
      "2026",
      "Photo Tour",
    );
    expect(parsed).toEqual({
      year: "2025",
      event: "Photo Tour",
      team: null,
      person: null,
      text: null,
      fullscreenPhotoId: "42",
      slideShow: true,
      slideshowSpeed: 3.5,
    });
  });

  it("falls back to lastYear and defaultEvent when URL has no params", () => {
    const parsed = parseGallerySearchParams(
      new URLSearchParams(),
      "2026",
      "Photo Tour",
    );
    expect(parsed.year).toBe("2026");
    expect(parsed.event).toBe("Photo Tour");
  });

  it("clears year when query param is present", () => {
    const parsed = parseGallerySearchParams(
      new URLSearchParams("query=MIT"),
      "2026",
      "Photo Tour",
    );
    expect(parsed.text).toBe("MIT");
    expect(parsed.year).toBeNull();
    expect(parsed.event).toBeNull();
  });

  it("serializes state and preserves suggest/settings params", () => {
    const base = {
      ...parseGallerySearchParams(new URLSearchParams(), "2025", "Photo Tour"),
      event: "Opening Ceremony",
      fullscreenPhotoId: "99",
      slideshowSpeed: 4,
    };
    const serialized = serializeGallerySearchParams(
      base,
      new URLSearchParams("suggest=abc123&settings=true"),
    );
    expect(Object.fromEntries(serialized.entries())).toEqual({
      album: "2025",
      event: "Opening Ceremony",
      photo: "99",
      slideshowSpeed: "4",
      suggest: "abc123",
      settings: "true",
    });
  });

  it("reattaches default year when selecting event/team/person from search mode", () => {
    const initial = parseGallerySearchParams(
      new URLSearchParams(),
      "2025",
      "Photo Tour",
    );
    const searchState = selectText(initial, "baku");
    expect(searchState.year).toBeNull();

    expect(selectEvent(searchState, "Awards", "2025")).toMatchObject({
      year: "2025",
      event: "Awards",
      text: null,
    });
    expect(selectTeam(searchState, "MIT", "2025")).toMatchObject({
      year: "2025",
      team: "MIT",
      text: null,
    });
    expect(selectPerson(searchState, "Jane", "2025")).toMatchObject({
      year: "2025",
      person: "Jane",
      text: null,
    });
    expect(selectYear(searchState, "2024")).toMatchObject({
      year: "2024",
      event: null,
      text: null,
    });
  });
});
