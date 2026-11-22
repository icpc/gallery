import { apiKey, MAX_ALBUM_SIZE, userId } from "@/config/gallery";
import {
  type FlickrPhoto,
  type FlickrPhotoInfoResponse,
  type FlickrPhotosetResponse,
  type FlickrPhotosResponse,
  flickrSizes,
} from "@/types/gallery";

const extras =
  "tags," +
  flickrSizes
    .flatMap((s) => [`url_${s}`, `width_${s}`, `height_${s}`])
    .join(",") +
  ",date_taken";

function buildQuery(params: Record<string, string | number>): string {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `https://api.flickr.com/services/rest?${queryString}`;
}

function buildPhotoInfoUrl(id: string): string {
  return buildQuery({
    method: "flickr.photos.getInfo",
    api_key: apiKey,
    user_id: userId,
    format: "json",
    nojsoncallback: "?",
    photo_id: id,
  });
}

async function fetchData<T>(
  url: string,
  config: RequestInit = {},
): Promise<{ data: T } | undefined> {
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as T;
    return { data };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function getAllWithText(
  text: string,
  page = 1,
  config: RequestInit = {},
): Promise<FlickrPhoto[]> {
  const url = buildQuery({
    method: "flickr.photos.search",
    api_key: apiKey,
    user_id: userId,
    page,
    per_page: 500,
    extras,
    format: "json",
    nojsoncallback: "?",
    tag_mode: "all",
    sort: "date-taken-desc",
    text,
  });
  const response = await fetchData<FlickrPhotosResponse>(url, config);
  return response?.data.photos.photo ?? [];
}

export async function getAllPhotosFromPhotoset(
  photosetId: string,
  config: RequestInit = {},
): Promise<FlickrPhoto[]> {
  const perPage = 500;
  const totalPages = Math.ceil(MAX_ALBUM_SIZE / perPage);
  const requests = Array.from({ length: totalPages }, (_, i) => {
    const url = buildQuery({
      method: "flickr.photosets.getPhotos",
      api_key: apiKey,
      user_id: userId,
      page: i + 1,
      per_page: perPage,
      extras,
      format: "json",
      nojsoncallback: "?",
      photoset_id: photosetId,
    });
    return fetchData<FlickrPhotosetResponse>(url, config);
  });
  const responses = await Promise.all(requests);
  const allPhotos: FlickrPhoto[] = [];
  for (const response of responses) {
    if (response?.data?.photoset?.photo) {
      allPhotos.push(...response.data.photoset.photo);
    }
  }
  allPhotos.sort((a, b) => {
    const dateA = a.date_taken ? Date.parse(a.date_taken) : 0;
    const dateB = b.date_taken ? Date.parse(b.date_taken) : 0;
    return dateB - dateA;
  });
  return allPhotos;
}

export function getPhotoInfo(
  id: string,
  config: RequestInit = {},
): Promise<{ data: FlickrPhotoInfoResponse } | undefined> {
  return fetchData<FlickrPhotoInfoResponse>(buildPhotoInfoUrl(id), config);
}
