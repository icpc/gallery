import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { FC } from "react";
import { FLICKR_IMAGE_PREFIX } from "@/config/gallery";
import type { Photo } from "@/types/gallery";

interface PhotoViewerToolbarProps {
  photo: Photo;
  activeIndex: number | null;
  totalItems: number;
  isSlideShow: boolean;
  editMode: boolean;
  infoOpen: boolean;
  onClose: () => void;
  onToggleSlideshow: () => void;
  onToggleInfo: () => void;
  onExitEdit: () => void;
}

const iconButtonSx = {
  color: "common.white",
  bgcolor: "rgba(0, 0, 0, 0.25)",
  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.55)" },
};

/**
 * Floating translucent gradient toolbar overlaid on top of the full-height photo
 * stage (Google Photos Web style) so the photo fills 100% vertical height.
 */
export const PhotoViewerToolbar: FC<PhotoViewerToolbarProps> = ({
  photo,
  activeIndex,
  totalItems,
  isSlideShow,
  editMode,
  infoOpen,
  onClose,
  onToggleSlideshow,
  onToggleInfo,
  onExitEdit,
}) => {
  const counterLabel =
    activeIndex !== null && totalItems > 0
      ? `${activeIndex + 1} / ${totalItems}`
      : null;

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 1.5, sm: 2 },
        pt: 1.25,
        pb: 3,
        background:
          "linear-gradient(to bottom, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.25) 60%, rgba(0, 0, 0, 0) 100%)",
        pointerEvents: "none",
        "& button, & a, & .MuiChip-root": {
          pointerEvents: "auto",
        },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Tooltip title="Close (Esc)">
          <IconButton
            onClick={onClose}
            aria-label="Close viewer"
            sx={iconButtonSx}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
        {!isSlideShow && counterLabel && (
          <Typography
            variant="body2"
            sx={{
              color: "common.white",
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.85)",
              px: 0.5,
            }}
          >
            {counterLabel}
          </Typography>
        )}
        {editMode && (
          <Chip
            label="Editing tags"
            color="primary"
            size="small"
            onDelete={onExitEdit}
          />
        )}
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
        {!editMode && (
          <Tooltip
            title={
              isSlideShow ? "Pause slideshow (Space)" : "Play slideshow (Space)"
            }
          >
            <IconButton
              onClick={onToggleSlideshow}
              aria-label={isSlideShow ? "Pause slideshow" : "Play slideshow"}
              sx={iconButtonSx}
            >
              {isSlideShow ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
        )}

        {!isSlideShow && !editMode && (
          <>
            <Tooltip title="Download original">
              <IconButton
                href={photo.origin ?? photo.src.url}
                download
                target="_blank"
                rel="noreferrer"
                aria-label="Download original"
                sx={iconButtonSx}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Open on Flickr">
              <IconButton
                href={`${FLICKR_IMAGE_PREFIX}${photo.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Open on Flickr"
                sx={iconButtonSx}
              >
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={infoOpen ? "Hide info" : "Show info"}>
              <IconButton
                onClick={onToggleInfo}
                aria-label={infoOpen ? "Hide info" : "Show info"}
                aria-pressed={infoOpen}
                color={infoOpen ? "primary" : "default"}
                sx={
                  infoOpen
                    ? {
                        bgcolor: "rgba(0, 0, 0, 0.45)",
                        "&:hover": { bgcolor: "rgba(0, 0, 0, 0.65)" },
                      }
                    : iconButtonSx
                }
              >
                {infoOpen ? <InfoIcon /> : <InfoOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </Stack>
  );
};
