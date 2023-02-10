import React, { useContext, useEffect, useState, useRef } from 'react';
import "../../consts"
import PhotoService from "../../Util/PhotoService";
import InfiniteScroll from 'react-infinite-scroller';
import "../../styles/Body.css"
import "../../styles/App.css"
import MyModal from "./MyModal";
import { AppContext } from "../AppContext";
import PhotoParser from "../../Util/PhotoParser";
import useMediaQuery from '@mui/material/useMediaQuery';


const Body = () => {

    const { data } = useContext(AppContext);
    const [isSlideShow, setIsSlideShow] = useState(false);
    const scrollRef = useRef(null);

    const [photosByEvent, setPhotosByEvent] = useState(new Map());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(1);
    const [photoInfo, setPhotoInfo] = useState(null);
    const [internalEvent, setInternalEvent] = useState(undefined);

    const desktop = useMediaQuery('(min-width: 900px)');

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    const appendPhotos = (event, photos) => {
        setPhotosByEvent(new Map(photosByEvent.set(event, [...(photosByEvent.get(event) || []), ...photos].filter(onlyUnique))));
    };

    const listPhotos = () => {
        return [].concat(...Array.from(photosByEvent.values()));
    }

    const getNextEvent = (currentEvent) => {
        const events = data?.events;
        if (currentEvent === undefined || events === undefined)
            return null;
        const index = events.findIndex(event => event === currentEvent);
        if (index !== -1 && index + 1 < events.length) {
            return events[index + 1];
        }
        return null;
    }

    async function uploadGallery() {
        let response;
        if (internalEvent !== undefined) {
            response = await PhotoService.getAllWithEvent(data.year, internalEvent.replaceAll(" ", "%20"), page)
        } else if (data?.team !== undefined) {
            response = await PhotoService.getAllWithTeam(data.year, data.team.replaceAll(" ", "%20"), page)
        } else if (data?.person !== undefined) {
            response = await PhotoService.getAllWithPerson(data.year, data.person.replaceAll(" ", "%20"), page)
        } else if (data?.text !== undefined) {
            response = await PhotoService.getAllWithText(data.text.replaceAll(" ", "%20"), page);
        }

        if (response) {
            if (page > response.data.photos.pages && getNextEvent(internalEvent) !== null) {
                setPage(1);
                setInternalEvent(getNextEvent(internalEvent));
                return;
            }
            appendPhotos(internalEvent, [...response.data.photos.photo.map(photo => {
                if (photo?.url_l !== undefined) {
                    return { url_preview: photo?.url_m, url: photo?.url_l, id: photo?.id, origin: photo?.url_o }
                } else {
                    return { url_preview: photo?.url_m, url: photo?.url_o, id: photo?.id, origin: photo?.url_o }
                }
            })]);
            setTotalPages(response.data.photos.pages)
            setTotal(response.data.photos.total)
            setPage(page + 1);
        }
    }

    async function getTotal() {
        let response;
        if (internalEvent !== undefined) {
            response = await PhotoService.getAllWithEvent(data.year, data.event.replaceAll(" ", "%20"), page)
        } else if (data?.team !== undefined) {
            response = await PhotoService.getAllWithTeam(data.year, data.team.replaceAll(" ", "%20"), page)
        } else if (data?.person !== undefined) {
            response = await PhotoService.getAllWithPerson(data.year, data.person.replaceAll(" ", "%20"), page)
        } else if (data?.text !== undefined) {
            response = await PhotoService.getAllWithText(data.text.replaceAll(" ", "%20"), page);
        } else {
            return;
        }
        setTotalPages(response.data.photos.pages)
    }

    useEffect(() => {
        if (data?.year !== undefined) {
            setPhotosByEvent(new Map())
            setPage(1)
            if (data.person !== undefined || internalEvent !== undefined || data.team !== undefined || data.text !== undefined) {
                getTotal();
            }
        }
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data.year]
    )

    useEffect(() => {
        setPhotosByEvent(new Map())
        setPage(1)
        setInternalEvent(data.event)
        getTotal();
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data.event, data.text, data.team, data.person]
    )

    const [shown, setShown] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);
    const [rightArrow, setRightArrow] = useState(null);
    const [leftArrow, setLeftArrow] = useState(null);

    const handelClick = (photo, index) => {
        PhotoParser.getPhotoInfo(photo.id, setPhotoInfo)
        setCurrentIndex(index);
        setShown(photo);
        if (index + 3 >= listPhotos.length - 1 && hasMore()) {
            uploadGallery();
        }
        setLeftArrow(null);
        setRightArrow(null);
        if (hasMore()) {
            setRightArrow(true);
        }
        if (index !== 0) {
            setLeftArrow(true);
        }
    };


    const handelRotationRight = () => {
        handelClick(listPhotos[currentIndex + 1], currentIndex + 1);
    }

    const handelRotationLeft = () => {
        handelClick(listPhotos[currentIndex - 1], currentIndex - 1);
    }

    useEffect(() => {
        const target = document.getElementsByTagName("body")[0];
        const listener = (e) => {
            if (shown) {
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
                        setShown(null);
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
    }, [shown]);

    const hasMore = () => {
        return page <= totalPages || getNextEvent(internalEvent) !== null
    }

    return (
        <div className="body" ref={scrollRef}>
            {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
            <div style={{ paddingBottom: "10px", width: "100%" }}>
                <InfiniteScroll
                    loadMore={uploadGallery}
                    hasMore={hasMore()}
                    initialLoad={true}
                    loader={<div className="loader" key={0}>Loading ...</div>}
                    useWindow={false}
                    getScrollParent={() => scrollRef.current}
                >
                    {Array.from(photosByEvent).map(([event, photos]) => {
                        return <div key={event}>
                            {/**
                              * @todo Move this into CSS.
                              */}
                            <h1 style={{ marginTop: "0.83em", marginBottom: "0.83em" }}>{event}</h1>
                            <div className="masonry">
                                {photos.map((photo, index) => {
                                    return <figure key={photo?.id + index} className="masonry-brick">
                                        <img className="preview"
                                            src={photo?.url_preview}
                                            alt={photo.url_preview}
                                            onClick={() => handelClick(photo, index)} />
                                    </figure>
                                })}
                            </div>
                        </div>
                    })}
                </InfiniteScroll>
            </div>
            {total === 0 && <div style={{ margin: "auto", fontSize: "3rem" }}>No photo</div>}
            {shown && <MyModal photo={shown}
                handelRotationRight={handelRotationRight}
                handelRotationLeft={handelRotationLeft}
                setPhoto={setShown}
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