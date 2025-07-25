import { FC, useState } from "react";

import Close from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Box, Grid, IconButton, Stack, Tooltip } from "@mui/material";
import { useSeoMeta } from "@unhead/react";
import { enqueueSnackbar } from "notistack";

import { FLICKR_IMAGE_PREFIX, SUGGESTIONS_EMAIL } from "../../../consts";
import { Person, Photo } from "../../../types";
import { SerializePhotoInfo } from "../../../utils/PhotoInfoHelper";
import { useAppContext } from "../../AppContext";

import { usePhotoInfo } from "./PhotoInfoContext";
import {
  AlbumEdit,
  AlbumInfo,
  EventEdit,
  EventInfo,
  PersonEdit,
  PersonInfo,
  PhotographerEdit,
  PhotographerInfo,
  TeamEdit,
  TeamInfo,
} from "./PhotoInfoDetails";

import "../../../styles/PhotoInfo.css";

interface Props {
  setFace: (face: Person | null) => void;
  photo: Photo;
}

const PhotoInfoPanel: FC<Props> = ({ setFace, photo }) => {
  const { desktop } = useAppContext();
  const { editMode, setEditMode, photoInfo } = usePhotoInfo();

  const [hidden, setHidden] = useState(false);

  const toolTipsHidden = editMode;
  const changesPane = editMode && desktop;

  const photoLink = FLICKR_IMAGE_PREFIX + photo.id;
  const tags = SerializePhotoInfo(photoInfo).join(", ");

  function copyToClipboard() {
    setEditMode(false);
    navigator.clipboard.writeText(tags);
    enqueueSnackbar("New tags copied to clipboard", {
      variant: "success",
      autoHideDuration: 2000,
    });
  }

  const emailBody = `Photo link: ${photoLink}\n\nGallery link: ${window.location.href}\n\nTags: ${tags}`;
  const emailSubject = `Photo info update ${photo.id}`;

  const mailtoLink = `mailto:${SUGGESTIONS_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const gmailLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(SUGGESTIONS_EMAIL)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  function toogleHidden() {
    setHidden(!hidden);
  }

  function getDescription() {
    if (!photoInfo) return "";
    return [...photoInfo.team, ...photoInfo.person.map((p) => p.name)].join(
      ", ",
    );
  }

  function getPhotoImageUrl() {
    return photo.src.url;
  }

  useSeoMeta({
    description: getDescription(),
    ogDescription: getDescription(),
    ogImage: getPhotoImageUrl(),
    twitterDescription: getDescription(),
    twitterImage: getPhotoImageUrl(),
    twitterCard: "summary_large_image",
  });

  return (
    <div className="photoInfo">
      {!hidden && !changesPane && (
        <Box>
          <PhotographerInfo />
          <AlbumInfo />
          <EventInfo />
          <TeamInfo />
          <PersonInfo setFace={setFace} />
        </Box>
      )}

      {changesPane && (
        <Grid container spacing={1}>
          <Grid size={12}>
            <PersonEdit />
          </Grid>
          <Grid size={12}>
            <EventEdit />
          </Grid>
          <Grid size="auto">
            <TeamEdit />
          </Grid>
          <Grid size="auto">
            <PhotographerEdit />
          </Grid>
          <Grid size="auto">
            <AlbumEdit />
          </Grid>
        </Grid>
      )}

      <div className="control-bottom">
        {editMode && (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Send your suggestion using Gmail">
              <IconButton
                href={gmailLink}
                target="_blank"
                onClick={() => setEditMode(false)}
              >
                <EmailIcon fontSize="large" color="error" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Send your suggestion using your system mail provider">
              <IconButton
                href={mailtoLink}
                target="_blank"
                onClick={() => setEditMode(false)}
              >
                <EmailIcon fontSize="large" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Copy tags to clipboard">
              <IconButton onClick={() => copyToClipboard()}>
                <ContentCopyIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exit editing mode">
              <IconButton onClick={() => setEditMode(false)}>
                <Close fontSize="large" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
        {!toolTipsHidden && (
          <Tooltip title="Edit photo info">
            <IconButton onClick={() => setEditMode(true)}>
              <EditIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {!toolTipsHidden && (
          <Tooltip title={(hidden ? "Show" : "Hide") + " photo info"}>
            <IconButton onClick={toogleHidden}>
              {hidden ? (
                <VisibilityOffIcon fontSize="large" />
              ) : (
                <VisibilityIcon fontSize="large" />
              )}
            </IconButton>
          </Tooltip>
        )}
        {!toolTipsHidden && (
          <Tooltip title="Go to Flickr">
            <IconButton
              href={FLICKR_IMAGE_PREFIX + photo.id}
              target="_blank"
              rel="noreferrer"
            >
              <OpenInNewIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
        {!toolTipsHidden && (
          <Tooltip title="Download photo">
            <IconButton
              href={photo.origin ?? photo.src.url}
              download
              target="_blank"
              rel="noreferrer"
            >
              <DownloadIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default PhotoInfoPanel;
