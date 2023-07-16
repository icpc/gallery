import React, { useEffect, useState, useRef } from 'react';
import "../../styles/Body.css"
import PhotoInfo from "./PhotoInfo";
import FaceDiv from "./FaceDiv";
import Control from "./Control";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PhotoParser from '../../Util/PhotoParser';
import { IconButton } from '@mui/material';
import styled from 'styled-components';

const Lightbox = ({
    isSlideShow,
    setIsSlideShow,
    photo,
    handelRotationLeft,
    handelRotationRight,
    leftArrow,
    rightArrow
}) => {
    const [photoInfo, setPhotoInfo] = useState(null);

    useEffect(() => {
        PhotoParser.getPhotoInfo(photo.id, setPhotoInfo);
    }, [photo.id]);

    const [face, setFace] = useState(null);
    const imgRef = useRef(null);

    const Faces = styled.div`
        width: ${imgRef?.current?.width}px;
        height: ${imgRef?.current?.height}px;
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
                <Faces>
                    {photoInfo?.person?.map(person => (<FaceDiv imgRef={imgRef} person={person} face={face} setFace={setFace} key={person.name + "facediv" + person.position.top} />))}
                </Faces>
            </div>
            <Control isSlideShow={isSlideShow} setIsSlideShow={setIsSlideShow} />
            <PhotoInfo photo={photo} photoInfo={photoInfo} setFace={setFace} />
            {leftArrow && <div className="overlay-arrows_left">
                <IconButton onClick={handelRotationLeft}>
                    <ArrowForwardIosIcon className="icon-button" style={{ transform: "scale(-1, 1)" }} />
                </IconButton>
            </div>
            }
            {rightArrow && <div className="overlay-arrows_right">
                <IconButton onClick={handelRotationRight}>
                    <ArrowForwardIosIcon className="icon-button" />
                </IconButton>
            </div>}
        </div>
    );
};

export default Lightbox;