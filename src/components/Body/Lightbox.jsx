import React, { useState } from 'react';
import "../../styles/Body.css"
import PhotoInfo from "./PhotoInfo";
import FaceDiv from "./FaceDiv";
import Control from "./SlideShowControl";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Lightbox = ({
    isSlideShow,
    setIsSlideShow,
    photo,
    setPhoto,
    handelRotationLeft,
    handelRotationRight,
    leftArrow,
    rightArrow,
    photoInfo,
    setPhotoInfo
}) => {
    const handelClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setPhoto(null);
        }
    }

    // eslint-disable-next-line no-unused-vars
    const [isLoaded, setIsLoaded] = useState(false);


    const slideShow = () => {
        setIsSlideShow(isSlideShow ^ 1);
    }

    const [face, setFace] = useState(null);


    const [touchPosition, setTouchPosition] = useState(null)

    const handleTouchStart = (e) => {
        const touchDown = e.touches[0].clientX
        setTouchPosition(touchDown)
    }

    const handleTouchMove = (e) => {
        const touchDown = touchPosition

        if (touchDown === null) {
            return
        }

        const currentTouch = e.touches[0].clientX
        const diff = touchDown - currentTouch

        if (diff > 5 && rightArrow) {
            handelRotationRight()
        }

        if (diff < -5 && leftArrow) {
            handelRotationLeft()
        }

        setTouchPosition(null)
    }
    return (
        <div className="dismiss" onClick={handelClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
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
                <Control handelClick={handelClick} slideShow={slideShow} isSlideShow={isSlideShow}
                    setPhoto={setPhoto}
                    setIsSlideShow={setIsSlideShow}
                    setPhotoInfo={setPhotoInfo} />
                <PhotoInfo photo={photo} photoInfo={photoInfo} setFace={setFace} />
                {leftArrow && <div onClick={handelRotationLeft} className="overlay-arrows_left">
                    <ArrowForwardIosIcon style={{ transform: "rotate(180deg)" }} />
                </div>}
                {rightArrow && <div onClick={handelRotationRight} className="overlay-arrows_right">
                    <ArrowForwardIosIcon />
                </div>}
            </div>


        </div>
    );
};

export default Lightbox;