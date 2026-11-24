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
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import {
  applyEdgeResistance,
  type Dimensions,
  fitDimensions,
  resolveHorizontalSnap,
} from "@/features/viewer/utils/imageFit";
import { useSwipeNavigation } from "@/shared/hooks/useSwipeNavigation";
import type { Person, Photo } from "@/types/gallery";
import { FaceBox } from "./FaceBox";

const filterOptions = createFilterOptions<string>({ limit: 200 });
const SLIDE_GAP_PX = 16;
const SLIDE_SNAP_MS = 220;

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

function buildCandidateUrls(photo: Photo): string[] {
  const urls: string[] = [];
  if (photo.src.url) {
    urls.push(photo.src.url);
  }
  for (let i = photo.sources.length - 1; i >= 0; i -= 1) {
    const candidate = photo.sources[i]?.url;
    if (candidate && !urls.includes(candidate)) {
      urls.push(candidate);
    }
  }
  return urls;
}

const AdjacentSlide: FC<{
  photo: Photo;
  containerSize: Dimensions;
  side: "prev" | "next";
}> = ({ photo, containerSize, side }) => {
  const [loadedPhotoId, setLoadedPhotoId] = useState<string | null>(null);
  const previewUrl = pickPreviewUrl(photo);
  const isLoaded = loadedPhotoId === photo.id;
  const fitted = fitDimensions(
    photo.src.width,
    photo.src.height,
    containerSize.width,
    containerSize.height,
  );

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left:
          side === "prev"
            ? `calc(-100% - ${SLIDE_GAP_PX}px)`
            : `calc(100% + ${SLIDE_GAP_PX}px)`,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
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
        {previewUrl && (
          <Box
            component="img"
            key={`adj-preview-${photo.id}`}
            src={previewUrl}
            alt=""
            draggable={false}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
        <Box
          component="img"
          key={`adj-${photo.id}`}
          src={photo.src.url}
          alt=""
          draggable={false}
          decoding="async"
          onLoad={() => setLoadedPhotoId(photo.id)}
          sx={{
            position: "relative",
            display: "block",
            width: fitted.width > 0 ? fitted.width : "auto",
            height: fitted.height > 0 ? fitted.height : "auto",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            opacity: isLoaded ? 1 : 0,
          }}
        />
      </Box>
    </Box>
  );
};

interface HorizontalSnapState {
  targetX: number;
  direction: "next" | "prev" | null;
}

interface PhotoStageProps {
  photo: Photo;
  prevPhoto?: Photo | null;
  nextPhoto?: Photo | null;
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
  prevPhoto = null,
  nextPhoto = null,
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
  const mainImgRef = useRef<HTMLImageElement>(null);
  const [containerSize, setContainerSize] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [loadedMeta, setLoadedMeta] = useState<{
    photoId: string;
    url: string;
    size: Dimensions;
  } | null>(null);
  const [fallbackState, setFallbackState] = useState<{
    photoId: string;
    index: number;
  }>({ photoId: photo.id, index: 0 });
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [horizontalDragX, setHorizontalDragX] = useState(0);
  const [horizontalSnap, setHorizontalSnap] =
    useState<HorizontalSnapState | null>(null);

  const horizontalSnapRef = useRef<HorizontalSnapState | null>(null);
  const snapTimerRef = useRef<number | null>(null);

  const clearSnapTimer = useCallback(() => {
    if (snapTimerRef.current !== null) {
      window.clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }
  }, []);

  const commitHorizontalSnap = useCallback(() => {
    clearSnapTimer();
    const pending = horizontalSnapRef.current;
    if (!pending) {
      return;
    }
    horizontalSnapRef.current = null;
    setHorizontalSnap(null);
    setHorizontalDragX(0);
    if (pending.direction === "next") {
      onNext();
    } else if (pending.direction === "prev") {
      onPrev();
    }
  }, [clearSnapTimer, onNext, onPrev]);

  useEffect(() => clearSnapTimer, [clearSnapTimer]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: photo.id intentionally resets transient crop and horizontal swipe state on photo change
  useEffect(() => {
    setCrop(undefined);
    clearSnapTimer();
    horizontalSnapRef.current = null;
    setHorizontalSnap(null);
    setHorizontalDragX(0);
  }, [photo.id, clearSnapTimer]);

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

  const candidateUrls = buildCandidateUrls(photo);
  const activeFallbackIndex =
    fallbackState.photoId === photo.id ? fallbackState.index : 0;
  const activeUrl = candidateUrls[activeFallbackIndex] ?? photo.src.url;

  const currentLoadedSize =
    loadedMeta?.photoId === photo.id && loadedMeta.url === activeUrl
      ? loadedMeta.size
      : null;
  const isFullResLoaded =
    loadedMeta?.photoId === photo.id && loadedMeta.url === activeUrl;
  const previewUrl = pickPreviewUrl(photo);

  useEffect(() => {
    const img = mainImgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoadedMeta({
        photoId: photo.id,
        url: activeUrl,
        size: {
          width: img.naturalWidth,
          height: img.naturalHeight,
        },
      });
    }
  }, [photo.id, activeUrl]);

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
      url: activeUrl,
      size: {
        width: img.naturalWidth,
        height: img.naturalHeight,
      },
    });
  };

  const handleImageError = () => {
    if (activeFallbackIndex + 1 < candidateUrls.length) {
      setFallbackState({
        photoId: photo.id,
        index: activeFallbackIndex + 1,
      });
    }
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

  const isCarouselActive = !desktop && !editMode;

  const handleGestureStart = useCallback(() => {
    if (horizontalSnapRef.current !== null) {
      commitHorizontalSnap();
    }
  }, [commitHorizontalSnap]);

  const handleHorizontalDragMove = useCallback(
    (deltaX: number) => {
      if (!isCarouselActive) {
        return;
      }
      clearSnapTimer();
      horizontalSnapRef.current = null;
      setHorizontalSnap(null);
      setHorizontalDragX(applyEdgeResistance(deltaX, hasPrev, hasNext));
    },
    [isCarouselActive, clearSnapTimer, hasPrev, hasNext],
  );

  const handleHorizontalDragEnd = useCallback(
    (deltaX: number, velocityX: number) => {
      if (!isCarouselActive) {
        setHorizontalDragX(0);
        return;
      }
      const direction = resolveHorizontalSnap(
        deltaX,
        containerSize.width,
        hasPrev,
        hasNext,
        velocityX,
      );
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion || containerSize.width <= 0) {
        setHorizontalDragX(0);
        if (direction === "next") onNext();
        else if (direction === "prev") onPrev();
        return;
      }

      const stride = containerSize.width + SLIDE_GAP_PX;
      const targetX =
        direction === "next" ? -stride : direction === "prev" ? stride : 0;
      const nextSnap: HorizontalSnapState = { targetX, direction };
      horizontalSnapRef.current = nextSnap;
      setHorizontalSnap(nextSnap);
      clearSnapTimer();
      snapTimerRef.current = window.setTimeout(
        commitHorizontalSnap,
        SLIDE_SNAP_MS + 40,
      );
    },
    [
      isCarouselActive,
      containerSize.width,
      hasPrev,
      hasNext,
      onNext,
      onPrev,
      clearSnapTimer,
      commitHorizontalSnap,
    ],
  );

  const handleHorizontalDragCancel = useCallback(() => {
    clearSnapTimer();
    horizontalSnapRef.current = null;
    setHorizontalSnap(null);
    setHorizontalDragX(0);
  }, [clearSnapTimer]);

  const swipeHandlers = useSwipeNavigation({
    enabled: !editMode,
    onNext: () => {
      if (hasNext) onNext();
    },
    onPrev: () => {
      if (hasPrev) onPrev();
    },
    onGestureStart: isCarouselActive ? handleGestureStart : undefined,
    onHorizontalDragMove: isCarouselActive
      ? handleHorizontalDragMove
      : undefined,
    onHorizontalDragEnd: isCarouselActive ? handleHorizontalDragEnd : undefined,
    onHorizontalDragCancel: isCarouselActive
      ? handleHorizontalDragCancel
      : undefined,
    onVerticalDragMove,
    onVerticalDragEnd,
    onVerticalDragCancel,
  });

  const infoMatchesPhoto = data.fullscreenPhotoId === photo.id;
  const trackOffsetX = horizontalSnap
    ? horizontalSnap.targetX
    : horizontalDragX;

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
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === "transform") {
            commitHorizontalSnap();
          }
        }}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform:
            trackOffsetX !== 0
              ? `translate3d(${trackOffsetX}px, 0, 0)`
              : "none",
          transition: horizontalSnap
            ? `transform ${SLIDE_SNAP_MS}ms cubic-bezier(0.2, 0, 0, 1)`
            : "none",
          willChange: isCarouselActive ? "transform" : "auto",
        }}
      >
        {isCarouselActive && prevPhoto && (
          <AdjacentSlide
            photo={prevPhoto}
            containerSize={containerSize}
            side="prev"
          />
        )}

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
              ref={mainImgRef}
              key={`${photo.id}-${activeUrl}`}
              src={activeUrl}
              alt={`Gallery item ${photo.id}`}
              draggable={false}
              onLoad={handleImageLoad}
              onError={handleImageError}
              sx={{
                position: "relative",
                display: "block",
                width: fitted.width > 0 ? fitted.width : "auto",
                height: fitted.height > 0 ? fitted.height : "auto",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                opacity: isFullResLoaded ? 1 : 0,
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

        {isCarouselActive && nextPhoto && (
          <AdjacentSlide
            photo={nextPhoto}
            containerSize={containerSize}
            side="next"
          />
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
