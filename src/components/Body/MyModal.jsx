import React from 'react';
import "../../styles/Body.css"
import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";
import { useAppContext } from '../AppContext';

const MyModal = ({
    photo,
    handleRotationLeft,
    handleRotationRight,
    leftArrow,
    rightArrow,
    isSlideShow,
    setIsSlideShow
}) => {

    const { setFullscreenPhotoIndex } = useAppContext();

    const handleClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setFullscreenPhotoIndex(null);
        }
    }

    return (
        <div className="overlay dismiss" onClick={handleClick}>
            {isSlideShow
                ? <Slideshow setIsSlideShow={setIsSlideShow} isSlideShow={isSlideShow} photo={photo}
                    handleRotationRight={handleRotationRight} rightArrow={rightArrow} />
                : <Lightbox setIsSlideShow={setIsSlideShow} isSlideShow={isSlideShow} photo={photo}
                    handleRotationRight={handleRotationRight} handleRotationLeft={handleRotationLeft}
                    leftArrow={leftArrow} rightArrow={rightArrow} />}
        </div>
    );
};

export default MyModal;