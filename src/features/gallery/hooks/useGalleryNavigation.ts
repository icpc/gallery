import { useCallback, useEffect, useState } from "react";
import type { GalleryPhotoItem } from "@/features/gallery/utils/gallerySections";
import {
  resolveActiveIndex,
  stepIndex,
} from "@/features/gallery/utils/navigationHelpers";
import { prefetchPhotoInfo } from "@/services/flickr/api";
import type { Photo } from "@/types/gallery";

interface UseGalleryNavigationOptions {
  items: readonly GalleryPhotoItem[];
  fullscreenPhotoId: string | null;
  preferredSectionKey?: string | null;
  setFullscreenPhotoId: (
    id: string | null,
    options?: { replace?: boolean },
  ) => void;
  setIsSlideShow: (enabled: boolean) => void;
}

export interface GalleryNavigationResult {
  activeIndex: number | null;
  activePhoto: Photo | null;
  activeSectionKey: string | null;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
  openAtIndex: (flatIndex: number) => void;
  closeViewer: () => void;
  goNext: (wrap?: boolean) => void;
  goPrev: (wrap?: boolean) => void;
}

export function useGalleryNavigation({
  items,
  fullscreenPhotoId,
  preferredSectionKey,
  setFullscreenPhotoId,
  setIsSlideShow,
}: UseGalleryNavigationOptions): GalleryNavigationResult {
  const [trackedIndex, setTrackedIndex] = useState<number | null>(null);

  const activeIndex = resolveActiveIndex(
    items,
    trackedIndex,
    fullscreenPhotoId,
    preferredSectionKey,
  );

  useEffect(() => {
    setTrackedIndex(activeIndex);
  }, [activeIndex]);

  // Prefetch neighbor metadata when viewer is open
  useEffect(() => {
    if (activeIndex === null) return;
    const prev = items[activeIndex - 1];
    const next = items[activeIndex + 1];
    if (prev) prefetchPhotoInfo(prev.photo.id);
    if (next) prefetchPhotoInfo(next.photo.id);
  }, [activeIndex, items]);

  useEffect(() => {
    if (fullscreenPhotoId === null) {
      setIsSlideShow(false);
    }
  }, [fullscreenPhotoId, setIsSlideShow]);

  const openAtIndex = useCallback(
    (flatIndex: number) => {
      const target = items[flatIndex];
      if (!target) return;
      setTrackedIndex(flatIndex);
      setFullscreenPhotoId(target.photo.id, { replace: false });
    },
    [items, setFullscreenPhotoId],
  );

  const closeViewer = useCallback(() => {
    setTrackedIndex(null);
    setIsSlideShow(false);
    setFullscreenPhotoId(null, { replace: false });
  }, [setFullscreenPhotoId, setIsSlideShow]);

  const goNext = useCallback(
    (wrap = false) => {
      const nextIdx = stepIndex(activeIndex, 1, items.length, wrap);
      if (nextIdx === null) return;
      const target = items[nextIdx];
      if (!target) return;
      setTrackedIndex(nextIdx);
      setFullscreenPhotoId(target.photo.id, { replace: true });
    },
    [activeIndex, items, setFullscreenPhotoId],
  );

  const goPrev = useCallback(
    (wrap = false) => {
      const prevIdx = stepIndex(activeIndex, -1, items.length, wrap);
      if (prevIdx === null) return;
      const target = items[prevIdx];
      if (!target) return;
      setTrackedIndex(prevIdx);
      setFullscreenPhotoId(target.photo.id, { replace: true });
    },
    [activeIndex, items, setFullscreenPhotoId],
  );

  const activeItem = activeIndex !== null ? items[activeIndex] : undefined;

  return {
    activeIndex,
    activePhoto: activeItem?.photo ?? null,
    activeSectionKey: activeItem?.sectionKey ?? null,
    totalCount: items.length,
    hasPrev: activeIndex !== null && activeIndex > 0,
    hasNext: activeIndex !== null && activeIndex + 1 < items.length,
    openAtIndex,
    closeViewer,
    goNext,
    goPrev,
  };
}
