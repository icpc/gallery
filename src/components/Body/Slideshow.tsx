import React from "react";

import Control from "./Control";

import "../../styles/Body.css";

const Slideshow = ({ photo, handleRotationRight }) => {
  React.useEffect(() => {
    const interval = setInterval(() => {
      handleRotationRight();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [handleRotationRight]);

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
