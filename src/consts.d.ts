// Type definitions for ICPC Gallery consts.js files

export interface Place {
  year: string;
  place: string;
  contest_name: string;
  photoset_id: string;
  contest_id?: number;
}

export declare const places: Place[];
export declare const api_key: string;
export declare const user_id: string;
export declare const title: string;
export declare const description: string;
export declare const FLICKR_IMAGE_PREFIX: string;
export declare const SUGGESTIONS_EMAIL: string;
export declare const TAG_EVENT: string;
export declare const TAG_TEAM: string;
export declare const TAG_ALBUM: string;
export declare const TAG_PERSON: string;
export declare const TAG_PHOTOGRAPHER: string;
export declare const SVG_WIDTH: number;
export declare const SVG_HEIGHT: number;
export declare const LAST_YEAR: string;
export declare const DEFAULT_EVENT: string;
export declare const MAX_ALBUM_SIZE: number;
