import { Box, Typography } from "@mui/material";
import { type FC, memo, useEffect } from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import type { GallerySection } from "@/features/gallery/utils/gallerySections";
import { PhotoGrid } from "./PhotoGrid";

interface PhotoGalleryProps {
  sections: readonly GallerySection[];
  onSelectIndex: (flatIndex: number) => void;
}

export const PhotoGallery: FC<PhotoGalleryProps> = memo(
  ({ sections, onSelectIndex }) => {
    const { data } = useGallery();

    useEffect(() => {
      if (data.event && sections.length > 0) {
        const id = encodeURIComponent(data.event);
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "instant" });
      }
    }, [sections.length, data.event]);

    if (!sections.some(({ items }) => items.length > 0)) {
      return <Typography variant="h1">No photo</Typography>;
    }

    return (
      <>
        {sections.map(({ key, items }) => (
          <Box key={key} id={encodeURIComponent(key)}>
            <Typography variant="h1">{key}</Typography>
            <PhotoGrid items={items} onSelectIndex={onSelectIndex} />
          </Box>
        ))}
      </>
    );
  },
);
