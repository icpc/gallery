import { useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, IconButton, Tooltip } from "@mui/material";
import { enqueueSnackbar } from "notistack";

import { FLICKR_IMAGE_PREFIX, SUGGESTIONS_EMAIL } from "../../../consts";
import { SerializePhotoInfo } from "../../../Util/PhotoInfoHelper";

import { usePhotoInfo } from "./PhotoInfoContext";
import { AlbumInfo, EventInfo, PersonInfo, PhotographerInfo, TeamInfo } from "./PhotoInfoDetails";

import "../../../styles/PhotoInfo.css";

const PhotoInfoPanel = ({ setFace, photo }) => {
    const { editMode, setEditMode, photoInfo } = usePhotoInfo();

    const [hidden, setHidden] = useState(false);

    const toolTipsHidden = editMode;

    function finishEditing() {
        setEditMode(false);
        navigator.clipboard.writeText(SerializePhotoInfo(photoInfo).join(", "));
        enqueueSnackbar("New tags copied to clipboard", { variant: "success", autoHideDuration: 2000 });
    }

    function mailtoLink() {
        const photoLink = FLICKR_IMAGE_PREFIX + photo.id;
        const tags = SerializePhotoInfo(photoInfo).join(", ");
        const subject = `Photo info update ${photo.id}`;
        const body = `Photo link: ${photoLink}\n\nGallery link: ${window.location.href}\n\nTags: ${tags}`;
        const mailtoLink = `mailto:${SUGGESTIONS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return mailtoLink;
    }

    function toogleHidden() {
        setHidden(!hidden);
    }

    return (
        <div className="photoInfo">
            {!hidden && PhotographerInfo()}
            {!hidden && AlbumInfo()}
            {!hidden && EventInfo()}
            {!hidden && TeamInfo()}
            {!hidden && PersonInfo({ setFace })}


            <div className="control-bottom">
                {toolTipsHidden &&
                    <Tooltip title="Send changes">
                        <Button
                            href={mailtoLink()}
                            target="_blank"
                            variant="contained"
                            size="large"
                            onClick={() => finishEditing()}>
                            Done
                        </Button>
                    </Tooltip>}
                {!toolTipsHidden &&
                    <Tooltip title="Edit photo info">
                        <IconButton onClick={() => setEditMode(true)}>
                            <EditIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>}
                {!toolTipsHidden &&
                    <Tooltip title={(hidden ? "Show" : "Hide") + " photo info"}>
                        <IconButton onClick={toogleHidden}>
                            {hidden
                                ? <VisibilityOffIcon fontSize="large" />
                                : <VisibilityIcon fontSize="large" />}
                        </IconButton>
                    </Tooltip>}
                {!toolTipsHidden &&
                    <Tooltip title="Go to Flickr">
                        <IconButton href={FLICKR_IMAGE_PREFIX + photo.id} target="_blank" rel="noreferrer">
                            <OpenInNewIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>}
                {!toolTipsHidden &&
                    <Tooltip title="Download photo">
                        <IconButton href={photo.origin} download target="_blank" rel="noreferrer">
                            <DownloadIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>}
            </div>
        </div>

    );
};

export default PhotoInfoPanel;
