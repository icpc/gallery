import React from 'react';
import "../../styles/Body.css"
import Control from "./Control";

const Slideshow = ({ isSlideShow, setIsSlideShow, photo, handleRotationRight, rightArrow }) => {
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
                    handleRotationRight()
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

    return (
        <div className="dismiss">
            <div className="wrapper">
                <Control isSlideShow={isSlideShow} setIsSlideShow={setIsSlideShow} />
                <div className="img-container">
                    <img className="full" src={photo.url} alt={"fullsize"} />
                </div>
            </div>
        </div>
    );
};

export default Slideshow;