import { Typography } from "@mui/material";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";

import "../../consts";
import type { Photo } from "../../types";
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

  const photosList = useMemo(() => {
    const photos: Photo[] = [];
    (groupedPhotos ?? [])
      .flatMap(({ photos }) => photos)
      .forEach((photo) => {
        if (photos.find((p) => p.id === photo.id) === undefined) {
          photos.push(photo);
        }
      });
    return photos;
  }, [groupedPhotos]);

  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [rightArrow, setRightArrow] = useState<boolean>(false);
  const [leftArrow, setLeftArrow] = useState<boolean>(false);

  const handleClick = useCallback(
    (id: string) => {
      setFullscreenPhotoId(id);
    },
    [setFullscreenPhotoId],
  );

  useEffect(() => {
    const id = data.fullscreenPhotoId;
    if (id != null) {
      const index = photosList.findIndex((photo) => photo.id === id);

      const photo = photosList[index] ?? null;
      setFullscreenIndex(index);
      setFullscreenPhoto(photo);

      setLeftArrow(index > 0);
      setRightArrow(index >= 0 && index + 1 < photosList.length);
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
  }, [data.fullscreenPhotoId, setIsSlideShow]);

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

  const handleRotationRight = useCallback(() => {
    if (fullscreenIndex === null) return;
    let newIndex = fullscreenIndex + 1;
    if (newIndex >= photosList.length && photosList.length > 0) {
      newIndex = 0;
    }
    const nextPhoto = photosList[newIndex];
    if (nextPhoto) {
      handleClick(nextPhoto.id);
    }
  }, [fullscreenIndex, photosList, handleClick]);

  const handleRotationLeft = useCallback(() => {
    if (fullscreenIndex === null) return;
    let newIndex = fullscreenIndex - 1;
    if (newIndex < 0 && photosList.length > 0) {
      newIndex = photosList.length - 1;
    }
    const prevPhoto = photosList[newIndex];
    if (prevPhoto) {
      handleClick(prevPhoto.id);
    }
  }, [fullscreenIndex, photosList, handleClick]);

  useEffect(() => {
    const target = document.getElementsByTagName("body")[0];
    if (!target) return;
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
