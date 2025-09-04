/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch";
import seedrandom from "seedrandom";
import { describe, expect, it } from "vitest";

import { convertRawFlickrTag } from "../src/utils/convertRawFlickrTag";

describe("convertRawFlickrTag unit", () => {
  const RAW_TAG_UNIT_PAIRS = [
    ["photographer$Riverside City College", "photographerriversidecitycollege"],
    ["team$ETH Zürich", "teamethzürich"],
    ["Vinicius Proença(a09e3a30abaf4f85)", "viniciusproençaa09e3a30abaf4f85"],
    [
      "team$Pontificia Universidad Católica de Chile",
      "teampontificiauniversidadcatólicadechile",
    ],
    ["Atacan İyidoğan(c69a5434d7096cd8)", "atacaniyidoğanc69a5434d7096cd8"],
    [
      "team$University of Cambridge 2: Trinity’s Trinity",
      "teamuniversityofcambridge2trinitystrinity",
    ],
    [
      "Michael Douglas GonГ§alves NГіbrega(3645201549fb3db7)",
      "michaeldouglasgonг§alvesnгіbrega3645201549fb3db7",
    ],
  ];
  for (const [raw, expected] of RAW_TAG_UNIT_PAIRS) {
    it(`decodes raw tag '${raw}'`, () => {
      expect(convertRawFlickrTag(raw)).toBe(expected);
    });
  }
});

const API_KEY = "aa713e700906ec8f2decea3f23e24abb";
const USER_ID = "141939107@N06";
const BASE_URL = "https://api.flickr.com/services/rest/";

async function getAllUserPhotos() {
  const perPage = 500;
  const pagePromises: Promise<any>[] = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${BASE_URL}?method=flickr.people.getPhotos&api_key=${API_KEY}&user_id=${USER_ID}&per_page=${perPage}&page=${page}&extras=tags&format=json&nojsoncallback=1`;
    pagePromises.push(fetch(url).then((res) => res.json() as Promise<any>));
  }
  const pageResults: any[] = await Promise.all(pagePromises);
  let allPhotos: any[] = [];
  for (const data of pageResults) {
    if (data?.photos?.photo?.length) {
      allPhotos = allPhotos.concat(data.photos.photo);
    }
  }
  // Return array of { photo_id, tags_cnt }
  return allPhotos.map((p: any) => ({
    id: p.id,
    tags_cnt: p.tags ? p.tags.split(" ").length : 0,
  }));
}

async function getPhotoTags(photo_id: string) {
  const url = `${BASE_URL}?method=flickr.tags.getListPhoto&api_key=${API_KEY}&photo_id=${photo_id}&format=json&nojsoncallback=1`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data?.photo?.tags?.tag || null;
}

const INTERESTING_IDS = ["51545337863"];

function weightedSample<T>(arr: T[], sampleSize: number): T[] {
  if (sampleSize >= arr.length) return arr;

  // Use seedrandom for a stable seeded random generator
  const rng = seedrandom("hello world");

  // Compute a random key for each object based on its weight (tags_cnt)
  const items = arr.map((item) => {
    const weight = (item as any).tags_cnt || 0;
    // For weight > 0, key is rng() raised to the power of 1/weight.
    // For weight of 0, key is 0 so it will be unlikely to get selected.
    const key = weight > 0 ? rng() ** (1 / weight) : 0;
    return { item, key };
  });

  // Sort in descending order of key (largest keys first)
  items.sort((a, b) => b.key - a.key);

  // Pick the top sampleSize items and ensure each has an 'id' property
  return items.slice(0, sampleSize).map(({ item }) => item);
}

describe("flickr API tag conversion (integration)", () => {
  it("automatic test with real flickr api", async () => {
    const photos = await getAllUserPhotos();
    const sample = weightedSample(photos, 1000).concat(
      photos.filter((photo) => INTERESTING_IDS.includes(photo.id)),
    );
    let checked = 0;

    await Promise.all(
      sample.map(async (photo: { id: string }) => {
        const tags = await getPhotoTags(photo.id);
        if (!tags || !Array.isArray(tags)) return [];
        return tags.map((tag) => {
          if (!tag || !tag._content || !tag.raw) return null;
          expect
            .soft(
              convertRawFlickrTag(tag.raw),
              `Wrong tag for raw tag ${tag.raw} in ${photo.id}`,
            )
            .toBe(tag._content);
          checked++;
        });
      }),
    );
    expect(checked).toBeGreaterThan(0); // Ensure at least some tags were checked
  }, 1200000); // allow up to 2min for API
});
