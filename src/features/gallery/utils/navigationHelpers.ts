import type { GalleryPhotoItem } from "./gallerySections";

export function stepIndex(
  currentIndex: number | null,
  delta: number,
  total: number,
  wrap = false,
): number | null {
  if (currentIndex === null || total <= 0) {
    return null;
  }
  const next = currentIndex + delta;
  if (next >= 0 && next < total) {
    return next;
  }
  if (!wrap) {
    return null;
  }
  return ((next % total) + total) % total;
}

/**
 * Resolves the active flatIndex in `items` for `urlPhotoId`:
 * 1. Keeps `currentIndex` if it already points to `urlPhotoId` (duplicate-safe).
 * 2. Otherwise prefers the occurrence inside `preferredSectionKey` (the URL's `event`).
 * 3. Otherwise falls back to the first event/section in the album that contains `urlPhotoId`.
 */
export function resolveActiveIndex(
  items: readonly GalleryPhotoItem[],
  currentIndex: number | null,
  urlPhotoId: string | null,
  preferredSectionKey?: string | null,
): number | null {
  if (urlPhotoId === null) {
    return null;
  }
  if (
    currentIndex !== null &&
    currentIndex >= 0 &&
    currentIndex < items.length &&
    items[currentIndex]?.photo.id === urlPhotoId
  ) {
    return currentIndex;
  }
  if (preferredSectionKey) {
    const inPreferred = items.findIndex(
      (item) =>
        item.sectionKey === preferredSectionKey && item.photo.id === urlPhotoId,
    );
    if (inPreferred >= 0) {
      return inPreferred;
    }
  }
  const matchedIndex = items.findIndex((item) => item.photo.id === urlPhotoId);
  return matchedIndex >= 0 ? matchedIndex : null;
}
