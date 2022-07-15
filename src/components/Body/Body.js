import React, {useEffect, useContext, useState} from 'react';
import "../../consts"
import PhotoService from "../../API/PhotoService";
import InfiniteScroll from 'react-infinite-scroller';
import "../../styles/Body.css"
import MyModal from "./MyModal";
import {AppContext} from "../AppContext";


const Body = () => {

    const {event, team, person, year, text} = useContext(AppContext);

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
        if (event !== "") {
            response = await PhotoService.getAllWithEvent(year, event.replaceAll(" ", "%20"), page)
        } else if (team !== "") {
            response = await PhotoService.getAllWithTeam(year, team.replaceAll(" ", "%20"), page)
        } else if (person !== "") {
            response = await PhotoService.getAllWithPerson(year, person.replaceAll(" ", "%20"), page)
        } else {
            response = await PhotoService.getAllWithText(text.replaceAll(" ", "%20"));
        }
        setPhotos([...photos, ...response.data.photos.photo.map(photo => {return {url_preview:photo?.url_m, url:photo?.url_l, id:photo?.id, origin:photo?.url_o}})].filter(onlyUnique));
        setPage(page + 1);
        setTotalPages(response.data.photos.pages)
        setTotal(response.data.photos.total)
    }

    async function getTotal() {
        let response;
        if (event !== "") {
            response = await PhotoService.getAllWithEvent(year, event.replaceAll(" ", "%20"), page)
        } else if (team !== "") {
            response = await PhotoService.getAllWithTeam(year, team.replaceAll(" ", "%20"), page)
        } else if (person !== "") {
            response = await PhotoService.getAllWithPerson(year, person.replaceAll(" ", "%20"), page)
        } else {
            response = await PhotoService.getAllWithText(text.replaceAll(" ", "%20"));
        }
        setTotalPages(response.data.photos.pages)
    }

    useEffect(() => {
        if (year !== "") {
            setPhotos([])
            setPage(1)
            if (person !== "" || event !== "" || team !== "") {
                getTotal();
            }
        }
        },
        [year]
    )

    useEffect(() => {
            console.log("total" + person)
            setPhotos([])
            setPage(1)
            getTotal();
        },
        [event, team, person, text]
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
        console.log("lol", response);
        let curInfo = {
            "photographer": response.data.photo.description._content,
            "team": "",
            "event": ""
        };
        if (response.data.photo.tags.tag) {
            let person = [];
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
                    curInfo["event"] += (tag.replaceAll("event$", "")) + ", ";
                }
                if (tag.startsWith("team")) {
                    curInfo["team"] += (tag.replaceAll("team$", "")) + ", ";
                }
                if (tag.startsWith("person")) {
                    person.push({name: tag.replaceAll("person$", "")});
                }
            }
            curInfo["team"] = curInfo["team"].substring(0, curInfo["team"].length - 2);
            curInfo["event"] = curInfo["event"].substring(0, curInfo["event"].length - 2);
            curInfo["person"] = person;
        }

        setPhotoInfo(curInfo);
        console.log(curInfo)
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

    return (
        <div className="body">
            <h1>Year: {year}</h1>
            {event && <h1>Event: {event}</h1>}
            <h1>Total: {total}</h1>
            {text}
            <InfiniteScroll
                loadMore={uploadGallery}
                hasMore={page <= totalPages}
                initialLoad={true}
                loader={<div className="loader" key={0}>Loading ...</div>}
            >
                {photos.map((photo, index) => {
                    return <div style={{display:"contents"}} key={photo?.id + index} className="wrapper-images"><img className="preview" src={photo?.url_preview} alt={photo.url_preview} onClick={() => handelClick(photo, index)}/></div>
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
            />}
        </div>
    );
};

export default Body;