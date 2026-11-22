import { describe, expect, it } from "bun:test";
import {
  buildFlickrSetTagsPayload,
  extractPreservedTags,
  type TagPrefixes,
} from "@/features/viewer/utils/photoTagParser";
import {
  computePhotoInfoDiff,
  decodeSuggestionPayload,
  encodeSuggestionPayload,
  getDiffFaceEntries,
} from "@/features/viewer/utils/suggestions";
import type { PhotoInfo } from "@/types/gallery";

const PREFIXES: TagPrefixes = {
  event: "event",
  team: "team",
  album: "albumWF",
  person: "person",
  photographer: "photographer",
};

describe("suggestions encoding and diffing", () => {
  it("round-trips Unicode names and Picasa face rectangles losslessly", () => {
    const proposed: PhotoInfo = {
      photographer: ["Łukasz Fotógraf"],
      album: ["2024"],
      event: ["Opening Ceremony"],
      team: ["University of Warsaw"],
      person: [
        {
          name: "José García",
          position: {
            left: 0x1000 / 65535,
            top: 0x2000 / 65535,
            right: 0x3000 / 65535,
            bottom: 0x4000 / 65535,
          },
        },
        { name: "Jane Doe" },
      ],
    };

    const encoded = encodeSuggestionPayload(proposed, PREFIXES);
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");

    const decoded = decodeSuggestionPayload(encoded, PREFIXES);
    expect(decoded).not.toBeNull();
    expect(decoded?.photographer).toEqual(proposed.photographer);
    expect(decoded?.album).toEqual(proposed.album);
    expect(decoded?.event).toEqual(proposed.event);
    expect(decoded?.team).toEqual(proposed.team);
    expect(decoded?.person).toHaveLength(2);
    expect(decoded?.person[0]?.name).toBe("José García");
    expect(decoded?.person[0]?.position?.left).toBeCloseTo(0x1000 / 65535, 5);
    expect(decoded?.person[1]).toEqual({ name: "Jane Doe" });
  });

  it("returns null on empty or malformed suggestion payloads", () => {
    expect(decodeSuggestionPayload(null, PREFIXES)).toBeNull();
    expect(decodeSuggestionPayload("", PREFIXES)).toBeNull();
    expect(decodeSuggestionPayload("!!!not-base64!!!", PREFIXES)).toBeNull();
  });

  it("computes added, removed, and unchanged diffs across all fields including faces", () => {
    const original: PhotoInfo = {
      photographer: ["Alice"],
      album: ["2024"],
      event: ["Photo Tour", "Opening Ceremony"],
      team: ["MIT"],
      person: [
        {
          name: "Bill Poucher",
          position: { left: 0.1, top: 0.1, right: 0.2, bottom: 0.2 },
        },
        { name: "Old Tag" },
      ],
    };

    const proposed: PhotoInfo = {
      photographer: ["Alice"],
      album: ["2024"],
      event: ["Photo Tour", "World Finals"],
      team: ["MIT", "Stanford"],
      person: [
        {
          name: "Bill Poucher",
          position: { left: 0.1, top: 0.1, right: 0.2, bottom: 0.2 },
        },
        {
          name: "New Person",
          position: { left: 0.5, top: 0.2, right: 0.6, bottom: 0.4 },
        },
      ],
    };

    const diff = computePhotoInfoDiff(original, proposed);
    expect(diff.hasChanges).toBe(true);
    expect(diff.event.added).toEqual(["World Finals"]);
    expect(diff.event.removed).toEqual(["Opening Ceremony"]);
    expect(diff.event.unchanged).toEqual(["Photo Tour"]);
    expect(diff.team.added).toEqual(["Stanford"]);
    expect(diff.person.added.map((p) => p.name)).toEqual(["New Person"]);
    expect(diff.person.removed.map((p) => p.name)).toEqual(["Old Tag"]);

    const faces = getDiffFaceEntries(diff);
    expect(faces.map((f) => `${f.status}:${f.person.name}`)).toEqual([
      "unchanged:Bill Poucher",
      "added:New Person",
      "removed:Old Tag",
    ]);

    const noChange = computePhotoInfoDiff(original, original);
    expect(noChange.hasChanges).toBe(false);
  });

  it("preserves non-gallery Flickr tags when building setTags payload", () => {
    const rawFlickrTags = [
      "albumWF$2024",
      "event$Photo Tour",
      "Bill Poucher(1761524d3f579a4d)",
      "icpc",
      "featured shot",
    ];
    const preserved = extractPreservedTags(rawFlickrTags, PREFIXES);
    expect(preserved).toEqual(["icpc", "featured shot"]);

    const payload = buildFlickrSetTagsPayload(
      {
        photographer: [],
        album: ["2024"],
        event: ["Opening Ceremony"],
        team: [],
        person: [],
      },
      preserved,
      PREFIXES,
    );
    expect(payload).toBe(
      '"icpc" "featured shot" "event$Opening Ceremony" "albumWF$2024"',
    );
  });
});
