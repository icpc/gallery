import { Place } from "./types";
import UniqueList from "./utils/UniqueList";

const consts = await import(`@data/consts.js`);

// This should probably use import.meta.glob, but it doesn't work with aliases yet
const getData = async (
  year: string | null,
  type: "event" | "team" | "people",
): Promise<string[]> => {
  if (!year) return [];
  const data: string = (await import(`@data/${year}.${type}?raw`)).default;
  return UniqueList(
    data
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i != ""),
  );
};

export const getEventData = async (year: string | null) =>
  getData(year, "event");

export const getTeamData = async (year: string | null) => getData(year, "team");

export const getPeopleData = async (year: string | null) =>
  getData(year, "people");

console.log(`Loaded \n${JSON.stringify(consts, undefined, 4)}`);
export const places: Place[] = consts.places as Place[];
export const api_key = consts.api_key;
export const user_id = consts.user_id;
export const title = consts.title;
export const description = consts.description;
export const TAG_EVENT = consts.TAG_EVENT;
export const TAG_TEAM = consts.TAG_TEAM;
export const TAG_ALBUM = consts.TAG_ALBUM;
export const TAG_PERSON = consts.TAG_PERSON;
export const TAG_PHOTOGRAPHER = consts.TAG_PHOTOGRAPHER;
export const SVG_WIDTH = consts.SVG_WIDTH;
export const SVG_HEIGHT = consts.SVG_HEIGHT;
export const LAST_YEAR = consts.LAST_YEAR;
export const DEFAULT_EVENT = consts.DEFAULT_EVENT;
export const FLICKR_IMAGE_PREFIX = consts.FLICKR_IMAGE_PREFIX;
export const SUGGESTIONS_EMAIL = consts.SUGGESTIONS_EMAIL;
export const MAX_ALBUM_SIZE = consts.MAX_ALBUM_SIZE;
// todo: somehow replace this without redeclaration
export const DEBUG = import.meta.env.mode === "development";
