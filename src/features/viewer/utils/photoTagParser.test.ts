import { describe, expect, it } from "bun:test";
import {
  buildFlickrSetTagsPayload,
  decodeFacePosition,
  encodeFacePosition,
  extractPreservedTags,
  parsePhotoInfoWithPrefixes,
  serializePhotoInfoWithPrefixes,
  type TagPrefixes,
} from "./photoTagParser";

const prefixes: TagPrefixes = {
  event: "event",
  team: "team",
  person: "person",
  album: "albumWF",
  photographer: "photographer",
};

describe("photoTagParser", () => {
  it("round-trips face box coordinates", () => {
    const pos = { left: 0.25, top: 0.1, right: 0.5, bottom: 0.6 };
    const encoded = encodeFacePosition(pos);
    const decoded = decodeFacePosition(encoded);
    expect(decoded).toBeDefined();
    expect(decoded?.left).toBeCloseTo(pos.left, 4);
    expect(decoded?.top).toBeCloseTo(pos.top, 4);
    expect(decoded?.right).toBeCloseTo(pos.right, 4);
    expect(decoded?.bottom).toBeCloseTo(pos.bottom, 4);
  });

  it("parses, serializes, and preserves non-gallery tags safely", () => {
    const encoded = encodeFacePosition({
      left: 0.1,
      top: 0.2,
      right: 0.3,
      bottom: 0.4,
    });
    const rawTags = [
      "event$Opening Ceremony",
      "team$MIT",
      "albumWF$2025",
      `Jane Doe(${encoded})`,
      "featured-homepage",
      "camera:sony",
    ];
    const parsed = parsePhotoInfoWithPrefixes(
      rawTags,
      "Photographer: John Smith",
      prefixes,
    );
    const preserved = extractPreservedTags(rawTags, prefixes);

    expect(preserved).toEqual(["featured-homepage", "camera:sony"]);
    expect(parsed.event).toEqual(["Opening Ceremony"]);
    expect(parsed.team).toEqual(["MIT"]);
    expect(parsed.album).toEqual(["2025"]);
    expect(parsed.photographer).toEqual(["John Smith"]);
    expect(parsed.person).toHaveLength(1);
    expect(parsed.person[0]?.name).toBe("Jane Doe");

    const serialized = serializePhotoInfoWithPrefixes(parsed, prefixes);
    expect(serialized).toContain('"event$Opening Ceremony"');
    expect(serialized).toContain(`"Jane Doe(${encoded})"`);

    const payload = buildFlickrSetTagsPayload(parsed, preserved, prefixes);
    expect(payload).toContain('"featured-homepage"');
    expect(payload).toContain('"camera:sony"');
    expect(payload).toContain('"team$MIT"');
  });
});
