import React from "react";

import { useAppContext } from "../AppContext";

import Control from "./Control";

import "../../styles/Body.css";

const Slideshow = ({ photo, handleRotationRight, rightArrow }) => {
    const timeoutRef = React.useRef(null);

    const { setIsSlideShow } = useAppContext();

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
                    handleRotationRight();
                } else {
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
        <div className="dismiss">
            <div className="wrapper">
                <Control />
                <div className="img-container">
                    <img className="full" src={photo.url} alt={"fullsize"} />
                </div>
            </div>
        </div>
    );
};

export default Slideshow;
