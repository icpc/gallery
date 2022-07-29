import React, {useEffect, useContext, useState} from 'react';
import "../../consts"
import PhotoService from "../../API/PhotoService";
import InfiniteScroll from 'react-infinite-scroller';
import "../../styles/Body.css"
import MyModal from "./MyModal";
import {AppContext} from "../AppContext";


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

    const MAX = 65535;


    function convertRel(text) {
        return convertNum(text) / MAX;
    }

    function getPosition (position) {
        return {
            left: convertRel(position.substr(0,4)),
            top : convertRel(position.substr(4,4)),
            right: convertRel(position.substr(8,4)),
            bottom: convertRel(position.substr(12,4)),
        }
    }

    function convertNum(text) {
        return parseInt("0x"+text);
    }

    async function getPhotoInfo(id) {
        let response = await PhotoService.getPhotoInfo(id);
        let curInfo = {
            "photographer": response.data.photo.description._content,
        };
        if (response.data.photo.tags.tag) {
            let person = [], team = [], event = [];
            for (let i = 0; i < response.data.photo.tags.tag.length; i++) {
                if (response.data.photo.tags.tag[i] === null) {
                    continue;
                }
                let tag = response.data.photo.tags.tag[i].raw;
                if (tag.indexOf('(') !== -1) {
                    const name = tag.substr(0,tag.indexOf('('));
                    if (name === "") {
                        continue;
                    }
                    person.push({name: name, position: getPosition(tag.substr(tag.indexOf('(') + 1,tag.indexOf(')',tag.indexOf('(')) - tag.indexOf('(') - 1))});
                }
                if (tag.startsWith("event")) {
                    event.push(tag.replaceAll("event$", ""));
                }
                if (tag.startsWith("team")) {
                    team.push(tag.replaceAll("team$", ""));
                }
                if (tag.startsWith("person")) {
                    person.push({name: tag.replaceAll("person$", "")});
                }
            }
            curInfo["team"] = team;
            curInfo["event"] = event;
            curInfo["person"] = person;
        }

        setPhotoInfo(curInfo);

    }

    const handelClick = (photo, index) => {
        getPhotoInfo(photo.id)
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
    return (
        <div className="body">
            {data.year && <h1>Year: {data.year}</h1>}
            {data.event && <h1>Event: {data.event}</h1>}
            {data.person && <h1>Person: {data.person}</h1>}
            {data.team && <h1>Team: {data.team}</h1>}
            <h1>(total: {total})</h1>
            {data.text && <h1>{data.text}</h1>}
                <InfiniteScroll
                    className="masonry"
                    loadMore={uploadGallery}
                    hasMore={page <= totalPages}
                    initialLoad={true}
                    loader={<div className="loader" key={0}>Loading ...</div>}
                >
                    {photos.map((photo, index) => {
                        return <figure key={photo?.id + index} className="masonry-brick"><img className="preview" src={photo?.url_preview} alt={photo.url_preview} onClick={() => handelClick(photo, index)}/></figure>
                    })}
                </InfiniteScroll>
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