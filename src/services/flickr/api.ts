import { queryClient } from "@/app/queryClient";
import { apiKey, userId } from "@/config/gallery";
import type {
  FlickrAuthCredentials,
  FlickrPhoto,
  FlickrPhotoInfoResponse,
  FlickrPhotosetResponse,
  FlickrPhotosResponse,
} from "@/types/gallery";
import { signFlickrOAuthParams } from "./oauth";
import {
  buildPhotoInfoUrl,
  buildPhotosetUrl,
  buildTagSearchUrl,
  buildTextSearchUrl,
  FLICKR_API_ENDPOINT,
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
  if (Number(photoset.page) > totalPages) {
    return { photos: [], totalPages };
  }
  return { photos: photoset.photo, totalPages };
}

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

interface FlickrWriteBaseResponse {
  stat: "ok" | "fail";
  message?: string;
  code?: number;
  user?: {
    id: string;
    username?: {
      _content?: string;
    };
  };
}

async function postSignedFlickrMethod(
  method: string,
  extraParams: Record<string, string>,
  credentials: FlickrAuthCredentials,
): Promise<FlickrWriteBaseResponse> {
  const signedParams = await signFlickrOAuthParams(
    "POST",
    FLICKR_API_ENDPOINT,
    {
      method,
      format: "json",
      nojsoncallback: "1",
      ...extraParams,
    },
    credentials,
  );

  const body = new URLSearchParams(signedParams);
  const response = await fetch(FLICKR_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Flickr API returned HTTP ${response.status}`);
  }

  return (await response.json()) as FlickrWriteBaseResponse;
}

export async function testFlickrLogin(
  credentials: FlickrAuthCredentials,
): Promise<{ ok: true; username: string } | { ok: false; error: string }> {
  try {
    const result = await postSignedFlickrMethod(
      "flickr.test.login",
      {},
      credentials,
    );
    if (result.stat === "ok") {
      return {
        ok: true,
        username:
          result.user?.username?._content ?? result.user?.id ?? "Flickr user",
      };
    }
    return {
      ok: false,
      error: result.message ?? "Flickr rejected the provided credentials.",
    };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to reach Flickr API.",
    };
  }
}

export async function updatePhotoTags(
  photoId: string,
  tagsPayload: string,
  credentials: FlickrAuthCredentials,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const result = await postSignedFlickrMethod(
      "flickr.photos.setTags",
      {
        photo_id: photoId,
        tags: tagsPayload,
      },
      credentials,
    );
    if (result.stat === "ok") {
      invalidatePhotoInfoCache(photoId);
      return { ok: true };
    }
    return {
      ok: false,
      error: result.message ?? "Flickr rejected the tag update.",
    };
  } catch (e: unknown) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Failed to update tags on Flickr.",
    };
  }
}
