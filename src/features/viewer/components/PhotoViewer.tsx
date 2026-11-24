import { Box, Dialog } from "@mui/material";
import {
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import {
  DEFAULT_SLIDESHOW_INTERVAL_MS,
  useSlideshow,
} from "@/features/viewer/hooks/useSlideshow";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import {
  computeMobileInfoHeight,
  type Dimensions,
  MOBILE_TOOLBAR_OFFSET_PX,
  resolveDismissSnap,
  resolveSheetSnap,
} from "@/features/viewer/utils/imageFit";
import { useLocalStorageBoolean } from "@/shared/hooks/useLocalStorage";
import type { Photo } from "@/types/gallery";
import { PhotoInfoSidebar } from "./PhotoInfoSidebar";
import { PhotoStage } from "./PhotoStage";
import { PhotoViewerToolbar } from "./PhotoViewerToolbar";

const DESKTOP_INFO_STORAGE_KEY = "gallery:infoSidebarOpen";
const DESKTOP_SIDEBAR_WIDTH = 360;
const SLIDESHOW_IDLE_HIDE_MS = 2500;
const SIDEBAR_DRAG_DEADZONE_PX = 8;
const DISMISS_EXIT_MS = 180;

type VerticalDragIntent = "sheet" | "dismiss" | null;

interface SidebarDragState {
  startX: number;
  startY: number;
  lastY: number;
  lastTime: number;
  velocityY: number;
  startedInHeader: boolean;
  dragging: boolean;
}

interface PhotoViewerProps {
  photo: Photo;
  prevPhoto?: Photo | null;
  nextPhoto?: Photo | null;
  activeIndex: number | null;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: (wrap?: boolean) => void;
  onClose: () => void;
}

/**
 * Unified Material UI fullscreen photo viewer for desktop, mobile, and slideshow.
 *
 * Uses ONE shared component tree (`PhotoViewerToolbar` + `PhotoStage` +
 * `PhotoInfoSidebar`) whose flex direction adapts cleanly by viewport:
 * - Desktop (Google Photos style): horizontal split with a collapsible right
 *   info sidebar (open/closed state persisted in `localStorage`) and
 *   hover-revealed edge navigation buttons.
 * - Mobile (Google Photos style): full-height photo by default with swipe
 *   navigation, pull-down-to-dismiss back to the gallery, pinned floating top
 *   toolbar, and a continuously draggable bottom info sheet that attaches flush
 *   beneath the photo with zero gap.
 */
export const PhotoViewer: FC<PhotoViewerProps> = ({
  photo,
  prevPhoto = null,
  nextPhoto = null,
  activeIndex,
  totalItems,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}) => {
  const { data, desktop, isSlideShow, setIsSlideShow } = useGallery();
  const { editMode, setEditMode } = usePhotoInfo();

  const [desktopInfoOpen, setDesktopInfoOpen] = useLocalStorageBoolean(
    DESKTOP_INFO_STORAGE_KEY,
    false,
  );
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [dismissDragY, setDismissDragY] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const [viewerSize, setViewerSize] = useState<Dimensions>(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));
  const [slideshowControlsVisible, setSlideshowControlsVisible] =
    useState(true);

  const viewerRef = useRef<HTMLDivElement>(null);
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarDragRef = useRef<SidebarDragState | null>(null);
  const verticalIntentRef = useRef<VerticalDragIntent>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const wheelDeltaRef = useRef(0);
  const wheelResetTimerRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearDismissTimer, [clearDismissTimer]);

  useEffect(() => {
    const element = viewerRef.current;
    if (!element) {
      return;
    }
    const updateSize = () => {
      setViewerSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (editMode && isSlideShow) {
      setIsSlideShow(false);
    }
  }, [editMode, isSlideShow, setIsSlideShow]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: photo.id resets info panel scroll and transient drag on photo change
  useEffect(() => {
    clearDismissTimer();
    verticalIntentRef.current = null;
    setDragHeight(null);
    setDismissDragY(0);
    setIsDismissing(false);
    sidebarRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [photo.id, clearDismissTimer]);

  // Viewer-owned keyboard shortcuts (ArrowLeft / ArrowRight / Space / Escape)
  useEffect(() => {
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
          if (!editMode) onPrev();
          break;
        case "ArrowRight":
          if (!editMode) onNext(false);
          break;
        case " ":
          if (!editMode) {
            e.preventDefault();
            setIsSlideShow(!isSlideShow);
          }
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editMode, isSlideShow, onPrev, onNext, setIsSlideShow, onClose]);

  // Auto-hide toolbar and cursor during slideshow after mouse inactivity
  const bumpSlideshowActivity = useCallback(() => {
    if (!isSlideShow) return;
    setSlideshowControlsVisible(true);
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setSlideshowControlsVisible(false);
    }, SLIDESHOW_IDLE_HIDE_MS);
  }, [isSlideShow]);

  useEffect(() => {
    if (!isSlideShow) {
      setSlideshowControlsVisible(true);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }
    bumpSlideshowActivity();
    return () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [isSlideShow, bumpSlideshowActivity]);

  const handleSlideshowAdvance = useCallback(() => {
    onNext(true);
  }, [onNext]);

  const intervalMs = data.slideshowSpeed
    ? data.slideshowSpeed * 1000
    : DEFAULT_SLIDESHOW_INTERVAL_MS;

  useSlideshow({
    active: isSlideShow,
    paused: editMode,
    totalItems,
    resetKey: activeIndex ?? photo.id,
    onAdvance: handleSlideshowAdvance,
    intervalMs,
  });

  const handleToggleSlideshow = useCallback(() => {
    setIsSlideShow(!isSlideShow);
  }, [isSlideShow, setIsSlideShow]);

  const handleToggleInfo = useCallback(() => {
    setDragHeight(null);
    if (desktop) {
      setDesktopInfoOpen((prev) => !prev);
    } else {
      setMobileInfoOpen((prev) => !prev);
    }
  }, [desktop, setDesktopInfoOpen]);

  const infoOpen = desktop ? desktopInfoOpen : mobileInfoOpen;
  const showSidebar = !isSlideShow && (infoOpen || editMode);
  const showNavArrows = desktop && !isSlideShow && !editMode;
  const hideSlideshowChrome = isSlideShow && !slideshowControlsVisible;

  const targetMobileInfoHeight = computeMobileInfoHeight(
    viewerSize.width,
    viewerSize.height,
    photo.src.width,
    photo.src.height,
  );
  const isDraggingSheet = !desktop && dragHeight !== null;
  const activeMobileInfoHeight = isDraggingSheet
    ? dragHeight
    : showSidebar
      ? targetMobileInfoHeight
      : 0;
  const mobileOpenProgress =
    targetMobileInfoHeight > 0
      ? Math.min(
          1,
          Math.max(0, activeMobileInfoHeight / targetMobileInfoHeight),
        )
      : showSidebar
        ? 1
        : 0;
  const stagePaddingTop = !desktop
    ? Math.round(MOBILE_TOOLBAR_OFFSET_PX * mobileOpenProgress)
    : 0;
  const sheetVisible = isDraggingSheet ? dragHeight > 0 : showSidebar;
  const sheetOpacity = isDraggingSheet
    ? Math.min(1, mobileOpenProgress * 2.5)
    : showSidebar
      ? 1
      : 0;

  const isDraggingDismiss = !desktop && dismissDragY > 0 && !isDismissing;
  const dismissDistance = Math.max(viewerSize.height, 400) * 0.45;
  const dismissProgress = isDismissing
    ? 1
    : Math.min(1, Math.max(0, dismissDragY / dismissDistance));
  const stageTranslateY = isDismissing
    ? Math.round(dismissDistance)
    : dismissDragY;
  const stageScale = isDismissing ? 0.82 : 1 - dismissProgress * 0.14;
  const stageOpacity = isDismissing ? 0 : 1;
  const backdropOpacity = isDismissing
    ? 0
    : isDraggingDismiss
      ? Math.max(0.08, 1 - dismissProgress * 0.92)
      : 1;
  const toolbarOpacity =
    hideSlideshowChrome || isDismissing
      ? 0
      : isDraggingDismiss
        ? Math.max(0, 1 - dismissProgress * 2.5)
        : 1;

  const handleStageDragMove = useCallback(
    (deltaY: number) => {
      if (desktop || editMode || isDismissing) {
        return;
      }

      if (verticalIntentRef.current === null) {
        if (showSidebar) {
          if (!isSlideShow && targetMobileInfoHeight > 0) {
            verticalIntentRef.current = "sheet";
          }
        } else if (deltaY > 0) {
          verticalIntentRef.current = "dismiss";
        } else if (deltaY < 0 && !isSlideShow && targetMobileInfoHeight > 0) {
          verticalIntentRef.current = "sheet";
        }
      }

      if (verticalIntentRef.current === "dismiss") {
        setDismissDragY(Math.max(0, deltaY));
        return;
      }

      if (
        verticalIntentRef.current !== "sheet" ||
        isSlideShow ||
        targetMobileInfoHeight <= 0
      ) {
        return;
      }

      const startHeight = showSidebar ? targetMobileInfoHeight : 0;
      const nextHeight = Math.max(
        0,
        Math.min(targetMobileInfoHeight, startHeight - deltaY),
      );
      setDragHeight(nextHeight);
    },
    [
      desktop,
      editMode,
      isDismissing,
      isSlideShow,
      showSidebar,
      targetMobileInfoHeight,
    ],
  );

  const handleStageDragEnd = useCallback(
    (deltaY: number, velocityY: number) => {
      const intent = verticalIntentRef.current;
      verticalIntentRef.current = null;

      if (desktop || editMode || isDismissing) {
        setDragHeight(null);
        setDismissDragY(0);
        return;
      }

      if (intent === "dismiss") {
        if (resolveDismissSnap(deltaY, viewerSize.height, velocityY)) {
          const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (prefersReducedMotion) {
            setDismissDragY(0);
            onClose();
            return;
          }
          setIsDismissing(true);
          clearDismissTimer();
          dismissTimerRef.current = window.setTimeout(() => {
            dismissTimerRef.current = null;
            onClose();
          }, DISMISS_EXIT_MS);
        } else {
          setDismissDragY(0);
        }
        return;
      }

      if (intent !== "sheet" || isSlideShow || targetMobileInfoHeight <= 0) {
        setDragHeight(null);
        return;
      }

      const startHeight = showSidebar ? targetMobileInfoHeight : 0;
      const currentHeight = Math.max(
        0,
        Math.min(targetMobileInfoHeight, startHeight - deltaY),
      );
      const shouldOpen = resolveSheetSnap(
        currentHeight,
        targetMobileInfoHeight,
        showSidebar,
        velocityY,
      );
      setMobileInfoOpen(shouldOpen);
      setDragHeight(null);
    },
    [
      desktop,
      editMode,
      isDismissing,
      isSlideShow,
      showSidebar,
      targetMobileInfoHeight,
      viewerSize.height,
      clearDismissTimer,
      onClose,
    ],
  );

  const handleStageDragCancel = useCallback(() => {
    verticalIntentRef.current = null;
    setDragHeight(null);
    setDismissDragY(0);
  }, []);

  useEffect(
    () => () => {
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
    },
    [],
  );

  const handleStageWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (desktop || isSlideShow || editMode) {
        return;
      }
      wheelDeltaRef.current += e.deltaY;
      if (wheelResetTimerRef.current !== null) {
        window.clearTimeout(wheelResetTimerRef.current);
      }
      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelDeltaRef.current = 0;
        wheelResetTimerRef.current = null;
      }, 150);

      if (wheelDeltaRef.current >= 15) {
        wheelDeltaRef.current = 0;
        setMobileInfoOpen(true);
      } else if (wheelDeltaRef.current <= -15) {
        wheelDeltaRef.current = 0;
        setMobileInfoOpen(false);
      }
    },
    [desktop, isSlideShow, editMode],
  );

  // Attach a native non-passive `touchmove` listener to the mobile info drawer
  // so pulling down (from the header anywhere, or from the scrollable body when
  // at scrollTop <= 1) can call `preventDefault()` and drag the sheet smoothly
  // without the browser hijacking it for pull-to-refresh or `touchcancel`.
  useEffect(() => {
    const wrapper = sidebarWrapperRef.current;
    if (!wrapper || desktop || editMode || !showSidebar) {
      sidebarDragRef.current = null;
      return;
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        sidebarDragRef.current = null;
        return;
      }
      const scrollBody = sidebarRef.current;
      const startedInHeader = !(
        scrollBody &&
        e.target instanceof Node &&
        scrollBody.contains(e.target)
      );
      if (!startedInHeader && (scrollBody?.scrollTop ?? 0) > 1) {
        sidebarDragRef.current = null;
        return;
      }
      const touch = e.touches[0];
      if (touch) {
        sidebarDragRef.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          lastY: touch.clientY,
          lastTime: performance.now(),
          velocityY: 0,
          startedInHeader,
          dragging: false,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const drag = sidebarDragRef.current;
      if (!drag || e.touches.length !== 1 || targetMobileInfoHeight <= 0) {
        return;
      }
      const touch = e.touches[0];
      if (!touch) {
        return;
      }
      const dx = touch.clientX - drag.startX;
      const dy = touch.clientY - drag.startY;
      const now = performance.now();
      const dt = now - drag.lastTime;
      if (dt > 0) {
        const instantVelocity = (touch.clientY - drag.lastY) / dt;
        drag.velocityY =
          drag.velocityY === 0
            ? instantVelocity
            : drag.velocityY * 0.4 + instantVelocity * 0.6;
        drag.lastY = touch.clientY;
        drag.lastTime = now;
      }

      if (!drag.dragging) {
        if (!drag.startedInHeader && (sidebarRef.current?.scrollTop ?? 0) > 1) {
          sidebarDragRef.current = null;
          return;
        }
        if (Math.hypot(dx, dy) < SIDEBAR_DRAG_DEADZONE_PX) {
          return;
        }
        if (dy > 0 && Math.abs(dy) >= Math.abs(dx)) {
          drag.dragging = true;
        } else {
          // Scrolling down through info content — hand off to native scroll
          sidebarDragRef.current = null;
          return;
        }
      }

      if (e.cancelable) {
        e.preventDefault();
      }
      const nextHeight = Math.max(
        0,
        Math.min(targetMobileInfoHeight, targetMobileInfoHeight - dy),
      );
      setDragHeight(nextHeight);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const drag = sidebarDragRef.current;
      sidebarDragRef.current = null;
      if (
        !drag?.dragging ||
        e.changedTouches.length !== 1 ||
        targetMobileInfoHeight <= 0
      ) {
        return;
      }
      const touch = e.changedTouches[0];
      if (!touch) {
        setDragHeight(null);
        return;
      }
      const dy = touch.clientY - drag.startY;
      const currentHeight = Math.max(
        0,
        Math.min(targetMobileInfoHeight, targetMobileInfoHeight - dy),
      );
      const shouldOpen = resolveSheetSnap(
        currentHeight,
        targetMobileInfoHeight,
        true,
        drag.velocityY,
      );
      setMobileInfoOpen(shouldOpen);
      setDragHeight(null);
    };

    const onTouchCancel = () => {
      const wasDragging = sidebarDragRef.current?.dragging ?? false;
      sidebarDragRef.current = null;
      if (wasDragging) {
        setDragHeight(null);
      }
    };

    wrapper.addEventListener("touchstart", onTouchStart, { passive: true });
    wrapper.addEventListener("touchmove", onTouchMove, { passive: false });
    wrapper.addEventListener("touchend", onTouchEnd, { passive: true });
    wrapper.addEventListener("touchcancel", onTouchCancel, { passive: true });
    return () => {
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
      wrapper.removeEventListener("touchend", onTouchEnd);
      wrapper.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [desktop, editMode, showSidebar, targetMobileInfoHeight]);

  const handleSidebarWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (desktop || editMode || (sidebarRef.current?.scrollTop ?? 0) > 1) {
        return;
      }
      if (e.deltaY <= -15) {
        setMobileInfoOpen(false);
      }
    },
    [desktop, editMode],
  );

  return (
    <Dialog
      open
      fullScreen
      hideBackdrop
      onClose={(_event, reason) => {
        if (reason !== "escapeKeyDown") {
          onClose();
        }
      }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            bgcolor: "transparent",
            backgroundImage: "none",
            boxShadow: "none",
            borderRadius: 0,
            overflow: "hidden",
            overscrollBehavior: "none",
          },
        },
      }}
    >
      <Box
        ref={viewerRef}
        onMouseMove={bumpSlideshowActivity}
        onTouchStart={bumpSlideshowActivity}
        sx={{
          display: "flex",
          flexDirection: desktop ? "row" : "column",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          overscrollBehavior: "none",
          bgcolor: `rgba(0, 0, 0, ${backdropOpacity})`,
          transition: isDraggingDismiss
            ? "none"
            : `background-color ${isDismissing ? DISMISS_EXIT_MS : 220}ms cubic-bezier(0.2, 0, 0, 1)`,
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
          },
          cursor: hideSlideshowChrome ? "none" : "default",
        }}
      >
        <Box
          onWheel={handleStageWheel}
          sx={{
            position: "relative",
            flex: "1 1 0%",
            minWidth: 0,
            minHeight: 0,
            pt: `${stagePaddingTop}px`,
            boxSizing: "border-box",
            display: "flex",
            transition: isDraggingSheet
              ? "none"
              : "padding-top 220ms cubic-bezier(0.2, 0, 0, 1)",
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 3,
              opacity: toolbarOpacity,
              pointerEvents:
                hideSlideshowChrome || isDraggingDismiss || isDismissing
                  ? "none"
                  : "auto",
              transition: isDraggingDismiss ? "none" : "opacity 180ms ease",
            }}
          >
            <PhotoViewerToolbar
              photo={photo}
              activeIndex={activeIndex}
              totalItems={totalItems}
              isSlideShow={isSlideShow}
              editMode={editMode}
              infoOpen={showSidebar}
              onClose={onClose}
              onToggleSlideshow={handleToggleSlideshow}
              onToggleInfo={handleToggleInfo}
              onExitEdit={() => setEditMode(false)}
            />
          </Box>

          <Box
            sx={{
              flex: "1 1 0%",
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              transform:
                stageTranslateY > 0 || isDismissing
                  ? `translate3d(0, ${stageTranslateY}px, 0) scale(${stageScale})`
                  : "none",
              opacity: stageOpacity,
              transition: isDraggingDismiss
                ? "none"
                : `transform ${isDismissing ? DISMISS_EXIT_MS : 220}ms cubic-bezier(0.2, 0, 0, 1), opacity ${DISMISS_EXIT_MS}ms ease`,
              willChange: !desktop ? "transform, opacity" : "auto",
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          >
            <PhotoStage
              photo={photo}
              prevPhoto={prevPhoto}
              nextPhoto={nextPhoto}
              showNavArrows={showNavArrows}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={onPrev}
              onNext={() => onNext(false)}
              onVerticalDragMove={!desktop ? handleStageDragMove : undefined}
              onVerticalDragEnd={!desktop ? handleStageDragEnd : undefined}
              onVerticalDragCancel={
                !desktop ? handleStageDragCancel : undefined
              }
              hideFaces={isSlideShow}
            />
          </Box>
        </Box>

        <Box
          ref={sidebarWrapperRef}
          aria-hidden={!sheetVisible}
          onWheel={handleSidebarWheel}
          sx={{
            flexShrink: 0,
            overflow: "hidden",
            overscrollBehavior: "contain",
            width: desktop ? (showSidebar ? DESKTOP_SIDEBAR_WIDTH : 0) : "100%",
            height: desktop ? "100%" : activeMobileInfoHeight,
            opacity: sheetOpacity,
            visibility: sheetVisible ? "visible" : "hidden",
            transition: isDraggingSheet
              ? "none"
              : desktop
                ? showSidebar
                  ? "width 220ms cubic-bezier(0.2, 0, 0, 1), opacity 180ms ease"
                  : "width 220ms cubic-bezier(0.2, 0, 0, 1), opacity 160ms ease, visibility 0ms linear 220ms"
                : showSidebar
                  ? "height 220ms cubic-bezier(0.2, 0, 0, 1), opacity 180ms ease"
                  : "height 220ms cubic-bezier(0.2, 0, 0, 1), opacity 160ms ease, visibility 0ms linear 220ms",
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        >
          <PhotoInfoSidebar
            ref={sidebarRef}
            photo={photo}
            desktop={desktop}
            onCloseSidebar={handleToggleInfo}
          />
        </Box>
      </Box>
    </Dialog>
  );
};
