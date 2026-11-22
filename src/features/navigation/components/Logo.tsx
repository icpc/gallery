import { Box, Link } from "@mui/material";
import type { FC, MouseEvent } from "react";
import logo from "@/assets/icons/logo-white.svg";
import { LAST_YEAR } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";

function useHomeClick() {
  const { setYear } = useGallery();
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    setYear(LAST_YEAR);
  };
}

export const MobileLogo: FC = () => {
  const handleClick = useHomeClick();
  return (
    <Link href={`?album=${LAST_YEAR}`} onClick={handleClick}>
      <Box
        component="img"
        src={logo}
        alt="go home page"
        sx={{ width: "200px" }}
      />
    </Link>
  );
};

export const DesktopLogo: FC = () => {
  const handleClick = useHomeClick();
  return (
    <Link
      href={`?album=${LAST_YEAR}`}
      onClick={handleClick}
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="go home page"
        sx={{ height: "56px" }}
      />
    </Link>
  );
};
