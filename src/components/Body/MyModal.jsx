import React from 'react';
import "../../styles/Body.css"
import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";

const MyModal = ({
                     photo,
                     setPhoto,
                     handelRotationLeft,
                     handelRotationRight,
                     leftArrow,
                     rightArrow,
                     photoInfo,
                     setPhotoInfo,
                     isSlideShow,
                     setIsSlideShow
                 }) => {


    const handelClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setPhoto(null);
            setIsSlideShow(false);
            setPhotoInfo(null);
        }
    }

    return (
        <div className="overlay dismiss" onClick={handelClick}>

            {isSlideShow ?
                <Slideshow setIsSlideShow={setIsSlideShow} isSlideShow={isSlideShow} photo={photo} setPhoto={setPhoto}
                           handelRotationRight={handelRotationRight} rightArrow={rightArrow} setPhotoInfo={setPhotoInfo}/> :
                <Lightbox setIsSlideShow={setIsSlideShow} isSlideShow={isSlideShow} photo={photo} setPhoto={setPhoto}
                          handelRotationRight={handelRotationRight}
                          handelRotationLeft={handelRotationLeft} leftArrow={leftArrow} rightArrow={rightArrow}
                          photoInfo={photoInfo} setPhotoInfo={setPhotoInfo}/>
            }

        </div>
    );
};

export default MyModal;