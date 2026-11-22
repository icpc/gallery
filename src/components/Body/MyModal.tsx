import type { FC } from "react";

import type { Photo } from "../../types";
import { useAppContext } from "../AppContext";

import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";

import "../../styles/Body.css";

interface Props {
  photo: Photo;
  handleRotationLeft: () => void;
  handleRotationRight: () => void;
  leftArrow: boolean;
  rightArrow: boolean;
}

const MyModal: FC<Props> = ({
  photo,
  handleRotationLeft,
  handleRotationRight,
  leftArrow,
  rightArrow,
}) => {
  const { setFullscreenPhotoId, isSlideShow } = useAppContext();

  const handleClick = (e: React.MouseEvent) => {
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
          handleRotationRight={handleRotationRight}
          handleRotationLeft={handleRotationLeft}
          leftArrow={leftArrow}
          rightArrow={rightArrow}
        />
      )}
    </div>
  );
};

export default MyModal;
