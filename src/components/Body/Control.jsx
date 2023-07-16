import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useAppContext } from "../AppContext";
import { IconButton } from '@mui/material';

const Control = ({ isSlideShow, setIsSlideShow }) => {
    const { setFullscreenPhotoIndex } = useAppContext();

    const slideShow = () => {
        setIsSlideShow(!isSlideShow);
    }

    return (
        <div className="control">
            <IconButton className="dismiss" onClick={() => slideShow()}>
                {isSlideShow ? <PauseIcon className="icon-button" fontSize="large" /> :
                    <PlayArrowIcon className="icon-button" fontSize="large" />}
            </IconButton>
            <IconButton className="dismiss" onClick={() => setFullscreenPhotoIndex(null)}>
                <CloseIcon className="icon-button" fontSize="large" />
            </IconButton>
        </div>
    );
};

export default Control;