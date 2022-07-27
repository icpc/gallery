import React, {createRef, useEffect, useMemo, useRef, useState} from 'react';
import "../../styles/Body.css"
import PhotoInfo from "./PhotoInfo";
import FaceDiv from "./FaceDiv";


const Lightbox = ({photo, setPhoto, handelRotationLeft, handelRotationRight, leftArrow, rightArrow, photoInfo}) => {
    const handelClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setPhoto(null);
        }
    }

    const [isLoaded, setIsLoaded] = useState(false);




    const [face, setFace] = useState(null);

    return (
        <div className="dismiss" onClick={handelClick}>
            <div className="wrapper">
                <img
                    className="full"
                    src={photo.url}
                    alt={"bigger picture"}
                    onLoad={() => setIsLoaded(true)}
                />
                <PhotoInfo photoInfo={photoInfo} setFace={setFace}/>
                {photoInfo?.person?.map(person => (<FaceDiv person={person} face={face} setFace={setFace}/>))}
            </div>

            {leftArrow && <div onClick={handelRotationLeft} className="overlay-arrows_left"> <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white"
                     className="bi bi-chevron-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd"
                          d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                </svg>
            </div></div>}
            {rightArrow && <div onClick={handelRotationRight} className="overlay-arrows_right">  <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white"
                     className="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd"
                          d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            </div></div>}
        </div>
    );
};

export default Lightbox;