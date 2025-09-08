import { FC, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { Photo, PhotoSource } from "../../types";

interface Props {
  photos: Photo[];
  handleClick: (id: string) => void;
}

function useWindowWidth() {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

const PhotoGrid: FC<Props> = ({ photos, handleClick }) => {
  const winW = useWindowWidth();

  const displayPx = (winW >= 900 ? 0.5 : 2) * winW;

  const pickSrc = (sources: PhotoSource[]) =>
    sources.findLast((s) => s.width <= displayPx) ?? sources[0];

  return (
    <div className="masonry">
      {photos.map((photo) => {
        return (
          <figure key={photo.id} className="masonry-brick">
            <LazyLoadImage
              className="preview"
              src={pickSrc(photo.sources).url}
              alt={`Photo ${photo.id}`}
              onClick={() => handleClick(photo.id)}
            />
          </figure>
        );
      })}
    </div>
  );
};

export default PhotoGrid;
