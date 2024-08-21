const dataFolder = import.meta.env.VITE_DATA_FOLDER;
console.log(import.meta.env);

const consts = await import(`../${dataFolder}/consts.js`);
export const getRawEventData = async (year) => {
  return (await import(`../${dataFolder}/${year}.event`)).default;
};

export const getRawTeamData = async (year) => {
  return (await import(`../${dataFolder}/${year}.team`)).default;
};

export const getRawPeopleData = async (year) => {
  return (await import(`../${dataFolder}/${year}.people`)).default;
};

console.log(`Using ${dataFolder} folder for consts.js`);
console.log(`Loaded \n${JSON.stringify(consts, undefined, 4)}`);
export const places = consts.places.map(([year, place, contestName]) => ({
  year: year,
  place: place,
  contestName: contestName,
}));
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
export const PER_PAGE = consts.PER_PAGE;
export const LAST_YEAR = consts.LAST_YEAR;
export const DEFAULT_EVENT = consts.DEFAULT_EVENT;
export const FLICKR_IMAGE_PREFIX = consts.FLICKR_IMAGE_PREFIX;
export const SUGGESTIONS_EMAIL = consts.SUGGESTIONS_EMAIL;
// todo: somehow replace this without redeclaration
export const DEBUG = import.meta.env.mode === "development";
