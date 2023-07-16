import React, { useEffect, useState } from 'react';
import "../../styles/Body.css"
import PhotoInfo from "./PhotoInfo";
import FaceDiv from "./FaceDiv";
import Control from "./Control";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PhotoParser from '../../Util/PhotoParser';
import { IconButton } from '@mui/material';

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

    // eslint-disable-next-line no-unused-vars
    const [isLoaded, setIsLoaded] = useState(false);


    const [face, setFace] = useState(null);

    return (
        <div className="wrapper">
            <div>
                <img
                    className="full"
                    src={photo.url}
                    alt={"fullsize"}
                    onLoad={() => setIsLoaded(true)}
                />
                {photoInfo?.person?.map(person => (<FaceDiv person={person} face={face} setFace={setFace} key={person.name + "facediv" + person.position.top} />))}
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