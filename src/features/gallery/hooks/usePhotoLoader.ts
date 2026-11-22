import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { places, TAG_ALBUM, TAG_EVENT, TAG_TEAM } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import {
  buildGallerySections,
  type GallerySequence,
  mergeFlickrPhotoPages,
  normalizeFlickrPhotos,
} from "@/features/gallery/utils/gallerySections";
import {
  getAllWithText,
  getPhotosetPage,
  getPhotosetRemainingPages,
  getTagSearchPage,
  getTagSearchRemainingPages,
} from "@/services/flickr/api";

const ALL_YEARS = places.map(({ year }) => year);

export interface PhotoLoaderResult {
  sequence: GallerySequence;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
}

/**
 * Progressive page-1-first album loader backed by persisted TanStack Query:
 * - Page 1 (first 500 photos) renders immediately after 1 RTT (or 0 RTT on
 *   page reload from localStorage).
 * - If Flickr reports `totalPages > 1`, pages 2..totalPages stream in parallel
 *   and merge seamlessly without a hardcoded MAX_ALBUM_SIZE limit.
 */
export function usePhotoLoader(): PhotoLoaderResult {
  const { data, events } = useGallery();

  const photosetId = useMemo(
    () => places.find(({ year }) => year === data.year)?.photoset_id ?? "",
    [data.year],
  );

  const isSearchMode = Boolean(data.text);
  const albumTag = data.year ? `${TAG_ALBUM}$${data.year}` : "";

  const searchQuery = useQuery({
    queryKey: ["photos", "search", TAG_ALBUM, data.text ?? ""],
    queryFn: ({ signal }) =>
      data.text
        ? getAllWithText(`${data.text} and ${TAG_ALBUM}$`, 1, signal)
        : [],
    enabled: isSearchMode,
  });

  const page1Query = useQuery({
    queryKey: photosetId
      ? ["photos", "photoset", photosetId, "page1"]
      : ["photos", "tag", albumTag, "page1"],
    queryFn: ({ signal }) => {
      if (photosetId) {
        return getPhotosetPage(photosetId, 1, signal);
      }
      if (albumTag) {
        return getTagSearchPage(albumTag, 1, signal);
      }
      return { photos: [], totalPages: 1 };
    },
    enabled: !isSearchMode && Boolean(photosetId || albumTag),
  });

  const totalPages = page1Query.data?.totalPages ?? 1;

  const remainingPagesQuery = useQuery({
    queryKey: photosetId
      ? ["photos", "photoset", photosetId, "rest", totalPages]
      : ["photos", "tag", albumTag, "rest", totalPages],
    queryFn: ({ signal }) => {
      if (photosetId) {
        return getPhotosetRemainingPages(photosetId, totalPages, signal);
      }
      if (albumTag) {
        return getTagSearchRemainingPages(albumTag, totalPages, signal);
      }
      return [];
    },
    enabled: !isSearchMode && totalPages > 1,
  });

  const rawPhotos = useMemo(() => {
    if (isSearchMode) {
      return searchQuery.data ?? [];
    }
    return mergeFlickrPhotoPages(
      page1Query.data?.photos ?? [],
      remainingPagesQuery.data ?? [],
    );
  }, [
    isSearchMode,
    searchQuery.data,
    page1Query.data?.photos,
    remainingPagesQuery.data,
  ]);

  const normalizedPhotos = useMemo(
    () =>
      normalizeFlickrPhotos(rawPhotos, {
        years: ALL_YEARS,
        events,
        tagAlbum: TAG_ALBUM,
        tagEvent: TAG_EVENT,
      }),
    [rawPhotos, events],
  );

  const sequence = useMemo(
    () =>
      buildGallerySections(normalizedPhotos, {
        mode: isSearchMode ? "search" : "album",
        year: data.year,
        event: data.event,
        team: data.team,
        person: data.person,
        eventsOrder: events,
        tagAlbum: TAG_ALBUM,
        tagTeam: TAG_TEAM,
      }),
    [
      normalizedPhotos,
      isSearchMode,
      data.year,
      data.event,
      data.team,
      data.person,
      events,
    ],
  );

  const isLoading = isSearchMode ? searchQuery.isPending : page1Query.isPending;
  const isLoadingMore =
    !isSearchMode && totalPages > 1 && remainingPagesQuery.isFetching;
  const error =
    (isSearchMode
      ? searchQuery.error
      : (page1Query.error ?? remainingPagesQuery.error)) ?? null;

  return { sequence, isLoading, isLoadingMore, error };
}
