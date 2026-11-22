import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryPhotoItem } from "@/features/gallery/utils/gallerySections";
import {
  resolveActiveIndex,
  stepIndex,
} from "@/features/gallery/utils/navigationHelpers";
import { prefetchPhotoInfo } from "@/services/flickr/api";
import type { Photo } from "@/types/gallery";

const URL_SYNC_DELAY_MS = 60;

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

interface PendingNavigation {
  index: number | null;
  photoId: string | null;
}

export function useGalleryNavigation({
  items,
  fullscreenPhotoId,
  preferredSectionKey,
  setFullscreenPhotoId,
  setIsSlideShow,
}: UseGalleryNavigationOptions): GalleryNavigationResult {
  const [trackedIndex, setTrackedIndex] = useState<number | null>(null);
  const [pendingNav, setPendingNav] = useState<PendingNavigation | null>(null);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const prevUrlPhotoIdRef = useRef<string | null>(fullscreenPhotoId);
  const urlSyncTimerRef = useRef<number | null>(null);

  const cancelPendingUrlSync = useCallback(() => {
    if (urlSyncTimerRef.current !== null) {
      window.clearTimeout(urlSyncTimerRef.current);
      urlSyncTimerRef.current = null;
    }
  }, []);

  const hasValidPendingNav =
    pendingNav !== null &&
    (pendingNav.index === null
      ? pendingNav.photoId === null
      : items[pendingNav.index]?.photo.id === pendingNav.photoId);

  const activeIndex = hasValidPendingNav
    ? pendingNav.index
    : resolveActiveIndex(
        items,
        trackedIndex,
        fullscreenPhotoId,
        preferredSectionKey,
      );

  const activeIndexRef = useRef<number | null>(activeIndex);
  activeIndexRef.current = activeIndex;

  // Reconcile local navigation state when the URL's `photo` parameter changes
  useEffect(() => {
    if (fullscreenPhotoId === prevUrlPhotoIdRef.current) {
      return;
    }
    prevUrlPhotoIdRef.current = fullscreenPhotoId;

    if (pendingNav !== null && fullscreenPhotoId === pendingNav.photoId) {
      setTrackedIndex(pendingNav.index);
      setPendingNav(null);
      return;
    }

    cancelPendingUrlSync();
    setPendingNav(null);
    setTrackedIndex(
      resolveActiveIndex(
        itemsRef.current,
        activeIndexRef.current,
        fullscreenPhotoId,
        preferredSectionKey,
      ),
    );
  }, [
    fullscreenPhotoId,
    pendingNav,
    preferredSectionKey,
    cancelPendingUrlSync,
  ]);

  useEffect(() => {
    if (!hasValidPendingNav) {
      setTrackedIndex(activeIndex);
    }
  }, [activeIndex, hasValidPendingNav]);

  useEffect(() => cancelPendingUrlSync, [cancelPendingUrlSync]);

  // Prefetch neighbor metadata when viewer is open
  useEffect(() => {
    if (activeIndex === null) return;
    const prev = items[activeIndex - 1];
    const next = items[activeIndex + 1];
    if (prev) prefetchPhotoInfo(prev.photo.id);
    if (next) prefetchPhotoInfo(next.photo.id);
  }, [activeIndex, items]);

  useEffect(() => {
    if (fullscreenPhotoId === null && !hasValidPendingNav) {
      setIsSlideShow(false);
    }
  }, [fullscreenPhotoId, hasValidPendingNav, setIsSlideShow]);

  const openAtIndex = useCallback(
    (flatIndex: number) => {
      const target = itemsRef.current[flatIndex];
      if (!target) return;
      cancelPendingUrlSync();
      activeIndexRef.current = flatIndex;
      setTrackedIndex(flatIndex);
      setPendingNav({ index: flatIndex, photoId: target.photo.id });
      setFullscreenPhotoId(target.photo.id, { replace: false });
    },
    [cancelPendingUrlSync, setFullscreenPhotoId],
  );

  const closeViewer = useCallback(() => {
    cancelPendingUrlSync();
    activeIndexRef.current = null;
    setTrackedIndex(null);
    setPendingNav({ index: null, photoId: null });
    setIsSlideShow(false);
    setFullscreenPhotoId(null, { replace: false });
  }, [cancelPendingUrlSync, setFullscreenPhotoId, setIsSlideShow]);

  const stepBy = useCallback(
    (delta: number, wrap: boolean) => {
      const currentItems = itemsRef.current;
      const nextIdx = stepIndex(
        activeIndexRef.current,
        delta,
        currentItems.length,
        wrap,
      );
      if (nextIdx === null) return;
      const target = currentItems[nextIdx];
      if (!target) return;

      activeIndexRef.current = nextIdx;
      setTrackedIndex(nextIdx);
      setPendingNav({ index: nextIdx, photoId: target.photo.id });

      cancelPendingUrlSync();
      const targetPhotoId = target.photo.id;
      urlSyncTimerRef.current = window.setTimeout(() => {
        urlSyncTimerRef.current = null;
        if (targetPhotoId === prevUrlPhotoIdRef.current) {
          setPendingNav(null);
          return;
        }
        setFullscreenPhotoId(targetPhotoId, { replace: true });
      }, URL_SYNC_DELAY_MS);
    },
    [cancelPendingUrlSync, setFullscreenPhotoId],
  );

  const goNext = useCallback(
    (wrap = false) => {
      stepBy(1, wrap === true);
    },
    [stepBy],
  );

  const goPrev = useCallback(
    (wrap = false) => {
      stepBy(-1, wrap === true);
    },
    [stepBy],
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
