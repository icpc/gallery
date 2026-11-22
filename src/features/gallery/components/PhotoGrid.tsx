import { type FC, memo, useEffect, useState } from "react";
import type { Photo, PhotoSource } from "@/types/gallery";

interface PhotoGridProps {
  photos: Photo[];
  handleClick: (id: string) => void;
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

export const PhotoGrid: FC<PhotoGridProps> = memo(({ photos, handleClick }) => {
  const winW = useWindowWidth();
  const displayPx = (winW >= 900 ? 0.5 : 2) * winW;

  return (
    <div className="masonry">
      {photos.map((photo) => {
        const picked = pickSrc(photo.sources, displayPx) ?? photo.src;
        return (
          <figure key={photo.id} className="masonry-brick">
            <button
              type="button"
              className="masonry-button"
              onClick={() => handleClick(photo.id)}
              aria-label={`View photo ${photo.id}`}
            >
              <img
                className="preview"
                src={picked.url}
                alt={`Gallery item ${photo.id}`}
                loading="lazy"
                decoding="async"
              />
            </button>
          </figure>
        );
      })}
    </div>
  );
});
