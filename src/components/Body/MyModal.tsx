import { FC } from "react";

import { Photo } from "../../types";
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
      className="overlay dismiss"
      onClick={handleClick}
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
