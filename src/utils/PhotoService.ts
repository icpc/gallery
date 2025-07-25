import { MAX_ALBUM_SIZE, api_key, user_id } from "../consts";
import {
  FlickrPhoto,
  FlickrPhotoInfoResponse,
  FlickrPhotosResponse,
  FlickrPhotosetResponse,
  flickrSizes,
} from "../types";

const sizes = flickrSizes;

const extras =
  "tags," +
  sizes.flatMap((s) => [`url_${s}`, `width_${s}`, `height_${s}`]).join(",") +
  ",date_taken";

function buildQuery(params: Record<string, string | number>): string {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `https://api.flickr.com/services/rest?${queryString}`;
}

function buildPhotoInfoUrl(id: string) {
  const params = {
    method: "flickr.photos.getInfo",
    api_key,
    user_id,
    format: "json",
    nojsoncallback: "?",
    photo_id: id,
  };
  return buildQuery(params);
}

// Refactored fetchData to use fetch instead of axios
async function fetchData<T>(
  url: string,
  config: RequestInit = {},
): Promise<{ data: T } | undefined> {
  try {
    const fetchConfig: RequestInit = { ...config };
    if (config?.signal) {
      fetchConfig.signal = config.signal;
    }
    const response = await fetch(url, fetchConfig);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Flickr returns JSONP if nojsoncallback is not set properly, but we use '?', so parse as JSON
    const data = await response.json();
    // Mimic axios response structure for compatibility
    return { data };
  } catch (e) {
    console.log(e);
  }
}

export async function getAllWithText(
  text: string,
  page = 1,
  config: RequestInit = {},
) {
  const perPage = 500;
  const params: Record<string, string | number> = {
    method: "flickr.photos.search",
    api_key,
    user_id,
    page,
    per_page: perPage,
    extras,
    format: "json",
    nojsoncallback: "?",
    tag_mode: "all",
    sort: "date-taken-desc",
    text,
  };
  const url = buildQuery(params);
  const response = await fetchData<FlickrPhotosResponse>(url, config);
  if (!response) {
    return [];
  }
  return response.data.photos.photo;
}

export async function getAllPhotosFromPhotoset(
  photoset_id: string,
  config: RequestInit = {},
) {
  const perPage = 200;
  const totalPages = Math.ceil(MAX_ALBUM_SIZE / perPage);
  const requests = Array.from({ length: totalPages }, (_, i) => {
    const page = i + 1;
    const params: Record<string, string | number> = {
      method: "flickr.photosets.getPhotos",
      api_key,
      user_id,
      page,
      per_page: perPage,
      extras,
      format: "json",
      nojsoncallback: "?",
      photoset_id,
    };
    const url = buildQuery(params);
    return fetchData<FlickrPhotosetResponse>(url, config);
  });
  const responses = await Promise.all(requests);
  const allPhotos: FlickrPhoto[] = [];
  for (const response of responses) {
    if (response?.data?.photoset?.photo) {
      allPhotos.push(...response.data.photoset.photo);
    }
  }
  // Sort by date-taken-desc (descending)
  allPhotos.sort((a, b) => {
    const dateA =
      "date_taken" in a && a.date_taken
        ? Date.parse(a.date_taken as string)
        : 0;
    const dateB =
      "date_taken" in b && b.date_taken
        ? Date.parse(b.date_taken as string)
        : 0;
    return dateB - dateA;
  });
  return allPhotos;
}

export function getPhotoInfo(id: string, config: RequestInit = {}) {
  return fetchData<FlickrPhotoInfoResponse>(buildPhotoInfoUrl(id), config);
}
