import { Dispatch, SetStateAction } from "react";

export interface Place {
  year: string;
  place: string;
  contest_name: string;
  photoset_id: string;
  contest_id?: number;
}

export interface Position {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Person {
  name: string;
  position?: Position;
}

export interface PhotoInfo {
  event: string[];
  team: string[];
  person: Person[];
  album: string[];
  photographer: string[];
}

export interface PhotoSource {
  url: string;
  width: number;
  height: number;
}

export interface Photo {
  sources: PhotoSource[];
  src: PhotoSource;
  id: string;
  origin?: string;
  events: string[];
  year: string;
  tags: string[];
}

export interface GroupedPhotos {
  key: string;
  photos: Photo[];
}

export const flickrSizes = ["t", "s", "n", "m", "z", "c", "l", "o"] as const;

export type FlickrUrlSize = (typeof flickrSizes)[number];

export type FlickrPhoto = {
  id: string;
  tags: string;
} & Partial<Record<`url_${FlickrUrlSize}`, string>> &
  Partial<Record<`width_${FlickrUrlSize}`, number>> &
  Partial<Record<`height_${FlickrUrlSize}`, number>>;

export interface FlickrPhotos {
  page: number;
  pages: number;
  perpage: number;
  total: number;
  photo: FlickrPhoto[];
}

export interface FlickrPhotosResponse {
  photos: FlickrPhotos;
  stat: string;
}

export interface FlickrPhotosetResponse {
  photoset: {
    id: string;
    page: number;
    pages: number;
    perpage: number;
    total: number;
    photo: FlickrPhoto[];
  };
  stat: string;
}

export interface FlickrTag {
  id: string;
  author: string;
  authorname: string;
  raw: string;
  _content: string;
  machine_tag: boolean | number;
}

export interface FlickrPhotoInfo {
  id: string;
  description: { _content: string };
  tags: { tag: FlickrTag[] };
}

export interface FlickrPhotoInfoResponse {
  photo: FlickrPhotoInfo;
  stat: string;
}

export interface AppContextData {
  year: string | null;
  event: string | null;
  text: string | null;
  person: string | null;
  team: string | null;
  fullscreenPhotoId: string | null;
  slideShow: boolean;
}

export interface AppContextType {
  data: AppContextData;
  setYear: (newYear: string) => void;
  setEvent: (newEvent: string) => void;
  setText: (newText: string) => void;
  setPerson: (newPerson: string) => void;
  setTeam: (newTeam: string) => void;
  setFullscreenPhotoId: (newFullscreenPhotoId: string | null) => void;
  isSlideShow: boolean;
  setIsSlideShow: (newIsSlideShow: boolean) => void;
  isOpenMenu: boolean;
  setIsOpenMenu: Dispatch<SetStateAction<boolean>>;
  desktop: boolean;
  mobile: boolean;
  events: string[];
  people: string[];
  teams: string[];
}

export interface PhotoInfoContextType {
  photoInfo: PhotoInfo | null;
  setPhotoInfo: Dispatch<SetStateAction<PhotoInfo | null>>;
  editMode: boolean;
  setEditMode: Dispatch<SetStateAction<boolean>>;
  face: Person | null;
  setFace: Dispatch<SetStateAction<Person | null>>;
  setEvents: (newEvents: string[]) => void;
  setPerson: (newPersonNames: string[]) => void;
  setAlbum: (newAlbum: string[]) => void;
  setTeam: (newTeam: string[]) => void;
  setPhotographer: (newPhotographer: string[]) => void;
  appendPerson: (newPerson: Person) => void;
}
