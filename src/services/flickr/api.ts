import { queryClient } from "@/app/queryClient";
import { apiKey, userId } from "@/config/gallery";
import type {
  FlickrPhoto,
  FlickrPhotoInfoResponse,
  FlickrPhotosetResponse,
  FlickrPhotosResponse,
} from "@/types/gallery";
import {
  buildPhotoInfoUrl,
  buildPhotosetUrl,
  buildTagSearchUrl,
  buildTextSearchUrl,
} from "./urls";

const clientConfig = { apiKey, userId };
const PER_PAGE = 500;

export interface FlickrPhotosPage {
  photos: FlickrPhoto[];
  totalPages: number;
}

async function fetchJson<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T | undefined> {
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return undefined;
    }
    console.error("Flickr request failed:", error);
    return undefined;
  }
}

export async function getAllWithText(
  text: string,
  page = 1,
  signal?: AbortSignal,
): Promise<FlickrPhoto[]> {
  const url = buildTextSearchUrl(clientConfig, text, page, PER_PAGE);
  const data = await fetchJson<FlickrPhotosResponse>(url, signal);
  return data?.photos?.photo ?? [];
}

/**
 * Fetches a single page of a Flickr photoset along with the total page count
 * so page 1 can render immediately after 1 RTT before remaining pages stream in.
 */
export async function getPhotosetPage(
  photosetId: string,
  page: number,
  signal?: AbortSignal,
): Promise<FlickrPhotosPage> {
  const data = await fetchJson<FlickrPhotosetResponse>(
    buildPhotosetUrl(clientConfig, photosetId, page, PER_PAGE),
    signal,
  );
  const photoset = data?.photoset;
  if (!photoset?.photo) {
    return { photos: [], totalPages: 1 };
  }
  const totalPages = Math.max(1, Number(photoset.pages) || 1);
  // Guard against Flickr clamping out-of-range page requests to the last page
  if (Number(photoset.page) > totalPages) {
    return { photos: [], totalPages };
  }
  return { photos: photoset.photo, totalPages };
}

/**
 * Fetches pages 2..totalPages of a Flickr photoset in parallel.
 */
export async function getPhotosetRemainingPages(
  photosetId: string,
  totalPages: number,
  signal?: AbortSignal,
): Promise<FlickrPhoto[]> {
  if (totalPages <= 1) {
    return [];
  }
  const pages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, idx) =>
      getPhotosetPage(photosetId, idx + 2, signal),
    ),
  );
  return pages.flatMap((entry) => entry.photos);
}

/**
 * Fetches a single page of tag-matched photos (used as fallback when a place
 * entry has an empty `photoset_id`).
 */
export async function getTagSearchPage(
  albumTag: string,
  page: number,
  signal?: AbortSignal,
): Promise<FlickrPhotosPage> {
  const data = await fetchJson<FlickrPhotosResponse>(
    buildTagSearchUrl(clientConfig, [albumTag], page, PER_PAGE),
    signal,
  );
  const photos = data?.photos;
  if (!photos?.photo) {
    return { photos: [], totalPages: 1 };
  }
  const totalPages = Math.max(1, Number(photos.pages) || 1);
  if (Number(photos.page) > totalPages) {
    return { photos: [], totalPages };
  }
  return { photos: photos.photo, totalPages };
}

/**
 * Fetches pages 2..totalPages of a tag search in parallel.
 */
export async function getTagSearchRemainingPages(
  albumTag: string,
  totalPages: number,
  signal?: AbortSignal,
): Promise<FlickrPhoto[]> {
  if (totalPages <= 1) {
    return [];
  }
  const pages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, idx) =>
      getTagSearchPage(albumTag, idx + 2, signal),
    ),
  );
  return pages.flatMap((entry) => entry.photos);
}

export function photoInfoQueryKey(photoId: string): readonly [string, string] {
  return ["photoInfo", photoId] as const;
}

export function getCachedPhotoInfo(
  photoId: string,
): FlickrPhotoInfoResponse | undefined {
  return queryClient.getQueryData<FlickrPhotoInfoResponse>(
    photoInfoQueryKey(photoId),
  );
}

export function invalidatePhotoInfoCache(photoId: string): void {
  void queryClient.invalidateQueries({
    queryKey: photoInfoQueryKey(photoId),
  });
}

async function fetchPhotoInfoDirect(
  photoId: string,
  signal?: AbortSignal,
): Promise<FlickrPhotoInfoResponse | undefined> {
  const url = buildPhotoInfoUrl(clientConfig, photoId);
  const data = await fetchJson<FlickrPhotoInfoResponse>(url, signal);
  return data && data.stat === "ok" ? data : undefined;
}

export async function getPhotoInfo(
  photoId: string,
  signal?: AbortSignal,
): Promise<FlickrPhotoInfoResponse | undefined> {
  try {
    return await queryClient.fetchQuery({
      queryKey: photoInfoQueryKey(photoId),
      queryFn: ({ signal: querySignal }) =>
        fetchPhotoInfoDirect(photoId, signal ?? querySignal),
    });
  } catch {
    return undefined;
  }
}

export function prefetchPhotoInfo(photoId: string): void {
  void queryClient.prefetchQuery({
    queryKey: photoInfoQueryKey(photoId),
    queryFn: ({ signal }) => fetchPhotoInfoDirect(photoId, signal),
  });
}
