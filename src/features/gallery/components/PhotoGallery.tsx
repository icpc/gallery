import { Box, Typography } from "@mui/material";
import { type FC, useEffect } from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import type { GroupedPhotos } from "@/types/gallery";
import { PhotoGrid } from "./PhotoGrid";

interface PhotoGalleryProps {
  groupedPhotos: GroupedPhotos[];
  handleClick: (id: string) => void;
}

export const PhotoGallery: FC<PhotoGalleryProps> = ({
  groupedPhotos,
  handleClick,
}) => {
  const { data } = useGallery();

  useEffect(() => {
    if (data.event && groupedPhotos.length > 0) {
      const id = encodeURIComponent(data.event);
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "instant" });
    }
  }, [groupedPhotos.length, data.event]);

  if (!groupedPhotos.some(({ photos }) => photos.length > 0)) {
    return <Typography variant="h1">No photo</Typography>;
  }

  return (
    <>
      {groupedPhotos.map(({ key, photos }) => (
        <Box key={key} id={encodeURIComponent(key)}>
          <Typography variant="h1">{key}</Typography>
          <PhotoGrid photos={photos} handleClick={handleClick} />
        </Box>
      ))}
    </>
  );
};
