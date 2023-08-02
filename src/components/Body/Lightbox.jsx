import { useEffect, useRef, useState } from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton } from "@mui/material";
import styled from "styled-components";

import { ParsePhotoInfo } from "../../Util/PhotoParser";
import PhotoService from "../../Util/PhotoService";

import Control from "./Control";
import FaceDiv from "./FaceDiv";
import PhotoInfo from "./PhotoInfo";

import "../../styles/Body.css";

const Lightbox = ({
    photo,
    handleRotationLeft,
    handleRotationRight,
    leftArrow,
    rightArrow
}) => {
    const [photoInfo, setPhotoInfo] = useState(null);

    useEffect(() => {
        PhotoService.getPhotoInfo(photo.id)
            .then(response => {
                const tags = response.data.photo.tags.tag?.map(tag => tag.raw);
                const description = response.data.photo.description._content;
                const newPhotoInfo = ParsePhotoInfo(tags, description);
                setPhotoInfo(newPhotoInfo);
            }
            );
    }, [photo.id]);

    const [face, setFace] = useState(null);
    const imgRef = useRef(null);

    const aspectRatio = (imgRef) => imgRef?.current?.naturalWidth / imgRef?.current?.naturalHeight;

    const FacesWrapper = styled.div`
        width: ${aspectRatio(imgRef) * imgRef?.current?.height}px;
        height: ${imgRef?.current?.height}px;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
        position: absolute;
    `;

    return (
        <div className="wrapper">
            <div className="img-container">
                <img
                    ref={imgRef}
                    className="full"
                    src={photo.url}
                    alt={"fullsize"}
                />
            </div>
            <FacesWrapper>
                {photoInfo?.person?.map(person =>
                    (<FaceDiv person={person}
                        face={face} setFace={setFace}
                        key={person.name + "facediv" + person.position.top} />))}
            </FacesWrapper>
            <Control />
            <PhotoInfo photo={photo} photoInfo={photoInfo} setFace={setFace} />
            {leftArrow && <div className="overlay-arrows_left">
                <IconButton onClick={handleRotationLeft}>
                    <ArrowForwardIosIcon className="icon-button" style={{ transform: "scale(-1, 1)" }} />
                </IconButton>
            </div>}
            {rightArrow && <div className="overlay-arrows_right">
                <IconButton onClick={handleRotationRight}>
                    <ArrowForwardIosIcon className="icon-button" />
                </IconButton>
            </div>}
        </div>
    );
};

export default Lightbox;
