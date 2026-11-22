import { Typography } from "@mui/material";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { usePhotoLoader } from "@/features/gallery/hooks/usePhotoLoader";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { PhotoModal } from "@/features/viewer/components/PhotoModal";
import type { Photo } from "@/types/gallery";
import { PhotoGallery } from "./PhotoGallery";

import "../styles/GalleryBody.css";

export const GalleryBody: FC = () => {
  const {
    data,
    setFullscreenPhotoId,
    setIsSlideShow,
    desktop,
    mobile,
    setIsOpenMenu,
  } = useGallery();

  const {
    isLoading,
    isPending,
    isError,
    error,
    data: groupedPhotos,
  } = usePhotoLoader();

  const photosList = useMemo(() => {
    const photos: Photo[] = [];
    const seen = new Set<string>();
    for (const group of groupedPhotos ?? []) {
      for (const photo of group.photos) {
        if (!seen.has(photo.id)) {
          seen.add(photo.id);
          photos.push(photo);
        }
      }
    }
    return photos;
  }, [groupedPhotos]);

  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [rightArrow, setRightArrow] = useState(false);
  const [leftArrow, setLeftArrow] = useState(false);

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

  useEffect(() => {
    if (!mobile) return;
    const bodyElement = document.querySelector(".body");
    if (!bodyElement) return;
    const handleScroll = () => setIsOpenMenu(false);
    bodyElement.addEventListener("scroll", handleScroll);
    return () => {
      bodyElement.removeEventListener("scroll", handleScroll);
    };
  }, [mobile, setIsOpenMenu]);

  const handleRotationRight = useCallback(() => {
    if (fullscreenIndex === null || photosList.length === 0) return;
    const newIndex =
      fullscreenIndex + 1 >= photosList.length ? 0 : fullscreenIndex + 1;
    const nextPhoto = photosList[newIndex];
    if (nextPhoto) handleClick(nextPhoto.id);
  }, [fullscreenIndex, photosList, handleClick]);

  const handleRotationLeft = useCallback(() => {
    if (fullscreenIndex === null || photosList.length === 0) return;
    const newIndex =
      fullscreenIndex - 1 < 0 ? photosList.length - 1 : fullscreenIndex - 1;
    const prevPhoto = photosList[newIndex];
    if (prevPhoto) handleClick(prevPhoto.id);
  }, [fullscreenIndex, photosList, handleClick]);

  useEffect(() => {
    const target = document.getElementsByTagName("body")[0];
    if (!target) return;
    const listener = (e: KeyboardEvent) => {
      if (fullscreenPhoto) {
        switch (e.key) {
          case "ArrowLeft":
            if (leftArrow) handleRotationLeft();
            break;
          case "ArrowRight":
            if (rightArrow) handleRotationRight();
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
        <PhotoModal
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
