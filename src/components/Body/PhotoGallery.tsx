import { Box, Typography } from "@mui/material";
import { type FC, useEffect } from "react";
import type { GroupedPhotos } from "../../types";

import { useAppContext } from "../AppContext";

import PhotoGrid from "./PhotoGrid";

interface Props {
  groupedPhotos: GroupedPhotos[];
  handleClick: (id: string) => void;
}

const PhotoGallery: FC<Props> = ({ groupedPhotos, handleClick }) => {
  const { data } = useAppContext();

  useEffect(() => {
    if (data.event && groupedPhotos.length > 0) {
      const id = encodeURIComponent(data.event);
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "instant" });
    }
  }, [groupedPhotos.length, data.event]);

  if (!groupedPhotos.find(({ photos }) => photos.length > 0)) {
    return <Typography variant="h1">No photo</Typography>;
  }

  return Array.from(groupedPhotos).map(({ key, photos }) => (
    <Box key={key} id={encodeURIComponent(key)}>
      <Typography variant="h1">{key}</Typography>
      <PhotoGrid photos={photos} handleClick={handleClick} />
    </Box>
  ));
};

export default PhotoGallery;
