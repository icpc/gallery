import { Box, Typography } from "@mui/material";

import { CONTEST_NAME, places } from "../../consts";
import { useAppContext } from "../AppContext";


const MobileYearWrapper = () => {
    const { data, setIsOpenMenu } = useAppContext();

    const toggleMenu = () => {
        setIsOpenMenu(true);
    };

    if (data.text) {
        return <Box onClick={toggleMenu}>
            <Typography variant="h4">{data.text}</Typography>
        </Box>;
    }

    return (
        <Box onClick={toggleMenu} mt={1} mb={1}>
            <Typography variant="h4">{CONTEST_NAME} {data.year}</Typography>
            <Typography variant="h5">{places[data.year]}</Typography>
        </Box>
    );
};

export default MobileYearWrapper;
