import { type FC, useEffect } from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import type { Photo } from "@/types/gallery";
import { ViewerControls } from "./ViewerControls";

interface SlideshowProps {
  photo: Photo;
  handleRotationRight: () => void;
}

export const Slideshow: FC<SlideshowProps> = ({
  photo,
  handleRotationRight,
}) => {
  const { data } = useGallery();
  const intervalMs = (data.slideshowSpeed ?? 5) * 1000;

  useEffect(() => {
    const timer = window.setInterval(() => {
      handleRotationRight();
    }, intervalMs);
    return () => {
      window.clearInterval(timer);
    };
  }, [handleRotationRight, intervalMs]);

  return (
    <div className="dismiss">
      <div className="wrapper">
        <ViewerControls />
        <div className="img-container">
          <img className="full" src={photo.src.url} alt="fullsize" />
        </div>
      </div>
    </div>
  );
};
