import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton } from "@mui/material";
import type { FC } from "react";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import type { Photo } from "@/types/gallery";
import { ImageWithFaceSelection } from "./ImageWithFaceSelection";
import { PhotoInfoPanel } from "./PhotoInfoPanel";
import { ViewerControls } from "./ViewerControls";

interface LightboxProps {
  photo: Photo;
  handleRotationLeft: () => void;
  handleRotationRight: () => void;
  leftArrow: boolean;
  rightArrow: boolean;
}

export const Lightbox: FC<LightboxProps> = ({
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
        alt={`Gallery item ${photo.id}`}
        face={face}
        setFace={setFace}
      />
      {!editMode && <ViewerControls />}
      <PhotoInfoPanel photo={photo} setFace={setFace} />
      {leftArrow && !editMode && (
        <div className="overlay-arrows_left">
          <IconButton onClick={handleRotationLeft} aria-label="Previous photo">
            <ArrowForwardIosIcon style={{ transform: "scale(-1, 1)" }} />
          </IconButton>
        </div>
      )}
      {rightArrow && !editMode && (
        <div className="overlay-arrows_right">
          <IconButton onClick={handleRotationRight} aria-label="Next photo">
            <ArrowForwardIosIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};
