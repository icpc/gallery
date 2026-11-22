import {
  Autocomplete,
  Box,
  createFilterOptions,
  Paper,
  TextField,
} from "@mui/material";
import { type FC, useEffect, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { getPeopleData } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import type { Person, Photo } from "@/types/gallery";
import { FaceBox } from "./FaceBox";

interface ImageWithFaceSelectionProps {
  photo: Photo;
  alt?: string;
  face: Person | null;
  setFace: (face: Person | null) => void;
}

export const ImageWithFaceSelection: FC<ImageWithFaceSelectionProps> = ({
  photo,
  alt = "",
  face,
  setFace,
}) => {
  const { data } = useGallery();
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

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const ratio = Math.min(
    screenWidth / photo.src.width,
    screenHeight / photo.src.height,
  );
  const width = photo.src.width * ratio;
  const height = photo.src.height * ratio;

  const createPerson = (name: string, nextCrop: Crop) => {
    if (!name) return;
    appendPerson({
      name,
      position: {
        top: nextCrop.y / height,
        left: nextCrop.x / width,
        right: (nextCrop.x + nextCrop.width) / width,
        bottom: (nextCrop.y + nextCrop.height) / height,
      },
    });
    setCrop(undefined);
  };

  return (
    <Box sx={{ width, height }}>
      <ReactCrop
        crop={crop}
        onChange={(c: Crop) => setCrop(c)}
        disabled={!editMode}
      >
        <img width={width} height={height} src={photo.src.url} alt={alt} />
        {photoInfo?.person?.map((person) => (
          <FaceBox
            person={person}
            setFace={setFace}
            hidden={!editMode && face?.name !== person.name}
            key={`${person.name}-${person.position?.top ?? "nopos"}`}
          />
        ))}
      </ReactCrop>
      {crop && crop.height !== 0 && (
        <Paper
          style={{
            position: "absolute",
            left: crop.x,
            top: crop.y + crop.height,
            width: Math.max(crop.width, 200),
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
