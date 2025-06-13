import { FC } from "react";
import {
  ScrollPosition,
  trackWindowScroll,
} from "react-lazy-load-image-component";

import { Box, Typography } from "@mui/material";
import { GroupedPhotos } from "src/types";

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
  if (!groupedPhotos.find(({ photos }) => photos.length > 0)) {
    return <Typography variant="h1">No photo</Typography>;
  }
  return Array.from(groupedPhotos).map(({ key, photos }) => (
    <Box key={key}>
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
