import * as consts from "@data/consts.js";
import { uniqueList } from "@/shared/utils/uniqueList";
import type { Place } from "@/types/gallery";

export const places: Place[] = consts.places;
export const apiKey: string = consts.api_key;
export const userId: string = consts.user_id;
export const title: string = consts.title;
export const description: string = consts.description;
export const TAG_EVENT: string = consts.TAG_EVENT;
export const TAG_TEAM: string = consts.TAG_TEAM;
export const TAG_ALBUM: string = consts.TAG_ALBUM;
export const TAG_PERSON: string = consts.TAG_PERSON;
export const TAG_PHOTOGRAPHER: string = consts.TAG_PHOTOGRAPHER;
export const SVG_WIDTH: number = consts.SVG_WIDTH;
export const SVG_HEIGHT: number = consts.SVG_HEIGHT;
export const LAST_YEAR: string = consts.LAST_YEAR;
export const DEFAULT_EVENT: string = consts.DEFAULT_EVENT;
export const FLICKR_IMAGE_PREFIX: string = consts.FLICKR_IMAGE_PREFIX;
export const SUGGESTIONS_EMAIL: string = consts.SUGGESTIONS_EMAIL;
export const MAX_ALBUM_SIZE: number = consts.MAX_ALBUM_SIZE;
export const UNIQUE_CONTEST_KEY: string = TAG_ALBUM;

const rawDataLoaders = import.meta.glob<string>(
  ["@data/*.event", "@data/*.team", "@data/*.people"],
  { query: "?raw", import: "default" },
);

const dataCache = new Map<string, Promise<string[]>>();

function parseLines(raw: string): string[] {
  return uniqueList(
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== ""),
  );
}

function loadRawList(
  year: string | null,
  type: "event" | "team" | "people",
): Promise<string[]> {
  if (!year) {
    return Promise.resolve([]);
  }
  const cacheKey = `${year}.${type}`;
  const cached = dataCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const suffix = `/${year}.${type}`;
  const entry = Object.entries(rawDataLoaders).find(([key]) =>
    key.endsWith(suffix),
  );
  if (!entry) {
    return Promise.resolve([]);
  }

  const promise = entry[1]()
    .then(parseLines)
    .catch(() => []);
  dataCache.set(cacheKey, promise);
  return promise;
}

export function getEventData(year: string | null): Promise<string[]> {
  return loadRawList(year, "event");
}

export function getTeamData(year: string | null): Promise<string[]> {
  return loadRawList(year, "team");
}

export function getPeopleData(year: string | null): Promise<string[]> {
  return loadRawList(year, "people");
}
