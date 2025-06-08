import { Place } from "./types";

const dataFolder = import.meta.env.VITE_DATA_FOLDER;
console.log(import.meta.env);

const consts = await import(`../${dataFolder}/consts.js`);
export const getRawEventData = async (year: string | null): Promise<string> => {
  return (await import(`../${dataFolder}/${year}.event?raw`)).default;
};

export const getRawTeamData = async (year: string | null): Promise<string> => {
  return (await import(`../${dataFolder}/${year}.team?raw`)).default;
};

export const getRawPeopleData = async (
  year: string | null,
): Promise<string> => {
  return (await import(`../${dataFolder}/${year}.people?raw`)).default;
};

console.log(`Using ${dataFolder} folder for consts.js`);
console.log(`Loaded \n${JSON.stringify(consts, undefined, 4)}`);
export const places: Place[] = consts.places.map(
  ([year, place, contestName]: [string, string, string]) => ({
    year: year,
    place: place,
    contestName: contestName,
  }),
);
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
