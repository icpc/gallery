/// <reference types="vite/client" />

declare module "@data/consts.js" {
  import type { Place } from "./types";

  export const places: Place[];
  export const api_key: string;
  export const user_id: string;
  export const title: string;
  export const description: string;
  export const TAG_EVENT: string;
  export const TAG_TEAM: string;
  export const TAG_ALBUM: string;
  export const TAG_PERSON: string;
  export const TAG_PHOTOGRAPHER: string;
  export const SVG_WIDTH: number;
  export const SVG_HEIGHT: number;
  export const LAST_YEAR: string;
  export const DEFAULT_EVENT: string;
  export const FLICKR_IMAGE_PREFIX: string;
  export const SUGGESTIONS_EMAIL: string;
  export const MAX_ALBUM_SIZE: number;
}
