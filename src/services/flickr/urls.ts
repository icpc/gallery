import { flickrSizes } from "@/types/gallery";

export const FLICKR_API_ENDPOINT = "https://api.flickr.com/services/rest";

export const FLICKR_PHOTO_EXTRAS = [
  "tags",
  ...flickrSizes.flatMap((size) => [
    `url_${size}`,
    `width_${size}`,
    `height_${size}`,
  ]),
  "date_taken",
].join(",");

export interface FlickrClientConfig {
  apiKey: string;
  userId: string;
}

export function buildFlickrRestUrl(
  params: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  return `${FLICKR_API_ENDPOINT}?${query.toString()}`;
}

export function buildPhotosetUrl(
  config: FlickrClientConfig,
  photosetId: string,
  page: number,
  perPage = 500,
): string {
  return buildFlickrRestUrl({
    method: "flickr.photosets.getPhotos",
    api_key: config.apiKey,
    user_id: config.userId,
    photoset_id: photosetId,
    page,
    per_page: perPage,
    extras: FLICKR_PHOTO_EXTRAS,
    format: "json",
    nojsoncallback: 1,
  });
}

export function buildTagSearchUrl(
  config: FlickrClientConfig,
  tags: string[],
  page: number,
  perPage = 500,
): string {
  return buildFlickrRestUrl({
    method: "flickr.photos.search",
    api_key: config.apiKey,
    user_id: config.userId,
    tags: tags.join(","),
    tag_mode: "all",
    sort: "date-taken-desc",
    page,
    per_page: perPage,
    extras: FLICKR_PHOTO_EXTRAS,
    format: "json",
    nojsoncallback: 1,
  });
}

export function buildTextSearchUrl(
  config: FlickrClientConfig,
  text: string,
  page = 1,
  perPage = 500,
): string {
  return buildFlickrRestUrl({
    method: "flickr.photos.search",
    api_key: config.apiKey,
    user_id: config.userId,
    text,
    tag_mode: "all",
    sort: "date-taken-desc",
    page,
    per_page: perPage,
    extras: FLICKR_PHOTO_EXTRAS,
    format: "json",
    nojsoncallback: 1,
  });
}

export function buildPhotoInfoUrl(
  config: FlickrClientConfig,
  photoId: string,
): string {
  return buildFlickrRestUrl({
    method: "flickr.photos.getInfo",
    api_key: config.apiKey,
    user_id: config.userId,
    photo_id: photoId,
    format: "json",
    nojsoncallback: 1,
  });
}
