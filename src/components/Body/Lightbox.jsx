import React, {useState} from 'react';
import "../../styles/Body.css"
import PhotoInfo from "./PhotoInfo";
import FaceDiv from "./FaceDiv";
import Control from "./Control";
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
                      photoInfo
                  }) => {
    const handelClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setPhoto(null);
        }
    }

    const [isLoaded, setIsLoaded] = useState(false);


    const slideShow = () => {
        setIsSlideShow(isSlideShow ^ 1);
    }

    const [face, setFace] = useState(null);

    return (
        <div className="dismiss" onClick={handelClick}>
            <div className="wrapper">
                <Control handelClick={handelClick} slideShow={slideShow} isSlideShow={isSlideShow}/>
                <img
                    className="full"
                    src={photo.url}
                    alt={"bigger picture"}
                    onLoad={() => setIsLoaded(true)}
                />
                <PhotoInfo photo={photo} photoInfo={photoInfo} setFace={setFace}/>
                {photoInfo?.person?.map(person => (<FaceDiv person={person} face={face} setFace={setFace} key={person.name + "facediv" + person.position.top}/>))}
                {leftArrow && <div onClick={handelRotationLeft} className="overlay-arrows_left">
                    <ArrowForwardIosIcon style={{transform: "rotate(180deg)"}}/>
                </div>}
                {rightArrow && <div onClick={handelRotationRight} className="overlay-arrows_right">
                    <ArrowForwardIosIcon/>
                </div>}
            </div>


        </div>
    );
};

export default Lightbox;