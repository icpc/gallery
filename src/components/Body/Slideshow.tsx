import { FC, useEffect } from "react";

import { Photo } from "../../types";
import { useAppContext } from "../AppContext";

import Control from "./Control";

import "../../styles/Body.css";

interface Props {
  photo: Photo;
  handleRotationRight: () => void;
}

const Slideshow: FC<Props> = ({ photo, handleRotationRight }) => {
  const { data } = useAppContext();
  const seconds = data.slideshowSpeed ?? 3;
  const intervalMs = seconds * 1000;
  useEffect(() => {
    const interval = setInterval(() => {
      handleRotationRight();
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [handleRotationRight, intervalMs]);

  return (
    <div className="dismiss">
      <div className="wrapper">
        <Control />
        <div className="img-container">
          <img className="full" src={photo.src.url} alt={"fullsize"} />
        </div>
      </div>
    </div>
  );
};

export default Slideshow;
