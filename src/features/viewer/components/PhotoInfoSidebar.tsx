import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FaceIcon from "@mui/icons-material/Face";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LinkIcon from "@mui/icons-material/Link";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PhotoAlbumOutlinedIcon from "@mui/icons-material/PhotoAlbumOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from "@mui/icons-material/Save";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { forwardRef, type ReactNode, useEffect, useState } from "react";
import {
  FLICKR_IMAGE_PREFIX,
  places,
  SUGGESTIONS_EMAIL,
} from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import { serializePhotoInfo } from "@/features/viewer/utils/photoTags";
import {
  getPersonTagKey,
  type ListDiff,
  type PhotoInfoDiff,
} from "@/features/viewer/utils/suggestions";
import { useFlickrAuth } from "@/services/flickr/authStore";
import { useNotify } from "@/shared/components/NotificationProvider";
import { useDocumentSeo } from "@/shared/hooks/useDocumentSeo";
import type { Person, Photo, PhotoInfo } from "@/types/gallery";

const TOKEN_PROMPT_SESSION_KEY = "gallery:flickrTokenPromptSeen";

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

const StringDiffChips = ({
  label,
  diff,
}: {
  label: string;
  diff: ListDiff<string>;
}) => {
  if (diff.added.length === 0 && diff.removed.length === 0) {
    return null;
  }
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {diff.added.map((val) => (
          <Chip
            key={`+${val}`}
            label={`+ ${val}`}
            size="small"
            color="success"
            variant="outlined"
          />
        ))}
        {diff.removed.map((val) => (
          <Chip
            key={`-${val}`}
            label={`- ${val}`}
            size="small"
            color="error"
            variant="outlined"
            sx={{ textDecoration: "line-through" }}
          />
        ))}
      </Box>
    </Stack>
  );
};

