import { Typography } from "@mui/material";
import { type FC, lazy, Suspense, useEffect, useRef } from "react";
import { useGalleryNavigation } from "@/features/gallery/hooks/useGalleryNavigation";
import { useImagePreload } from "@/features/gallery/hooks/useImagePreload";
import { usePhotoLoader } from "@/features/gallery/hooks/usePhotoLoader";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { PhotoGallery } from "./PhotoGallery";

import "../styles/GalleryBody.css";

const LazyPhotoModal = lazy(() =>
  import("@/features/viewer/components/PhotoModal").then((mod) => ({
    default: mod.PhotoModal,
  })),
);

export const GalleryBody: FC = () => {
  const {
    data,
    setFullscreenPhotoId,
    setIsSlideShow,
    desktop,
    mobile,
    setIsOpenMenu,
  } = useGallery();

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const { sequence, isLoading, error } = usePhotoLoader();

  const {
    activeIndex,
    activePhoto,
    hasPrev,
    hasNext,
    openAtIndex,
    closeViewer,
    goNext,
    goPrev,
  } = useGalleryNavigation({
    items: sequence.items,
    fullscreenPhotoId: data.fullscreenPhotoId,
    preferredSectionKey: data.event,
    setFullscreenPhotoId,
    setIsSlideShow,
  });

  useImagePreload(sequence.items, activeIndex);

  useEffect(() => {
    if (!mobile) return;
    const bodyElement = bodyRef.current;
    if (!bodyElement) return;
    const handleScroll = () => setIsOpenMenu(false);
    bodyElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      bodyElement.removeEventListener("scroll", handleScroll);
    };
  }, [mobile, setIsOpenMenu]);

  useEffect(() => {
    if (!activePhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      switch (e.key) {
        case "ArrowLeft":
          if (hasPrev) goPrev(false);
          break;
        case "ArrowRight":
          if (hasNext) goNext(false);
          break;
        case "Escape":
          closeViewer();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto, hasPrev, hasNext, goPrev, goNext, closeViewer]);

  if (isLoading) {
    return (
      <div className="body" ref={bodyRef}>
        <Typography variant="h1">Loading...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="body" ref={bodyRef}>
        <Typography variant="h1" color="error">
          Error: {error.message}
        </Typography>
      </div>
    );
  }

  return (
    <div className="body" ref={bodyRef}>
      {desktop && data.text && <h1 style={{ width: "100%" }}>{data.text}</h1>}
      <PhotoGallery sections={sequence.sections} onSelectIndex={openAtIndex} />
      {activePhoto != null && (
        <Suspense fallback={null}>
          <LazyPhotoModal
            photo={activePhoto}
            handleRotationRight={() => goNext(true)}
            handleRotationLeft={() => goPrev(true)}
            rightArrow={hasNext}
            leftArrow={hasPrev}
          />
        </Suspense>
      )}
    </div>
  );
};
