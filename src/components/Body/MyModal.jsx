import { useAppContext } from "../AppContext";

import Lightbox from "./Lightbox";
import Slideshow from "./Slideshow";

import "../../styles/Body.css";

const MyModal = ({
    photo,
    handleRotationLeft,
    handleRotationRight,
    leftArrow,
    rightArrow
}) => {
    const { setFullscreenPhotoId, isSlideShow } = useAppContext();

    const handleClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setFullscreenPhotoId(null);
        }
    };

    return (
        <div className="overlay dismiss" onClick={handleClick}>
            {isSlideShow
                ? <Slideshow photo={photo} handleRotationRight={handleRotationRight} />
                : <Lightbox photo={photo} handleRotationRight={handleRotationRight} handleRotationLeft={handleRotationLeft}
                    leftArrow={leftArrow} rightArrow={rightArrow} />}
        </div>
    );
};

export default MyModal;
