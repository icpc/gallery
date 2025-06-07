import { FC } from "react";

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { Collapse, IconButton, Stack } from "@mui/material";

import { useAppContext } from "../AppContext";
import { MobileLogo } from "../Logo";

import Filters from "./Filters";
import MobileYearWrappper from "./MobileYearWrapper";

const Header: FC = () => {
  const { isOpenMenu, setIsOpenMenu, mobile } = useAppContext();

  const toggleMenu = () => {
    setIsOpenMenu(!isOpenMenu);
  };

  return (
    <Stack sx={{ flexGrow: 1 }} justifyContent="center">
      {mobile && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <MobileLogo />
          <IconButton onClick={toggleMenu}>
            {!isOpenMenu ? (
              <MenuIcon fontSize="large" />
            ) : (
              <CloseIcon fontSize="large" />
            )}
          </IconButton>
        </Stack>
      )}
      <Collapse in={isOpenMenu} sx={{ width: "1" }}>
        <Filters />
      </Collapse>
      {mobile && <MobileYearWrappper />}
    </Stack>
  );
};

export default Header;
