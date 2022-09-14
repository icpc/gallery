import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const Control = ({handelClick, slideShow, isSlideShow}) => {

    return (
        <div className="control">
            {isSlideShow ? <PauseIcon className='slideshow' onClick={slideShow}/> :
                <PlayArrowIcon className='slideshow' onClick={slideShow}/>}
            <span className="dismiss" onClick={handelClick}>
                    <CloseIcon className="dismiss"/>
            </span>

        </div>
    );
};

export default Control;