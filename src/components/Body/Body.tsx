import { FC, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";

import { Box, Typography } from "@mui/material";

import usePhotoLoader from "../../Util/PhotoLoader";
import "../../consts";
import { Photo } from "../../types";
import { useAppContext } from "../AppContext";

import MyModal from "./MyModal";
import PhotoGridByYear from "./PhotoGridByYear";

import "../../styles/Body.css";

const Body: FC = () => {
  const { data, setFullscreenPhotoId, setIsSlideShow, desktop } =
    useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { hasMorePhotos, loadMorePhotos, photosByEvent, photosList } =
    usePhotoLoader();

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

      if (index === -1 && hasMorePhotos()) {
        loadMorePhotos();
        return;
      }

      const photo = photosList[index];
      setFullscreenIndex(index);
      setFullscreenPhoto(photo);

      setLeftArrow(index !== 0);
      setRightArrow(index + 1 < photosList.length || hasMorePhotos());

      if (photosList.length <= index + 4 && hasMorePhotos()) {
        loadMorePhotos();
      }
    } else {
      setFullscreenIndex(null);
      setFullscreenPhoto(null);
      setLeftArrow(false);
      setRightArrow(false);
    }
  }, [data.fullscreenPhotoId, photosList, hasMorePhotos, loadMorePhotos]);

  useEffect(() => {
    if (data.fullscreenPhotoId === null) {
      setIsSlideShow(false);
    }
  }, [data.fullscreenPhotoId]);

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

  return (
    <div className="body" ref={scrollRef}>
      {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
      <InfiniteScroll
        loadMore={loadMorePhotos}
        hasMore={hasMorePhotos()}
        initialLoad={true}
        loader={
          <Typography variant="h1" key={0}>
            Loading ...
          </Typography>
        }
        useWindow={false}
        getScrollParent={() => scrollRef.current}
      >
        {Array.from(photosByEvent).map(([event, photos]) => (
          <Box key={event}>
            {event && <Typography variant="h1">{event}</Typography>}
            <PhotoGridByYear photos={photos} handleClick={handleClick} />
          </Box>
        ))}
      </InfiniteScroll>
      {!hasMorePhotos() && photosList.length === 0 && (
        <Typography variant="h1">No photo</Typography>
      )}
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
