import React, {useContext, useEffect, useState} from 'react';
import "../../consts"
import PhotoService from "../../Util/PhotoService";
import InfiniteScroll from 'react-infinite-scroller';
import "../../styles/Body.css"
import MyModal from "./MyModal";
import {AppContext} from "../AppContext";
import PhotoParser from "../../Util/PhotoParser";


const Body = () => {

    const {data} = useContext(AppContext);
    const [isSlideShow, setIsSlideShow] = useState(false);

    const [photos, setPhotos] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(1);
    const [photoInfo, setPhotoInfo] = useState(null);

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    async function uploadGallery() {
        let response;
        if (data?.event !== undefined) {
            response = await PhotoService.getAllWithEvent(data.year, data.event.replaceAll(" ", "%20"), page)
        } else if (data?.team !== undefined) {
            response = await PhotoService.getAllWithTeam(data.year, data.team.replaceAll(" ", "%20"), page)
        } else if (data?.person !== undefined) {
            response = await PhotoService.getAllWithPerson(data.year, data.person.replaceAll(" ", "%20"), page)
        } else if (data?.text !== undefined) {
            response = await PhotoService.getAllWithText(data.text.replaceAll(" ", "%20"), page);
        }
        if (response) {
            setPhotos([...photos, ...response.data.photos.photo.map(photo => {
                return {url_preview: photo?.url_m, url: photo?.url_l, id: photo?.id, origin: photo?.url_o}
            })].filter(onlyUnique));
            setPage(page + 1);
            setTotalPages(response.data.photos.pages)
            setTotal(response.data.photos.total)
        }
    }

    async function getTotal() {
        let response;
        if (data?.event !== undefined) {
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
                setPhotos([])
                setPage(1)
                if (data.person !== undefined || data.event !== undefined || data.team !== undefined) {
                    getTotal();
                }
            }
        },
        [data.year]
    )

    useEffect(() => {
            setPhotos([])
            setPage(1)
            getTotal();
        },
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
        if (index + 3 >= photos.length - 1 && photos.length !== total) {
            uploadGallery();
        }
        setLeftArrow(null);
        setRightArrow(null);
        if (total !== index + 1) {
            setRightArrow(true);
        }
        if (index !== 0) {
            setLeftArrow(true);
        }
    };


    const handelRotationRight = () => {
        handelClick(photos[currentIndex + 1], currentIndex + 1);
    }

    const handelRotationLeft = () => {
        handelClick(photos[currentIndex - 1], currentIndex - 1);
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
                }
            }
        };
        target.onkeydown = listener;
        return () => {
            target.removeEventListener("onkeydown", listener);
        }
    }, [shown]);

    const getMore = () => {
        return page <= totalPages
    }

    return (
        <div className="body">
            {data.text && <h1 style={{width: "100%"}}>{data.text}</h1>}
            <div style={{paddingBottom: "10px", width: "100%"}}>
                <InfiniteScroll
                    className="masonry"
                    loadMore={uploadGallery}
                    hasMore={getMore()}
                    initialLoad={true}
                    loader={<div className="loader" key={0}>Loading ...</div>}
                    useWindow={false}
                >
                    {photos.map((photo, index) => {
                        return <figure key={photo?.id + index} className="masonry-brick">
                            <img className="preview"
                                 src={photo?.url_preview}
                                 alt={photo.url_preview}
                                 onClick={() => handelClick(photo, index)}/>
                        </figure>
                    })}
                </InfiniteScroll>
            </div>
            {total === 0 && <div style={{margin: "auto", fontSize: "3rem"}}>No photo</div>}
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