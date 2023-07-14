import React, { useContext, useEffect, useState, useRef } from 'react';
import "../../consts"
import InfiniteScroll from 'react-infinite-scroller';
import "../../styles/Body.css"
import "../../styles/App.css"
import MyModal from "./MyModal";
import { AppContext } from "../AppContext";
import PhotoParser from "../../Util/PhotoParser";
import useMediaQuery from '@mui/material/useMediaQuery';
import usePhotoLoader from './PhotoLoader';

const Body = () => {
    const { data } = useContext(AppContext);
    const [isSlideShow, setIsSlideShow] = useState(false);
    const scrollRef = useRef(null);

    const { hasMorePhotos, loadMorePhotos, photosByEvent, photosList } = usePhotoLoader();
    const [photoInfo, setPhotoInfo] = useState(null);

    const desktop = useMediaQuery('(min-width: 900px)');

    const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);
    const [rightArrow, setRightArrow] = useState(null);
    const [leftArrow, setLeftArrow] = useState(null);

    const handelClick = (photo, index) => {
        PhotoParser.getPhotoInfo(photo.id, setPhotoInfo);
        setCurrentIndex(index);
        setFullscreenPhoto(photo);
        setLeftArrow(null);
        setRightArrow(null);
        if (index + 1 < photosList.length || hasMorePhotos()) {
            setRightArrow(true);
        }
        if (index !== 0) {
            setLeftArrow(true);
        }
        // Load more photos for future
        if (currentIndex + 4 >= photosList.length && hasMorePhotos()) {
            loadMorePhotos();
        }
    };

    const handelRotationRight = () => {
        handelClick(photosList[currentIndex + 1], currentIndex + 1);
    }

    const handelRotationLeft = () => {
        handelClick(photosList[currentIndex - 1], currentIndex - 1);
    }

    useEffect(() => {
        const target = document.getElementsByTagName("body")[0];
        const listener = (e) => {
            if (fullscreenPhoto) {
                switch (e.key) {
                    case "ArrowLeft":
                        if (leftArrow) {
                            handelRotationLeft();
                        }
                        break;
                    case "ArrowRight":
                        if (rightArrow) {
                            handelRotationRight()
                        }
                        break;
                    case "Escape":
                        setFullscreenPhoto(null);
                        setIsSlideShow(false);
                        setPhotoInfo(null);
                        break;
                    default:
                        break;
                }
            }
        };
        target.onkeydown = listener;
        return () => {
            target.removeEventListener("onkeydown", listener);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullscreenPhoto]);

    function renderEvent(event, photos) {
        return (
            <div key={event}>
                <h1 className="event-title">{event}</h1>
                <div className="masonry">
                    {photos.map((photo) => {
                        let index = photosList.indexOf(photo)
                        return <figure key={photo?.id + index} className="masonry-brick">
                            <img className="preview"
                                src={photo?.url_preview}
                                alt={photo.url_preview}
                                onClick={() => handelClick(photo, index)} />
                        </figure>
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="body" ref={scrollRef}>
            {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
            <div style={{ paddingBottom: "10px", width: "100%" }}>
                <InfiniteScroll
                    loadMore={loadMorePhotos}
                    hasMore={hasMorePhotos()}
                    initialLoad={true}
                    loader={<div className="photo-list-message" key={0}>Loading ...</div>}
                    useWindow={false}
                    getScrollParent={() => scrollRef.current}
                >
                    {Array.from(photosByEvent).map(([event, photos]) => {
                        return renderEvent(event, photos);
                    })}
                </InfiniteScroll>
            </div>
            {(!hasMorePhotos() && photosList.length === 0) && <div className="photo-list-message">No photo</div>}
            {fullscreenPhoto && <MyModal photo={fullscreenPhoto}
                handelRotationRight={handelRotationRight}
                handelRotationLeft={handelRotationLeft}
                setPhoto={setFullscreenPhoto}
                rightArrow={rightArrow}
                leftArrow={leftArrow}
                photoInfo={photoInfo}
                setPhotoInfo={setPhotoInfo}
                isSlideShow={isSlideShow}
                setIsSlideShow={setIsSlideShow}
            />}
        </div>
    );
};

export default Body;