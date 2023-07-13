import React, {useState} from 'react';
import "../../styles/Body.css"
import SlideShowControl from "./SlideShowControl";

const Slideshow = ({setIsSlideShow, isSlideShow, photo, setPhoto, handelRotationRight, rightArrow, setPhotoInfo}) => {
    const handelClick = (e) => {
        if (e.target.classList.contains("dismiss")) {
            setPhoto(null);
            setIsSlideShow(false);
        }
    }

    // eslint-disable-next-line no-unused-vars
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
            () => {
                if (rightArrow) {
                    handelRotationRight()
                } else {
                    setIsSlideShow(false);
                }
            },
            3000
        );

        return () => {
            resetTimeout();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photo]);

    const slideShow = () => {
        setIsSlideShow(isSlideShow ^ 1);
    }

    return (
        <div className="dismiss" onClick={handelClick}>
            <div className="wrapper">
                <SlideShowControl handelClick={handelClick}
                         slideShow={slideShow}
                         isSlideShow={isSlideShow}
                         setPhoto={setPhoto}
                         setIsSlideShow={setIsSlideShow}
                         setPhotoInfo={setPhotoInfo}/>
                <img
                    className="full"
                    src={photo.url}
                    alt={"fullsize"}
                    onLoad={() => setIsLoaded(true)}
                />
            </div>
        </div>
    );
};

export default Slideshow;