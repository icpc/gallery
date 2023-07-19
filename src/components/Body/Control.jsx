import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { IconButton } from "@mui/material";

import { useAppContext } from "../AppContext";

const Control = ({ isSlideShow, setIsSlideShow }) => {
    const { setFullscreenPhotoId } = useAppContext();

    const slideShow = () => {
        setIsSlideShow(!isSlideShow);
    };

    return (
        <div className="control">
            <IconButton className="dismiss" onClick={() => slideShow()}>
                {isSlideShow ? <PauseIcon className="icon-button" fontSize="large" /> :
                    <PlayArrowIcon className="icon-button" fontSize="large" />}
            </IconButton>
            <IconButton className="dismiss" onClick={() => setFullscreenPhotoId(null)}>
                <CloseIcon className="icon-button" fontSize="large" />
            </IconButton>
        </div>
    );
};

export default Control;
