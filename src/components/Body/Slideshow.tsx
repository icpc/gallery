import { FC, useEffect } from "react";

import { Photo } from "../../types";
import Control from "./Control";

import "../../styles/Body.css";

interface Props {
  photo: Photo;
  handleRotationRight: () => void;
}

const Slideshow: FC<Props> = ({ photo, handleRotationRight }) => {
  useEffect(() => {
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
