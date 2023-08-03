import { useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, IconButton, Stack, Tooltip } from "@mui/material";
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


    const photoLink = FLICKR_IMAGE_PREFIX + photo.id;
    const tags = SerializePhotoInfo(photoInfo).join(", ");

    function copyToClipboard() {
        setEditMode(false);
        navigator.clipboard.writeText(tags);
        enqueueSnackbar("New tags copied to clipboard", { variant: "success", autoHideDuration: 2000 });
    }

    const emailBody = `Photo link: ${photoLink}\n\nGallery link: ${window.location.href}\n\nTags: ${tags}`;
    const emailSubject = `Photo info update ${photo.id}`;

    const mailtoLink = `mailto:${SUGGESTIONS_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const gmailLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(SUGGESTIONS_EMAIL)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

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
                {editMode &&
                    <Tooltip title="Exit editing mode">
                        <Button
                            variant="contained"
                            size="large"
                            color="error"
                            onClick={() => setEditMode(false)}>
                            Exit
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


            {editMode &&
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Send your suggestion using Gmail">
                        <Button
                            href={gmailLink}
                            target="_blank"
                            variant="contained"
                            size="large"
                            color="error"
                            onClick={() => setEditMode(false)}>
                            Send via Gmail
                        </Button>
                    </Tooltip>

                    <Tooltip title="Send your suggestion using your system mail provider">
                        <Button
                            href={mailtoLink}
                            target="_blank"
                            variant="contained"
                            color="info"
                            size="large"
                            onClick={() => setEditMode(false)}>
                            Send via mail client
                        </Button>
                    </Tooltip>

                    <Tooltip title="Copy tags to clipboard">
                        <Button
                            variant="contained"
                            size="large"
                            color="success"
                            onClick={() => copyToClipboard()}>
                            Copy to clipboard
                        </Button>
                    </Tooltip>
                </Stack>}
        </div>

    );
};

export default PhotoInfoPanel;
