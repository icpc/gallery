import { FC, useEffect } from "react";
import {
  ScrollPosition,
  trackWindowScroll,
} from "react-lazy-load-image-component";

import { Box, Typography } from "@mui/material";
import { GroupedPhotos } from "src/types";

import { useAppContext } from "../AppContext";

import PhotoGrid from "./PhotoGrid";

interface Props {
  groupedPhotos: GroupedPhotos[];
  handleClick: (id: string) => void;
  scrollPosition: ScrollPosition;
}

const PhotoGallery: FC<Props> = ({
  groupedPhotos,
  handleClick,
  scrollPosition,
}) => {
  const { data } = useAppContext();

  useEffect(() => {
    if (data.event) {
      const id = encodeURIComponent(data.event);
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupedPhotos, data.event]);

  if (!groupedPhotos.find(({ photos }) => photos.length > 0)) {
    return <Typography variant="h1">No photo</Typography>;
  }

  return Array.from(groupedPhotos).map(({ key, photos }) => (
    <Box key={key} id={encodeURIComponent(key)}>
      <Typography variant="h1">{key}</Typography>
      <PhotoGrid
        photos={photos}
        handleClick={handleClick}
        scrollPosition={scrollPosition}
      />
    </Box>
  ));
};

export default trackWindowScroll(PhotoGallery);
