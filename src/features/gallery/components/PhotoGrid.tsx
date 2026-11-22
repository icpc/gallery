import { type FC, memo, useEffect, useState } from "react";
import type { GalleryPhotoItem } from "@/features/gallery/utils/gallerySections";
import type { PhotoSource } from "@/types/gallery";

interface PhotoGridProps {
  items: readonly GalleryPhotoItem[];
  onSelectIndex: (flatIndex: number) => void;
}

function useWindowWidth(): number {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

function pickSrc(
  sources: PhotoSource[],
  displayPx: number,
): PhotoSource | undefined {
  return sources.findLast((s) => s.width <= displayPx) ?? sources[0];
}

export const PhotoGrid: FC<PhotoGridProps> = memo(
  ({ items, onSelectIndex }) => {
    const winW = useWindowWidth();
    const displayPx = (winW >= 900 ? 0.5 : 2) * winW;

    return (
      <div className="masonry">
        {items.map((item) => {
          const picked =
            pickSrc(item.photo.sources, displayPx) ?? item.photo.src;
          return (
            <figure key={item.entryKey} className="masonry-brick">
              <button
                type="button"
                className="masonry-button"
                onClick={() => onSelectIndex(item.flatIndex)}
                aria-label={`View gallery item ${item.photo.id}`}
              >
                <img
                  className="preview"
                  src={picked.url}
                  alt={`Gallery item ${item.photo.id}`}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </figure>
          );
        })}
      </div>
    );
  },
);
