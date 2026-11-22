import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { IconButton } from "@mui/material";
import type { FC } from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";

export const ViewerControls: FC = () => {
  const { setFullscreenPhotoId, isSlideShow, setIsSlideShow } = useGallery();

  return (
    <div className="control">
      <IconButton
        className="dismiss"
        onClick={() => setIsSlideShow(!isSlideShow)}
        aria-label={isSlideShow ? "Pause slideshow" : "Start slideshow"}
      >
        {isSlideShow ? (
          <PauseIcon className="icon-button" fontSize="large" />
        ) : (
          <PlayArrowIcon className="icon-button" fontSize="large" />
        )}
      </IconButton>
      <IconButton
        className="dismiss"
        onClick={() => setFullscreenPhotoId(null)}
        aria-label="Close viewer"
      >
        <CloseIcon className="icon-button" fontSize="large" />
      </IconButton>
    </div>
  );
};
