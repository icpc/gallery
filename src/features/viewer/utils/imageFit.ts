export interface Dimensions {
  width: number;
  height: number;
}

export const MOBILE_TOOLBAR_OFFSET_PX = 56;
const MIN_MOBILE_INFO_RATIO = 0.55;
const MIN_MOBILE_PHOTO_HEIGHT_PX = 80;
const FLICK_VELOCITY_PX_PER_MS = 0.35;

/**
 * Computes the largest image dimensions that fit inside `container` while
 * preserving the natural aspect ratio. Never returns negative or NaN values.
 */
export function fitDimensions(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  containerHeight: number,
): Dimensions {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { width: 0, height: 0 };
  }
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: containerWidth, height: containerHeight };
  }

  const ratio = Math.min(
    containerWidth / naturalWidth,
    containerHeight / naturalHeight,
  );
  return {
    width: Math.floor(naturalWidth * ratio),
    height: Math.floor(naturalHeight * ratio),
  };
}

/**
 * Computes the mobile bottom info drawer height (in px) so the info panel
 * attaches flush beneath the photo with zero bottom black gap, while reserving
 * room for the pinned top toolbar and keeping at least 55% of the viewport for
 * the info drawer.
 */
export function computeMobileInfoHeight(
  viewerWidth: number,
  viewerHeight: number,
  photoWidth: number,
  photoHeight: number,
): number {
  if (viewerWidth <= 0 || viewerHeight <= 0) {
    return 0;
  }
  const minInfoHeight = viewerHeight * MIN_MOBILE_INFO_RATIO;
  if (photoWidth <= 0 || photoHeight <= 0) {
    return Math.round(minInfoHeight);
  }
  const fullWidthPhotoHeight = viewerWidth * (photoHeight / photoWidth);
  const idealStageHeight = fullWidthPhotoHeight + MOBILE_TOOLBAR_OFFSET_PX;
  const maxInfoHeight = Math.max(
    0,
    viewerHeight - (MOBILE_TOOLBAR_OFFSET_PX + MIN_MOBILE_PHOTO_HEIGHT_PX),
  );
  const flushInfoHeight = viewerHeight - idealStageHeight;
  return Math.round(
    Math.min(maxInfoHeight, Math.max(minInfoHeight, flushInfoHeight)),
  );
}

/**
 * Decides whether a continuously dragged mobile info drawer should snap open
 * or closed on release, combining gesture velocity (px/ms, negative = upward)
 * with drag distance.
 */
export function resolveSheetSnap(
  currentHeight: number,
  maxHeight: number,
  wasOpen: boolean,
  velocityY: number,
): boolean {
  if (maxHeight <= 0) {
    return false;
  }
  if (velocityY <= -FLICK_VELOCITY_PX_PER_MS) {
    return true;
  }
  if (velocityY >= FLICK_VELOCITY_PX_PER_MS) {
    return false;
  }
  const threshold = wasOpen ? maxHeight * 0.65 : maxHeight * 0.3;
  return currentHeight >= threshold;
}
