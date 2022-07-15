import React, {useEffect, useState} from 'react';
import "../../styles/Body.css"


const Slideshow = ({setIsSlideShow, isSlideshow, photo, setPhoto, handelRotationRight, rightArrow}) => {
    const handelClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setPhoto(null);
            setIsSlideShow(false);
        }
    }

    const [isLoaded, setIsLoaded] = useState(null);

    const timeoutRef = React.useRef(null);

    function resetTimeout() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    React.useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(
            () =>
            {if (rightArrow) {
                handelRotationRight()}
                else {
                    setIsSlideShow(false);
            }
            },
            3000
        );

        return () => {
            resetTimeout();
        };
    }, [photo]);

    return (
        <div className="dismiss" onClick={handelClick}>
            <img
                className="full"
                src={photo.url}
                alt={"bigger picture"}
                onLoad={() => setIsLoaded(true)}
            />

        </div>
    );
};

export default Slideshow;