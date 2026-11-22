import type { FC, MouseEvent } from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import type { Photo } from "@/types/gallery";
import { Lightbox } from "./Lightbox";
import { Slideshow } from "./Slideshow";

interface PhotoModalProps {
  photo: Photo;
  handleRotationLeft: () => void;
  handleRotationRight: () => void;
  leftArrow: boolean;
  rightArrow: boolean;
}

export const PhotoModal: FC<PhotoModalProps> = ({
  photo,
  handleRotationLeft,
  handleRotationRight,
  leftArrow,
  rightArrow,
}) => {
  const { setFullscreenPhotoId, isSlideShow } = useGallery();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("dismiss")) {
      setFullscreenPhotoId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="overlay dismiss"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setFullscreenPhotoId(null);
        }
      }}
      style={{ backgroundColor: isSlideShow ? "black" : "" }}
    >
      {isSlideShow ? (
        <Slideshow photo={photo} handleRotationRight={handleRotationRight} />
      ) : (
        <Lightbox
          photo={photo}
          handleRotationLeft={handleRotationLeft}
          handleRotationRight={handleRotationRight}
          leftArrow={leftArrow}
          rightArrow={rightArrow}
        />
      )}
    </div>
  );
};
