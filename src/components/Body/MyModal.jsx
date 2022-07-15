import React, {useState} from 'react';
import "../../styles/Body.css"
import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";
import Control from "./Control";

const MyModal = ({photo, setPhoto, handelRotationLeft, handelRotationRight, leftArrow, rightArrow, photoInfo, setPhotoInfo}) => {
    const [isSlideShow, setIsSlideShow] = useState(false);

    const slideShow = () => {
        setIsSlideShow(isSlideShow ^ 1);
    }

    const handelClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setPhoto(null);
            setIsSlideShow(false);
            setPhotoInfo(null);
        }
    }

    return (
        <div className="overlay dismiss" onClick={handelClick}>
            <Control slideShow={slideShow} isSlideShow={isSlideShow} photo={photo} handelClick={handelClick}/>

            {isSlideShow ?
                <Slideshow setIsSlideShow={setIsSlideShow} isSlideshow={isSlideShow} photo={photo} setPhoto={setPhoto}
                           handelRotationRight={handelRotationRight} rightArrow={rightArrow}/> :
                <Lightbox photo={photo} setPhoto={setPhoto} handelRotationRight={handelRotationRight}
                          handelRotationLeft={handelRotationLeft} leftArrow={leftArrow} rightArrow={rightArrow} photoInfo={photoInfo}/>
            }

        </div>
    );
};

export default MyModal;