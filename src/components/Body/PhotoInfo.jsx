import { useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton, Tooltip } from "@mui/material";

import { FLICKR_IMAGE_PREFIX } from "../../consts";

import { AlbumInfo, EventInfo, PersonInfo,PhotographerInfo, TeamInfo } from "./PhotoInfoDetails";

import "../../styles/PhotoInfo.css";

const PhotoInfo = ({ photoInfo, setFace, photo }) => {
    const [hidden, setHidden] = useState(false);

    function toogleHidden() {
        setHidden(!hidden);
    }

    return (
        <div className="photoInfo">
            {!hidden && PhotographerInfo({ photoInfo })}
            {!hidden && AlbumInfo({ photoInfo })}
            {!hidden && EventInfo({ photoInfo })}
            {!hidden && TeamInfo({ photoInfo })}
            {!hidden && PersonInfo({ photoInfo, setFace })}

            <div className="control-bottom">
                <Tooltip title={(hidden ? "Show" : "Hide") + " photo info"}>
                    <IconButton className="photoInfo-hide" onClick={toogleHidden}>
                        {hidden
                            ? <VisibilityOffIcon className="icon-button" fontSize="large" />
                            : <VisibilityIcon className="icon-button" fontSize="large" />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Go to Flickr">
                    <IconButton href={FLICKR_IMAGE_PREFIX + photo.id} target="_blank" rel="noreferrer">
                        <OpenInNewIcon className="icon-button" fontSize="large" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Download photo">
                    <IconButton href={photo.origin} download target="_blank" rel="noreferrer">
                        <DownloadIcon className="icon-button" fontSize="large" />
                    </IconButton>
                </Tooltip>
            </div>
        </div>

    );
};

export default PhotoInfo;
