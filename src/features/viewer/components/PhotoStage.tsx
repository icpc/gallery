import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Autocomplete,
  Box,
  createFilterOptions,
  IconButton,
  Paper,
  TextField,
} from "@mui/material";
import {
  type FC,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import {
  type Dimensions,
  fitDimensions,
} from "@/features/viewer/utils/imageFit";
import { useSwipeNavigation } from "@/shared/hooks/useSwipeNavigation";
import type { Person, Photo } from "@/types/gallery";
import { FaceBox } from "./FaceBox";

const filterOptions = createFilterOptions<string>({ limit: 200 });

function pickPreviewUrl(photo: Photo): string | null {
  if (photo.sources.length === 0) {
    return null;
  }
  const winW = typeof window !== "undefined" ? window.innerWidth : 0;
  const displayPx = (winW >= 900 ? 0.5 : 2) * winW;
  const picked =
    photo.sources.findLast((source) => source.width <= displayPx) ??
    photo.sources[0];
  if (!picked || picked.url === photo.src.url) {
    return null;
  }
  return picked.url;
}

interface PhotoStageProps {
  photo: Photo;
  showNavArrows: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onVerticalDragMove?: (deltaY: number) => void;
  onVerticalDragEnd?: (deltaY: number, velocityY: number) => void;
  onVerticalDragCancel?: () => void;
  hideFaces?: boolean;
}

/**
 * Responsive photo stage shared by desktop and mobile layouts.
 * Uses ResizeObserver so toggling the desktop sidebar or resizing the viewport
 * keeps the image and FaceBox percentages pixel-accurate.
 */
export const PhotoStage: FC<PhotoStageProps> = ({
  photo,
  showNavArrows,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onVerticalDragMove,
  onVerticalDragEnd,
  onVerticalDragCancel,
  hideFaces = false,
}) => {
  const { data, desktop, people } = useGallery();
  const { photoInfo, editMode, face, setFace, appendPerson } = usePhotoInfo();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [loadedMeta, setLoadedMeta] = useState<{
    photoId: string;
    size: Dimensions;
  } | null>(null);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: photo.id intentionally resets transient crop on photo change
  useEffect(() => {
    setCrop(undefined);
  }, [photo.id]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      setContainerSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const currentLoadedSize =
    loadedMeta?.photoId === photo.id ? loadedMeta.size : null;
  const isFullResLoaded = loadedMeta?.photoId === photo.id;
  const previewUrl = pickPreviewUrl(photo);

  const naturalWidth =
    photo.src.width > 0 ? photo.src.width : (currentLoadedSize?.width ?? 0);
  const naturalHeight =
    photo.src.height > 0 ? photo.src.height : (currentLoadedSize?.height ?? 0);

  const fitted = fitDimensions(
    naturalWidth,
    naturalHeight,
    containerSize.width,
    containerSize.height,
  );

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setLoadedMeta({
      photoId: photo.id,
      size: {
        width: img.naturalWidth,
        height: img.naturalHeight,
      },
    });
  };

  const handleCreatePerson = (name: string | null, currentCrop: Crop) => {
    if (!name || fitted.width <= 0 || fitted.height <= 0) {
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setCrop(undefined);
      return;
    }
    const person: Person = {
      name: trimmed,
      position: {
        top: currentCrop.y / fitted.height,
        left: currentCrop.x / fitted.width,
        right: (currentCrop.x + currentCrop.width) / fitted.width,
        bottom: (currentCrop.y + currentCrop.height) / fitted.height,
      },
    };
    appendPerson(person);
    setCrop(undefined);
  };

  const swipeHandlers = useSwipeNavigation({
    enabled: !editMode,
    onNext: () => {
      if (hasNext) onNext();
    },
    onPrev: () => {
      if (hasPrev) onPrev();
    },
    onVerticalDragMove,
    onVerticalDragEnd,
    onVerticalDragCancel,
  });

  const infoMatchesPhoto = data.fullscreenPhotoId === photo.id;

  return (
    <Box
      ref={containerRef}
      {...swipeHandlers}
      sx={{
        position: "relative",
        flex: "1 1 0%",
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        touchAction: editMode || !desktop ? "none" : "auto",
        overscrollBehavior: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: fitted.width > 0 ? fitted.width : "auto",
          height: fitted.height > 0 ? fitted.height : "auto",
          maxWidth: "100%",
          maxHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {previewUrl && !isFullResLoaded && (
          <Box
            component="img"
            key={`preview-${photo.id}`}
            src={previewUrl}
            alt=""
            aria-hidden
            draggable={false}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        )}
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          disabled={!editMode}
          style={{ display: "block", maxWidth: "100%", maxHeight: "100%" }}
        >
          <Box
            component="img"
            key={photo.id}
            src={photo.src.url}
            alt={`Gallery item ${photo.id}`}
            draggable={false}
            onLoad={handleImageLoad}
            sx={{
              position: "relative",
              display: "block",
              width: fitted.width > 0 ? fitted.width : "auto",
              height: fitted.height > 0 ? fitted.height : "auto",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              touchAction: editMode || !desktop ? "none" : "auto",
            }}
          />
          {!hideFaces &&
            infoMatchesPhoto &&
            (photoInfo?.person ?? []).map((person) => (
              <FaceBox
                person={person}
                setFace={setFace}
                hidden={!editMode && face?.name !== person.name}
                key={`${person.name}-${person.position?.left ?? "nopos"}-${person.position?.top ?? "nopos"}`}
              />
            ))}
        </ReactCrop>

        {editMode && crop && crop.width > 4 && crop.height > 4 && (
          <Paper
            elevation={6}
            sx={{
              position: "absolute",
              left: Math.min(crop.x, Math.max(0, fitted.width - 220)),
              top: Math.min(
                crop.y + crop.height + 4,
                Math.max(0, fitted.height - 64),
              ),
              width: Math.max(crop.width, 220),
              zIndex: 10,
            }}
          >
            <Autocomplete
              filterOptions={filterOptions}
              options={people}
              freeSolo
              autoHighlight
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  autoFocus
                  placeholder="Enter a name"
                />
              )}
              onChange={(_event, newValue) =>
                handleCreatePerson(newValue, crop)
              }
            />
          </Paper>
        )}
      </Box>

      {showNavArrows && hasPrev && (
        <Box
          onClick={onPrev}
          sx={{
            position: "absolute",
            left: 0,
            top: 64,
            bottom: 0,
            width: { xs: 64, md: 96 },
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            pl: { xs: 1, md: 2 },
            cursor: "pointer",
            "& .nav-arrow": {
              opacity: 0,
              transition: "opacity 160ms ease, background-color 160ms ease",
            },
            "&:hover .nav-arrow, &:focus-within .nav-arrow": {
              opacity: 1,
            },
          }}
        >
          <IconButton
            className="nav-arrow"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous"
            size="large"
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.55)",
              color: "common.white",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
            }}
          >
            <ChevronLeftIcon fontSize="large" />
          </IconButton>
        </Box>
      )}

      {showNavArrows && hasNext && (
        <Box
          onClick={onNext}
          sx={{
            position: "absolute",
            right: 0,
            top: 64,
            bottom: 0,
            width: { xs: 64, md: 96 },
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            pr: { xs: 1, md: 2 },
            cursor: "pointer",
            "& .nav-arrow": {
              opacity: 0,
              transition: "opacity 160ms ease, background-color 160ms ease",
            },
            "&:hover .nav-arrow, &:focus-within .nav-arrow": {
              opacity: 1,
            },
          }}
        >
          <IconButton
            className="nav-arrow"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next"
            size="large"
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.55)",
              color: "common.white",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
            }}
          >
            <ChevronRightIcon fontSize="large" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
