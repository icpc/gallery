import { describe, expect, it } from "bun:test";
import {
  buildPhotoInfoUrl,
  buildPhotosetUrl,
  buildTagSearchUrl,
  buildTextSearchUrl,
} from "./urls";

const cfg = { apiKey: "test-key", userId: "123@N06" };

describe("Flickr REST URL builders", () => {
  it("builds photoset URLs with pagination and extras", () => {
    const url = new URL(buildPhotosetUrl(cfg, "72177720327546558", 2, 500));
    expect(url.searchParams.get("method")).toBe("flickr.photosets.getPhotos");
    expect(url.searchParams.get("photoset_id")).toBe("72177720327546558");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("nojsoncallback")).toBe("1");
    expect(url.searchParams.get("extras")).toContain("date_taken");
    expect(url.searchParams.get("extras")).toContain("url_k");
  });

  it("builds tag search fallback URLs", () => {
    const url = new URL(buildTagSearchUrl(cfg, ["albumACPC$2024"], 1));
    expect(url.searchParams.get("method")).toBe("flickr.photos.search");
    expect(url.searchParams.get("tags")).toBe("albumACPC$2024");
    expect(url.searchParams.get("tag_mode")).toBe("all");
  });

  it("builds text search URLs cleanly with proper encoding", () => {
    const url = new URL(buildTextSearchUrl(cfg, "MIT and albumWF$"));
    expect(url.searchParams.get("text")).toBe("MIT and albumWF$");
    expect(url.searchParams.get("sort")).toBe("date-taken-desc");
  });

  it("builds photo info URLs", () => {
    const infoUrl = new URL(buildPhotoInfoUrl(cfg, "555"));
    expect(infoUrl.searchParams.get("method")).toBe("flickr.photos.getInfo");
    expect(infoUrl.searchParams.get("photo_id")).toBe("555");
  });
});
