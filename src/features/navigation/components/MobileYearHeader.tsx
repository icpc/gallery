import { Box, Typography } from "@mui/material";
import type { FC } from "react";
import { places } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";

export const MobileYearHeader: FC = () => {
  const { data, setIsOpenMenu } = useGallery();

  const toggleMenu = () => {
    setIsOpenMenu(true);
  };

  if (data.text) {
    return (
      <Box onClick={toggleMenu}>
        <Typography variant="h4">{data.text}</Typography>
      </Box>
    );
  }

  const place = places.find(({ year }) => year === data.year);

  return (
    <Box onClick={toggleMenu} sx={{ mt: 1, mb: 1 }}>
      <Typography variant="h4">
        {place?.contest_name} {place?.year}
      </Typography>
      <Typography variant="h5">{place?.place}</Typography>
    </Box>
  );
};
