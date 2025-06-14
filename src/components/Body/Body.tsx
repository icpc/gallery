import { FC, useEffect, useMemo, useState } from "react";

import { Typography } from "@mui/material";

import "../../consts";
import { Photo } from "../../types";
import usePhotoLoader from "../../utils/PhotoLoader";
import { useAppContext } from "../AppContext";

import MyModal from "./MyModal";
import PhotoGallery from "./PhotoGallery";

import "../../styles/Body.css";

const Body: FC = () => {
  const {
    data,
    setFullscreenPhotoId,
    setIsSlideShow,
    desktop,
    mobile,
    setIsOpenMenu,
  } = useAppContext();

  const {
    isLoading,
    isPending,
    isError,
    error,
    data: groupedPhotos,
  } = usePhotoLoader();

  const photosList = useMemo(
    () => (groupedPhotos ?? []).flatMap(({ photos }) => photos),
    [groupedPhotos],
  );

  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [rightArrow, setRightArrow] = useState<boolean>(false);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);

  const handleClick = (id: string) => {
    setFullscreenPhotoId(id);
  };

  useEffect(() => {
    const id = data.fullscreenPhotoId;
    if (id != null) {
      const index = photosList.findIndex((photo) => photo.id === id);

      const photo = photosList[index];
      setFullscreenIndex(index);
      setFullscreenPhoto(photo);

      setLeftArrow(index !== 0);
      setRightArrow(index + 1 < photosList.length);
    } else {
      setFullscreenIndex(null);
      setFullscreenPhoto(null);
      setLeftArrow(false);
      setRightArrow(false);
    }
  }, [data.fullscreenPhotoId, photosList]);

  useEffect(() => {
    if (data.fullscreenPhotoId === null) {
      setIsSlideShow(false);
    }
  }, [data.fullscreenPhotoId]);

  // Close mobile menu when scrolling
  useEffect(() => {
    if (!mobile) return;

    const bodyElement = document.querySelector(".body");
    if (!bodyElement) return;

    const handleScroll = () => {
      setIsOpenMenu(false);
    };

    bodyElement.addEventListener("scroll", handleScroll);
    return () => {
      bodyElement.removeEventListener("scroll", handleScroll);
    };
  }, [mobile, setIsOpenMenu]);

  const handleRotationRight = () => {
    if (fullscreenIndex === null) return;
    let newIndex = fullscreenIndex + 1;
    if (newIndex >= photosList.length && photosList.length > 0) {
      newIndex = 0;
    }
    handleClick(photosList[newIndex].id);
  };

  const handleRotationLeft = () => {
    if (fullscreenIndex === null) return;
    let newIndex = fullscreenIndex - 1;
    if (newIndex < 0 && photosList.length > 0) {
      newIndex = photosList.length - 1;
    }
    handleClick(photosList[newIndex].id);
  };

  useEffect(() => {
    const target = document.getElementsByTagName("body")[0];
    const listener = (e: KeyboardEvent) => {
      if (fullscreenPhoto) {
        switch (e.key) {
          case "ArrowLeft":
            if (leftArrow) {
              handleRotationLeft();
            }
            break;
          case "ArrowRight":
            if (rightArrow) {
              handleRotationRight();
            }
            break;
          case "Escape":
            setFullscreenPhotoId(null);
            break;
          default:
            break;
        }
      }
    };
    target.addEventListener("keydown", listener);
    return () => {
      target.removeEventListener("keydown", listener);
    };
  }, [
    fullscreenPhoto,
    rightArrow,
    leftArrow,
    handleRotationRight,
    handleRotationLeft,
    setFullscreenPhotoId,
  ]);

  if (isLoading || isPending) {
    return (
      <div className="body">
        <Typography variant="h1">Loading...</Typography>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="body">
        <Typography variant="h1" color="error">
          Error: {error.message}
        </Typography>
      </div>
    );
  }

  return (
    <div className="body">
      {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
      <PhotoGallery
        groupedPhotos={groupedPhotos ?? []}
        handleClick={handleClick}
      />
      {fullscreenPhoto != null && (
        <MyModal
          photo={fullscreenPhoto}
          handleRotationRight={handleRotationRight}
          handleRotationLeft={handleRotationLeft}
          rightArrow={rightArrow}
          leftArrow={leftArrow}
        />
      )}
    </div>
  );
};

export default Body;
