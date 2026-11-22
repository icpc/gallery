import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Collapse, IconButton, Stack } from "@mui/material";
import type { FC } from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { Filters } from "./Filters";
import { MobileLogo } from "./Logo";
import { MobileYearHeader } from "./MobileYearHeader";

export const Header: FC = () => {
  const { isOpenMenu, setIsOpenMenu, mobile } = useGallery();

  return (
    <Stack sx={{ flexGrow: 1, justifyContent: "center" }}>
      {mobile && (
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <MobileLogo />
          <IconButton
            onClick={() => setIsOpenMenu(!isOpenMenu)}
            aria-label={isOpenMenu ? "Close filters menu" : "Open filters menu"}
          >
            {isOpenMenu ? (
              <CloseIcon fontSize="large" />
            ) : (
              <MenuIcon fontSize="large" />
            )}
          </IconButton>
        </Stack>
      )}
      <Collapse in={isOpenMenu} sx={{ width: "1" }}>
        <Filters />
      </Collapse>
      {mobile && <MobileYearHeader />}
    </Stack>
  );
};
