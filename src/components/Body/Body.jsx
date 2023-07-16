import React, { useEffect, useState, useRef } from 'react';
import "../../consts"
import InfiniteScroll from 'react-infinite-scroller';
import "../../styles/Body.css"
import "../../styles/App.css"
import MyModal from "./MyModal";
import { useAppContext } from "../AppContext";
import useMediaQuery from '@mui/material/useMediaQuery';
import usePhotoLoader from '../../Util/PhotoLoader';

const Body = () => {
    const { data, setFullscreenPhotoId } = useAppContext();
    const [isSlideShow, setIsSlideShow] = useState(false);
    const scrollRef = useRef(null);

    const { hasMorePhotos, loadMorePhotos, photosByEvent, photosList } = usePhotoLoader();

    const desktop = useMediaQuery('(min-width: 900px)');

    const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
    const [fullscreenIndex, setFullscreenIndex] = useState(null);
    const [rightArrow, setRightArrow] = useState(null);
    const [leftArrow, setLeftArrow] = useState(null);

    const handleClick = (_, index) => {
        const photo = photosList[index];
        setFullscreenPhotoId(photo.id);
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
        handleClick(photosList[fullscreenIndex + 1], fullscreenIndex + 1);
    }

    const handleRotationLeft = () => {
        handleClick(photosList[fullscreenIndex - 1], fullscreenIndex - 1);
    }

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
                            handleRotationRight()
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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullscreenPhoto]);

    function groupPhotosByYear(photos) {
        const photosByYear = {};
        photos.forEach((photo) => {
            if (!photosByYear[photo.year]) {
                photosByYear[photo.year] = [];
            }
            photosByYear[photo.year].push(photo);
        });
        return photosByYear;
    }

    function putPhotosInMasonry(photos) {
        return (
            <div className="masonry">
                {photos.map((photo) => {
                    let index = photosList.indexOf(photo);
                    return (
                        <figure key={photo.id} className="masonry-brick">
                            <img
                                className="preview"
                                src={photo?.url_preview}
                                alt={photo.url_preview}
                                onClick={() => handleClick(photo, index)}
                            />
                        </figure>
                    );
                })}
            </div>
        )
    }

    function renderPhotos(photos) {
        const photosByYear = groupPhotosByYear(photos);

        if (Object.keys(photosByYear).length < 2) {
            return (putPhotosInMasonry(photos));
        }

        return (
            <div>
                {Object.entries(photosByYear).sort().reverse().map(([year, photos]) => (
                    <div key={year}>
                        <h2 className="event-title">{year}</h2>
                        {putPhotosInMasonry(photos)}
                    </div>
                ))}
            </div>
        );
    }

    function renderEvent(event, photos) {
        return (
            <div key={event}>
                {event && <h1 className="event-title">{event}</h1>}
                {renderPhotos(photos)}
            </div>
        );
    }

    return (
        <div className="body" ref={scrollRef}>
            {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
            <div >
                <InfiniteScroll
                    style={{ paddingBottom: "10px", width: "100%" }}
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
            {fullscreenPhoto != null && <MyModal photo={fullscreenPhoto}
                handleRotationRight={handleRotationRight}
                handleRotationLeft={handleRotationLeft}
                rightArrow={rightArrow}
                leftArrow={leftArrow}
                isSlideShow={isSlideShow}
                setIsSlideShow={setIsSlideShow}
            />}
        </div>
    );
};

export default Body;