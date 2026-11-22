import { useEffect } from "react";
import type { GalleryPhotoItem } from "@/features/gallery/utils/gallerySections";

const preloadedUrls = new Set<string>();

function preloadUrl(url: string): void {
  if (!url || preloadedUrls.has(url)) {
    return;
  }
  preloadedUrls.add(url);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}

export function useImagePreload(
  items: readonly GalleryPhotoItem[],
  activeIndex: number | null,
): void {
  useEffect(() => {
    if (activeIndex === null) return;
    const offsets = [-1, 1, 2];
    for (const offset of offsets) {
      const candidate = items[activeIndex + offset];
      if (candidate) {
        preloadUrl(candidate.photo.src.url);
      }
    }
  }, [items, activeIndex]);
}
