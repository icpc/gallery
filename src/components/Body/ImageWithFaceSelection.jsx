import { useState } from "react";
import { Box } from "@mui/material";

import { usePhotoInfo } from "./PhotoInfo/PhotoInfoContext";
import FaceDiv from "./FaceDiv";

import "../../styles/Body.css";
import "react-image-crop/dist/ReactCrop.css";

const ImageWithFaceSelection = ({ photo, alt = "", face, setFace }) => {
    const { photoInfo, editMode } = usePhotoInfo();

    function calculateImageSize(naturalWidth, naturalHeight) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const ratio = Math.min(screenWidth / naturalWidth, screenHeight / naturalHeight);
        return {
            width: naturalWidth * ratio,
            height: naturalHeight * ratio
        };
    }

    const { width, height } = calculateImageSize(photo.width, photo.height);

    return (
        <Box width={width} height={height}>
            <img
                width={width} height={height}
                src={photo.url}
                alt={alt}
            />
            {photoInfo?.person?.map(person => (
                <FaceDiv
                    person={person}
                    setFace={setFace}
                    hidden={!editMode && face?.name !== person.name}
                    key={person.name + person.position.top}
                />
            ))}
        </Box>
    );
};

export default ImageWithFaceSelection;
