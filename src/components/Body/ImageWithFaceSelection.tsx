import { FC, useEffect, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
  Autocomplete,
  Box,
  Paper,
  TextField,
  createFilterOptions,
} from "@mui/material";

import { getPeopleData } from "../../consts";
import { Person, Photo } from "../../types";
import { useAppContext } from "../AppContext";

import FaceDiv from "./FaceDiv";
import { usePhotoInfo } from "./PhotoInfo/PhotoInfoContext";

import "../../styles/Body.css";

interface Props {
  photo: Photo;
  alt?: string;
  face: Person | null;
  setFace: (face: Person | null) => void;
}

const ImageWithFaceSelection: FC<Props> = ({
  photo,
  alt = "",
  face,
  setFace,
}) => {
  const { data } = useAppContext();
  const { photoInfo, editMode, appendPerson } = usePhotoInfo();
  const [crop, setCrop] = useState<Crop>();

  const [people, setPeople] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;

    getPeopleData(data.year).then((peopleData) => {
      if (!isCancelled) {
        setPeople(peopleData);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [data.year]);

  function calculateImageSize(naturalWidth: number, naturalHeight: number) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const ratio = Math.min(
      screenWidth / naturalWidth,
      screenHeight / naturalHeight,
    );
    return {
      width: naturalWidth * ratio,
      height: naturalHeight * ratio,
    };
  }

  const { width, height } = calculateImageSize(
    photo.src.width,
    photo.src.height,
  );

  function createPerson(name: string, crop: Crop) {
    if (name) {
      const person: Person = {
        name: name,
        position: {
          top: crop.y / height,
          left: crop.x / width,
          right: (crop.x + crop.width) / width,
          bottom: (crop.y + crop.height) / height,
        },
      };
      appendPerson(person);
      setCrop(undefined);
    }
  }

  return (
    <Box width={width} height={height}>
      <ReactCrop
        crop={crop}
        onChange={(c: Crop) => setCrop(c)}
        disabled={!editMode}
      >
        <img width={width} height={height} src={photo.src.url} alt={alt} />
        {photoInfo?.person?.map((person) => (
          <FaceDiv
            person={person}
            setFace={setFace}
            hidden={!editMode && face?.name !== person.name}
            key={person.name + person.position?.top}
          />
        ))}
      </ReactCrop>
      {crop && crop?.height !== 0 && (
        <Paper
          style={{
            position: "absolute",
            left: crop?.x,
            top: crop?.y + crop?.height,
            width: Math.max(crop?.width, 200),
          }}
          elevation={3}
        >
          <Autocomplete<string, false, false, true>
            filterOptions={createFilterOptions({ limit: 200 })}
            options={people}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} placeholder="Enter a name" />
            )}
            onChange={(_, newValue) => createPerson(newValue ?? "", crop)}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ImageWithFaceSelection;
