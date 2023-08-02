import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Box, Typography } from "@mui/material";

import "../../consts";

import usePhotoLoader from "../../Util/PhotoLoader";
import { useAppContext } from "../AppContext";

import { PhotoInfoProvider } from "./PhotoInfo/PhotoInfoContext";
import MyModal from "./MyModal";
import PhotoGridByYear from "./PhotoGridByYear";

import "../../styles/Body.css";

const Body = () => {
    const { data, setFullscreenPhotoId, setIsSlideShow, desktop } = useAppContext();
    const scrollRef = useRef(null);

    const { hasMorePhotos, loadMorePhotos, photosByEvent, photosList } = usePhotoLoader();

    const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
    const [fullscreenIndex, setFullscreenIndex] = useState(null);
    const [rightArrow, setRightArrow] = useState(null);
    const [leftArrow, setLeftArrow] = useState(null);

    const handleClick = (id) => {
        setFullscreenPhotoId(id);
    };

    useEffect(() => {
        const id = data.fullscreenPhotoId;
        if (id != null) {
            const index = photosList.findIndex(photo => photo.id === id);

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
            setIsSlideShow(false);
            setLeftArrow(false);
            setRightArrow(false);
        }
    }, [data.fullscreenPhotoId, photosList, hasMorePhotos, loadMorePhotos]);

    const handleRotationRight = () => {
        handleClick(photosList[fullscreenIndex + 1].id);
    };

    const handleRotationLeft = () => {
        handleClick(photosList[fullscreenIndex - 1].id);
    };

    useEffect(() => {
        const target = document.getElementsByTagName("body")[0];
        const listener = (e) => {
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
        target.onkeydown = listener;
        return () => {
            target.removeEventListener("onkeydown", listener);
        };
    }, [fullscreenPhoto]);

    return (
        <div className="body" ref={scrollRef}>
            {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
            <InfiniteScroll
                loadMore={loadMorePhotos}
                hasMore={hasMorePhotos()}
                initialLoad={true}
                loader={<Typography variant="h1" key={0}>Loading ...</Typography>}
                useWindow={false}
                getScrollParent={() => scrollRef.current}
            >
                {Array.from(photosByEvent).map(([event, photos]) =>
                    <Box key={event}>
                        {event && <Typography variant="h1">{event}</Typography>}
                        <PhotoGridByYear photos={photos} handleClick={handleClick} />
                    </Box>
                )}
            </InfiniteScroll>
            {!hasMorePhotos() && photosList.length === 0 && <Typography variant="h1">No photo</Typography>}
            {fullscreenPhoto != null && <MyModal photo={fullscreenPhoto}
                handleRotationRight={handleRotationRight}
                handleRotationLeft={handleRotationLeft}
                rightArrow={rightArrow}
                leftArrow={leftArrow}
            />}
        </div>
    );
};

export default Body;
