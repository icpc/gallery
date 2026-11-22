import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PhotoAlbumOutlinedIcon from "@mui/icons-material/PhotoAlbumOutlined";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { forwardRef, type ReactNode, useState } from "react";
import {
  FLICKR_IMAGE_PREFIX,
  places,
  SUGGESTIONS_EMAIL,
} from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import { serializePhotoInfo } from "@/features/viewer/utils/photoTags";
import { useNotify } from "@/shared/components/NotificationProvider";
import { useDocumentSeo } from "@/shared/hooks/useDocumentSeo";
import type { Photo } from "@/types/gallery";

interface PhotoInfoSidebarProps {
  photo: Photo;
  desktop: boolean;
  onCloseSidebar?: () => void;
}

const InfoSection = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => (
  <Stack spacing={0.75}>
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", color: "text.secondary" }}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </Typography>
    </Stack>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>{children}</Box>
  </Stack>
);

/**
 * Unified info & tag-editing sidebar shared identically between desktop
 * (collapsible right rail) and mobile (collapsible bottom panel).
 */
export const PhotoInfoSidebar = forwardRef<
  HTMLDivElement,
  PhotoInfoSidebarProps
>(({ photo, desktop, onCloseSidebar }, ref) => {
  const {
    events,
    teams,
    setYear,
    setEvent,
    setTeam,
    setPerson: filterByPerson,
  } = useGallery();
  const {
    photoInfo,
    editMode,
    setEditMode,
    setFace,
    setEvents,
    setTeam: setPhotoTeams,
    setAlbum,
    setPhotographer,
    setPerson: setPhotoPersons,
  } = usePhotoInfo();
  const notify = useNotify();
  const [otherMenuAnchor, setOtherMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

  const photoLink = `${FLICKR_IMAGE_PREFIX}${photo.id}`;
  const tags = serializePhotoInfo(photoInfo).join(", ");
  const emailSubject = `Photo info update ${photo.id}`;
  const emailBody = `Photo link: ${photoLink}\n\nGallery link: ${window.location.href}\n\nTags: ${tags}`;
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

  const handleCopyTags = () => {
    setOtherMenuAnchor(null);
    setEditMode(false);
    navigator.clipboard.writeText(tags);
    notify("New tags copied to clipboard", "success");
  };

  const sortedPersons = photoInfo
    ? [...photoInfo.person].sort(
        (a, b) => (a.position?.left ?? 0) - (b.position?.left ?? 0),
      )
    : [];

  return (
    <Box
      component="aside"
      aria-label="Photo details"
      sx={{
        width: desktop ? 360 : "100%",
        flexShrink: 0,
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
        borderLeft: desktop ? "1px solid rgba(255,255,255,0.12)" : "none",
        borderTop: desktop ? "none" : "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          touchAction: desktop ? "auto" : "none",
        }}
      >
        {!desktop && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 1,
              pb: 0.25,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: 2,
                bgcolor: "rgba(255, 255, 255, 0.28)",
              }}
            />
          </Box>
        )}

        <Stack
          direction="row"
          sx={{
            px: 2,
            minHeight: desktop ? 56 : 44,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {editMode ? "Edit tags" : "Info"}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            {!editMode ? (
              <Tooltip title="Edit tags">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(true);
                  }}
                  aria-label="Edit tags"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Exit edit mode">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(false);
                  }}
                  aria-label="Exit edit mode"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {!editMode && onCloseSidebar && (
              <Tooltip title="Close info panel">
                <IconButton
                  size="small"
                  onClick={onCloseSidebar}
                  aria-label="Close info panel"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>

      <Stack
        ref={ref}
        spacing={2.5}
        sx={{
          p: 2,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
        {!photoInfo ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={28} />
            <Skeleton variant="rounded" height={28} />
            <Skeleton variant="rounded" height={48} />
          </Stack>
        ) : editMode ? (
          <Stack spacing={2}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Drag on the photo to tag a face, or adjust metadata below.
            </Typography>

            <Autocomplete
              multiple
              options={[]}
              value={photoInfo.person.map((p) => p.name)}
              onChange={(_e, val) => setPhotoPersons(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="People"
                  placeholder="Drag on photo to add face"
                  variant="filled"
                />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
              options={events}
              value={photoInfo.event}
              onChange={(_e, val) => setEvents(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Events"
                  variant="filled"
                />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
              options={teams}
              value={photoInfo.team}
              onChange={(_e, val) => setPhotoTeams(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Teams"
                  variant="filled"
                />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={photoInfo.photographer}
              onChange={(_e, val) => setPhotographer(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Photographer"
                  variant="filled"
                />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
              options={places.map(({ year }) => year)}
              value={photoInfo.album}
              onChange={(_e, val) => setAlbum(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Album"
                  variant="filled"
                />
              )}
            />

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<EmailIcon />}
                  href={gmailLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setEditMode(false)}
                >
                  Gmail
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmailOutlinedIcon />}
                  href={mailtoLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setEditMode(false)}
                >
                  Email
                </Button>
              </Stack>

              <Button
                fullWidth
                variant="text"
                color="inherit"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => setOtherMenuAnchor(e.currentTarget)}
              >
                Other options
              </Button>
              <Menu
                anchorEl={otherMenuAnchor}
                open={Boolean(otherMenuAnchor)}
                onClose={() => setOtherMenuAnchor(null)}
              >
                <MenuItem onClick={handleCopyTags}>
                  <ListItemIcon>
                    <ContentCopyIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Copy raw tags</ListItemText>
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {photoInfo.photographer.length > 0 && (
              <InfoSection
                icon={<CameraAltOutlinedIcon fontSize="small" />}
                label="Photographer"
              >
                {photoInfo.photographer.map((name) => (
                  <Chip
                    key={name}
                    label={name}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </InfoSection>
            )}

            {photoInfo.album.length > 0 && (
              <InfoSection
                icon={<PhotoAlbumOutlinedIcon fontSize="small" />}
                label="Album"
              >
                {photoInfo.album.map((album) => (
                  <Chip
                    key={album}
                    label={album}
                    size="small"
                    clickable
                    onClick={() => setYear(album)}
                  />
                ))}
              </InfoSection>
            )}

            {photoInfo.event.length > 0 && (
              <InfoSection
                icon={<EventOutlinedIcon fontSize="small" />}
                label="Event"
              >
                {photoInfo.event.map((eventName) => (
                  <Chip
                    key={eventName}
                    label={eventName}
                    size="small"
                    clickable
                    onClick={() => setEvent(eventName)}
                  />
                ))}
              </InfoSection>
            )}

            {photoInfo.team.length > 0 && (
              <InfoSection
                icon={<GroupsOutlinedIcon fontSize="small" />}
                label="Team"
              >
                {photoInfo.team.map((teamName) => (
                  <Chip
                    key={teamName}
                    label={teamName}
                    size="small"
                    clickable
                    onClick={() => setTeam(teamName)}
                  />
                ))}
              </InfoSection>
            )}

            {sortedPersons.length > 0 && (
              <InfoSection
                icon={<PersonOutlinedIcon fontSize="small" />}
                label="People"
              >
                {sortedPersons.map((person) => (
                  <Chip
                    key={`${person.name}-${person.position?.left ?? "nopos"}`}
                    label={person.name}
                    size="small"
                    clickable
                    onMouseEnter={() => setFace(person)}
                    onMouseLeave={() => setFace(null)}
                    onClick={() => filterByPerson(person.name)}
                  />
                ))}
              </InfoSection>
            )}

            {photoInfo.photographer.length === 0 &&
              photoInfo.album.length === 0 &&
              photoInfo.event.length === 0 &&
              photoInfo.team.length === 0 &&
              sortedPersons.length === 0 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No metadata tags yet. Click Edit to suggest tags.
                </Typography>
              )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
});

PhotoInfoSidebar.displayName = "PhotoInfoSidebar";