const SuggestionDiffView = ({
  diff,
  setFace,
}: {
  diff: PhotoInfoDiff;
  setFace: (person: Person | null) => void;
}) => {
  if (!diff.hasChanges) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        No differences compared to current Flickr tags.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.25}>
      <StringDiffChips label="Photographer" diff={diff.photographer} />
      <StringDiffChips label="Album" diff={diff.album} />
      <StringDiffChips label="Event" diff={diff.event} />
      <StringDiffChips label="Team" diff={diff.team} />
      {(diff.person.added.length > 0 || diff.person.removed.length > 0) && (
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            People
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {diff.person.added.map((person) => (
              <Chip
                key={`+${getPersonTagKey(person)}`}
                label={`+ ${person.name}`}
                size="small"
                color="success"
                variant="outlined"
                icon={person.position ? <FaceIcon /> : undefined}
                onMouseEnter={() => setFace(person)}
                onMouseLeave={() => setFace(null)}
              />
            ))}
            {diff.person.removed.map((person) => (
              <Chip
                key={`-${getPersonTagKey(person)}`}
                label={`- ${person.name}`}
                size="small"
                color="error"
                variant="outlined"
                icon={person.position ? <FaceIcon /> : undefined}
                sx={{ textDecoration: "line-through" }}
                onMouseEnter={() => setFace(person)}
                onMouseLeave={() => setFace(null)}
              />
            ))}
          </Box>
        </Stack>
      )}
    </Stack>
  );
};
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
    isSettingsOpen,
    openSettings,
  } = useGallery();
  const {
    photoInfo,
    suggestedPhotoInfo,
    isPreviewingSuggestion,
    activeDiff,
    isSaving,
    saveError,
    editMode,
    setEditMode,
    face,
    setFace,
    setEvents,
    setTeam: setPhotoTeams,
    setAlbum,
    setPhotographer,
    setPerson: setPhotoPersons,
    resetDraft,
    loadSuggestionIntoEditor,
    dismissSuggestion,
    buildSuggestionPreviewUrl,
    saveToFlickr,
  } = usePhotoInfo();
  const { isAuthenticated } = useFlickrAuth();
  const notify = useNotify();
  const [otherMenuAnchor, setOtherMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

  // Automatically prompt once per session to add a Flickr admin token when
  // opening a `?suggest=` preview link without credentials. Dismissing the
  // dialog leaves the full suggestion preview working cleanly in read-only mode.
  useEffect(() => {
    if (!isPreviewingSuggestion || isAuthenticated || isSettingsOpen) {
      return;
    }
    try {
      if (window.sessionStorage.getItem(TOKEN_PROMPT_SESSION_KEY) === "true") {
        return;
      }
      window.sessionStorage.setItem(TOKEN_PROMPT_SESSION_KEY, "true");
    } catch {
      // Ignore storage access errors in private mode
    }
    openSettings();
  }, [isPreviewingSuggestion, isAuthenticated, isSettingsOpen, openSettings]);

  const photoLink = `${FLICKR_IMAGE_PREFIX}${photo.id}`;
  const tags = serializePhotoInfo(photoInfo).join(", ");
  const previewUrl = buildSuggestionPreviewUrl();
  const emailSubject = `Photo info update ${photo.id}`;
  const emailBody = [
    `Photo link: ${photoLink}`,
    `Gallery link: ${window.location.href}`,
    previewUrl ? `Preview suggestion: ${previewUrl}` : null,
    `Tags: ${tags}`,
  ]
    .filter(Boolean)
    .join("\n\n");
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
    navigator.clipboard.writeText(tags);
    notify("New tags copied to clipboard", "success");
  };

  const handleCopyPreviewLink = () => {
    setOtherMenuAnchor(null);
    if (!previewUrl) return;
    navigator.clipboard.writeText(previewUrl);
    notify("Suggestion preview link copied to clipboard", "success");
  };

  const handleSaveToFlickr = async (targetInfo: PhotoInfo) => {
    const result = await saveToFlickr(targetInfo);
    if (result.ok) {
      notify("Tags updated on Flickr", "success");
    }
  };
  const sortedPersons = photoInfo
    ? [...photoInfo.person].sort(
        (a, b) => (a.position?.left ?? 0) - (b.position?.left ?? 0),
      )
    : [];

  return (
    <Box
      ref={ref}
      component="aside"
      aria-label="Photo details"
      sx={{
        width: desktop ? 360 : "100%",
        flexShrink: 0,
        height: "100%",
        overflowY: "auto",
        bgcolor: "background.default",
        borderLeft: desktop ? "1px solid rgba(255,255,255,0.12)" : "none",
        borderTop: desktop ? "none" : "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!desktop && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 1,
            pb: 0.25,
            flexShrink: 0,
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
          {editMode
            ? "Edit tags"
            : isPreviewingSuggestion
              ? "Suggested changes"
              : "Info"}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Tooltip
            title={
              isAuthenticated
                ? "Flickr admin connected (Settings)"
                : "Flickr write settings"
            }
          >
            <IconButton
              size="small"
              color={isAuthenticated ? "success" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                openSettings();
              }}
              aria-label="Flickr settings"
            >
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

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

          {!editMode && !isPreviewingSuggestion && onCloseSidebar && (
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

      <Stack spacing={2.5} sx={{ p: 2, flex: 1 }}>
        {saveError && <Alert severity="error">{saveError}</Alert>}

        {!photoInfo ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={28} />
            <Skeleton variant="rounded" height={28} />
            <Skeleton variant="rounded" height={48} />
          </Stack>
        ) : isPreviewingSuggestion && suggestedPhotoInfo && activeDiff ? (
          <Stack spacing={2}>
            <Alert severity="info">
              Reviewing suggested tag changes. Green tags/boxes will be added;
              red dashed ones will be removed.
            </Alert>

            <Paper
              variant="outlined"
              sx={{ p: 1.5, bgcolor: "background.paper" }}
            >
              <SuggestionDiffView diff={activeDiff} setFace={setFace} />
            </Paper>

            <Stack spacing={1}>
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <CheckCircleOutlinedIcon />
                    )
                  }
                  disabled={isSaving || !activeDiff.hasChanges}
                  onClick={() => {
                    void handleSaveToFlickr(suggestedPhotoInfo);
                  }}
                  fullWidth
                >
                  {isSaving
                    ? "Saving to Flickr..."
                    : "Approve & Save to Flickr"}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<SettingsOutlinedIcon />}
                  onClick={openSettings}
                  fullWidth
                >
                  Add Flickr token to approve
                </Button>
              )}

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={loadSuggestionIntoEditor}
                  fullWidth
                >
                  Edit first
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={dismissSuggestion}
                  fullWidth
                >
                  Dismiss
                </Button>
              </Stack>
            </Stack>
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

            {activeDiff?.hasChanges && (
              <Paper
                variant="outlined"
                sx={{ p: 1.5, bgcolor: "background.paper" }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">Preview changes</Typography>
                  <Button
                    size="small"
                    startIcon={<RestoreIcon />}
                    onClick={resetDraft}
                  >
                    Reset
                  </Button>
                </Stack>
                <SuggestionDiffView diff={activeDiff} setFace={setFace} />
              </Paper>
            )}

            <Divider />

            <Stack spacing={1}>
              {isAuthenticated && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  disabled={isSaving || !activeDiff?.hasChanges}
                  onClick={() => {
                    void handleSaveToFlickr(photoInfo);
                  }}
                  fullWidth
                >
                  {isSaving ? "Saving to Flickr..." : "Save to Flickr"}
                </Button>
              )}

              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant={isAuthenticated ? "outlined" : "contained"}
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
                <MenuItem
                  onClick={handleCopyPreviewLink}
                  disabled={!previewUrl}
                >
                  <ListItemIcon>
                    <LinkIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Copy suggestion preview link</ListItemText>
                </MenuItem>
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
                {sortedPersons.map((person) => {
                  const isHighlighted = face?.name === person.name;
                  return (
                    <Chip
                      key={getPersonTagKey(person)}
                      label={person.name}
                      size="small"
                      icon={person.position ? <FaceIcon /> : undefined}
                      color={isHighlighted ? "warning" : "default"}
                      variant={isHighlighted ? "filled" : "outlined"}
                      clickable
                      onMouseEnter={() => setFace(person)}
                      onMouseLeave={() => setFace(null)}
                      onClick={() => filterByPerson(person.name)}
                    />
                  );
                })}
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
