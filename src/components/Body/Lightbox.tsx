import { FC } from "react";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton } from "@mui/material";

import { Photo } from "../../types";

import Control from "./Control";
import ImageWithFaceSelection from "./ImageWithFaceSelection";
import { usePhotoInfo } from "./PhotoInfo/PhotoInfoContext";
import PhotoInfoPanel from "./PhotoInfo/PhotoInfoPanel";

import "../../styles/Body.css";

interface Props {
  photo: Photo;
  handleRotationLeft: () => void;
  handleRotationRight: () => void;
  leftArrow: boolean;
  rightArrow: boolean;
}

const Lightbox: FC<Props> = ({
  photo,
  handleRotationLeft,
  handleRotationRight,
  leftArrow,
  rightArrow,
}) => {
  const { editMode, face, setFace } = usePhotoInfo();

  return (
    <div className="wrapper">
      <ImageWithFaceSelection
        key={photo.id}
        photo={photo}
        alt={"fullscreen image"}
        face={face}
        setFace={setFace}
      />
      {!editMode && <Control />}
      <PhotoInfoPanel photo={photo} setFace={setFace} />
      {leftArrow && !editMode && (
        <div className="overlay-arrows_left">
          <IconButton onClick={handleRotationLeft}>
            <ArrowForwardIosIcon style={{ transform: "scale(-1, 1)" }} />
          </IconButton>
        </div>
      )}
      {rightArrow && !editMode && (
        <div className="overlay-arrows_right">
          <IconButton onClick={handleRotationRight}>
            <ArrowForwardIosIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default Lightbox;
