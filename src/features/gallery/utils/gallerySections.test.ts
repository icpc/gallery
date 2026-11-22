import { describe, expect, it } from "bun:test";
import type { FlickrPhoto, Photo } from "@/types/gallery";
import {
  buildGallerySections,
  mergeFlickrPhotoPages,
  normalizeFlickrPhotos,
} from "./gallerySections";

describe("mergeFlickrPhotoPages", () => {
  it("deduplicates photo IDs across pages and sorts by date_taken descending", () => {
    const page1: FlickrPhoto[] = [
      { id: "1", tags: "", date_taken: "2025-09-01 10:00:00" },
      { id: "2", tags: "", date_taken: "2025-09-02 12:00:00" },
    ];
    const page2: FlickrPhoto[] = [
      { id: "2", tags: "", date_taken: "2025-09-02 12:00:00" },
      { id: "3", tags: "", date_taken: "2025-09-03 08:30:00" },
    ];

    const merged = mergeFlickrPhotoPages(page1, page2);
    expect(merged.map((p) => p.id)).toEqual(["3", "2", "1"]);
  });
});

function makePhoto(
  id: string,
  tags: string[],
  events: string[],
  year = "2025",
): Photo {
  const src = {
    url: `https://example.com/${id}.jpg`,
    width: 2048,
    height: 1365,
  };
  return {
    id,
    sources: [src],
    src,
    tags,
    events,
    year,
  };
}

describe("normalizeFlickrPhotos", () => {
  it("extracts sorted sources, year, and matching events using normalized Flickr tags", () => {
    const raw: FlickrPhoto[] = [
      {
        id: "100",
        tags: "albumwf2025 eventphototour eventopeningceremony",
        url_z: "https://example.com/z.jpg",
        width_z: 640,
        height_z: 480,
        url_k: "https://example.com/k.jpg",
        width_k: 2048,
        height_k: 1365,
      },
    ];

    const photos = normalizeFlickrPhotos(raw, {
      years: ["2025", "2024"],
      events: ["Photo Tour", "Opening Ceremony"],
      tagAlbum: "albumWF",
      tagEvent: "event",
    });

    expect(photos).toHaveLength(1);
    expect(photos[0]?.year).toBe("2025");
    expect(photos[0]?.events).toEqual(["Photo Tour", "Opening Ceremony"]);
    expect(photos[0]?.src.url).toBe("https://example.com/k.jpg");
  });
});

describe("buildGallerySections", () => {
  it("preserves duplicate photos across events with unique entryKeys and monotonic flatIndex", () => {
    const sharedPhoto = makePhoto(
      "dup-1",
      ["albumwf2025", "eventphototour", "eventopeningceremony"],
      ["Photo Tour", "Opening Ceremony"],
    );
    const otherPhoto = makePhoto(
      "p-2",
      ["albumwf2025", "eventopeningceremony"],
      ["Opening Ceremony"],
    );

    const sequence = buildGallerySections([sharedPhoto, otherPhoto], {
      mode: "album",
      year: "2025",
      event: "Photo Tour",
      team: null,
      person: null,
      eventsOrder: ["Photo Tour", "Opening Ceremony"],
      tagAlbum: "albumWF",
      tagTeam: "team",
    });

    expect(sequence.sections.map((s) => s.key)).toEqual([
      "Photo Tour",
      "Opening Ceremony",
    ]);
    expect(sequence.items).toHaveLength(3);
    expect(sequence.items.map((item) => item.entryKey)).toEqual([
      "Photo Tour:dup-1",
      "Opening Ceremony:dup-1",
      "Opening Ceremony:p-2",
    ]);
    expect(sequence.items.map((item) => item.flatIndex)).toEqual([0, 1, 2]);
  });

  it("filters by team and person using normalized Flickr tags", () => {
    const p1 = makePhoto(
      "1",
      ["albumwf2025", "teamethzürich", "viniciusproençaa09e3a30abaf4f85"],
      ["Contest"],
    );
    const p2 = makePhoto("2", ["albumwf2025", "teammit"], ["Contest"]);

    const byTeam = buildGallerySections([p1, p2], {
      mode: "album",
      year: "2025",
      event: null,
      team: "ETH Zürich",
      person: null,
      eventsOrder: ["Contest"],
      tagAlbum: "albumWF",
      tagTeam: "team",
    });
    expect(byTeam.items.map((i) => i.photo.id)).toEqual(["1"]);

    const byPerson = buildGallerySections([p1, p2], {
      mode: "album",
      year: "2025",
      event: null,
      team: null,
      person: "Vinicius Proença",
      eventsOrder: ["Contest"],
      tagAlbum: "albumWF",
      tagTeam: "team",
    });
    expect(byPerson.items.map((i) => i.photo.id)).toEqual(["1"]);
  });

  it("groups search results by year descending", () => {
    const p2023 = makePhoto("1", [], [], "2023");
    const p2025 = makePhoto("2", [], [], "2025");

    const seq = buildGallerySections([p2023, p2025], {
      mode: "search",
      year: null,
      event: null,
      team: null,
      person: null,
      eventsOrder: [],
      tagAlbum: "albumWF",
      tagTeam: "team",
    });
    expect(seq.sections.map((s) => s.key)).toEqual(["2025", "2023"]);
  });
});
