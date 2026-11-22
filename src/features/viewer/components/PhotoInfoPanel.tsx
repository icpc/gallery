import Close from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Box, Grid, IconButton, Stack, Tooltip } from "@mui/material";
import { type FC, useState } from "react";
import { FLICKR_IMAGE_PREFIX, SUGGESTIONS_EMAIL } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import { serializePhotoInfo } from "@/features/viewer/utils/photoTags";
import { useNotify } from "@/shared/components/NotificationProvider";
import { useDocumentSeo } from "@/shared/hooks/useDocumentSeo";
import type { Person, Photo } from "@/types/gallery";
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

import "../styles/PhotoInfo.css";

interface PhotoInfoPanelProps {
  setFace: (face: Person | null) => void;
  photo: Photo;
}

export const PhotoInfoPanel: FC<PhotoInfoPanelProps> = ({ setFace, photo }) => {
  const { desktop } = useGallery();
  const { editMode, setEditMode, photoInfo } = usePhotoInfo();
  const notify = useNotify();
  const [hidden, setHidden] = useState(false);

  const toolTipsHidden = editMode;
  const changesPane = editMode && desktop;
  const photoLink = FLICKR_IMAGE_PREFIX + photo.id;
  const tags = serializePhotoInfo(photoInfo).join(", ");

  const copyToClipboard = () => {
    setEditMode(false);
    navigator.clipboard.writeText(tags);
    notify("New tags copied to clipboard", "success");
  };

  const emailBody = `Photo link: ${photoLink}\n\nGallery link: ${window.location.href}\n\nTags: ${tags}`;
  const emailSubject = `Photo info update ${photo.id}`;
  const mailtoLink = `mailto:${SUGGESTIONS_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const gmailLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(SUGGESTIONS_EMAIL)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const seoDescription = photoInfo
    ? [...photoInfo.team, ...photoInfo.person.map((p) => p.name)].join(", ")
    : "";

  useDocumentSeo({
    description: seoDescription || undefined,
    ogDescription: seoDescription || undefined,
    ogImage: photo.src.url,
    twitterDescription: seoDescription || undefined,
    twitterImage: photo.src.url,
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
              <IconButton onClick={copyToClipboard}>
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
          <>
            <Tooltip title="Edit photo info">
              <IconButton onClick={() => setEditMode(true)}>
                <EditIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title={`${hidden ? "Show" : "Hide"} photo info`}>
              <IconButton onClick={() => setHidden(!hidden)}>
                {hidden ? (
                  <VisibilityOffIcon fontSize="large" />
                ) : (
                  <VisibilityIcon fontSize="large" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Go to Flickr">
              <IconButton
                href={FLICKR_IMAGE_PREFIX + photo.id}
                target="_blank"
                rel="noreferrer"
              >
                <OpenInNewIcon fontSize="large" />
              </IconButton>
            </Tooltip>
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
          </>
        )}
      </div>
    </div>
  );
};
