import { type TouchEvent, useCallback, useRef } from "react";

export type SwipeDirection = "next" | "prev" | "up" | "down" | null;
export type HorizontalSwipeDirection = "next" | "prev" | null;

const MIN_HORIZONTAL_SWIPE_PX = 45;
const MIN_VERTICAL_SWIPE_PX = 32;
const HORIZONTAL_DOMINANCE_RATIO = 1.4;
const VERTICAL_DOMINANCE_RATIO = 1.2;

/**
 * Pure gesture classifier that recognizes deliberate horizontal (next/prev)
 * and vertical (up/down) swipes while ignoring short taps and ambiguous
 * diagonal drags.
 */
export function detectSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): SwipeDirection {
  const dx = endX - startX;
  const dy = endY - startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (
    absX >= MIN_HORIZONTAL_SWIPE_PX &&
    absX >= absY * HORIZONTAL_DOMINANCE_RATIO
  ) {
    return dx < 0 ? "next" : "prev";
  }
  if (
    absY >= MIN_VERTICAL_SWIPE_PX &&
    absY >= absX * VERTICAL_DOMINANCE_RATIO
  ) {
    return dy < 0 ? "up" : "down";
  }

  return null;
}

export function detectHorizontalSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): HorizontalSwipeDirection {
  const direction = detectSwipe(startX, startY, endX, endY);
  return direction === "next" || direction === "prev" ? direction : null;
}

const AXIS_LOCK_DISTANCE_PX = 8;

interface UseSwipeNavigationOptions {
  enabled: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onVerticalDragMove?: (deltaY: number) => void;
  onVerticalDragEnd?: (deltaY: number, velocityY: number) => void;
  onVerticalDragCancel?: () => void;
}

interface TouchGestureState {
  startX: number;
  startY: number;
  lastY: number;
  lastTime: number;
  velocityY: number;
  axis: "x" | "y" | null;
}

export function useSwipeNavigation({
  enabled,
  onNext,
  onPrev,
  onSwipeUp,
  onSwipeDown,
  onVerticalDragMove,
  onVerticalDragEnd,
  onVerticalDragCancel,
}: UseSwipeNavigationOptions) {
  const gestureRef = useRef<TouchGestureState | null>(null);
  const triggeredRef = useRef(false);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      triggeredRef.current = false;
      if (!enabled || e.touches.length !== 1) {
        gestureRef.current = null;
        return;
      }
      const touch = e.touches[0];
      if (touch) {
        gestureRef.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          lastY: touch.clientY,
          lastTime: performance.now(),
          velocityY: 0,
          axis: null,
        };
      }
    },
    [enabled],
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!enabled || !gesture || e.touches.length !== 1) {
        return;
      }
      const touch = e.touches[0];
      if (!touch) {
        return;
      }

      const dx = touch.clientX - gesture.startX;
      const dy = touch.clientY - gesture.startY;
      const now = performance.now();
      const dt = now - gesture.lastTime;
      if (dt > 0) {
        const instantVelocity = (touch.clientY - gesture.lastY) / dt;
        gesture.velocityY =
          gesture.velocityY === 0
            ? instantVelocity
            : gesture.velocityY * 0.4 + instantVelocity * 0.6;
        gesture.lastY = touch.clientY;
        gesture.lastTime = now;
      }

      if (onVerticalDragMove) {
        if (gesture.axis === null) {
          if (Math.hypot(dx, dy) < AXIS_LOCK_DISTANCE_PX) {
            return;
          }
          gesture.axis = Math.abs(dy) >= Math.abs(dx) ? "y" : "x";
        }
        if (gesture.axis === "y") {
          onVerticalDragMove(dy);
        }
        return;
      }

      if (triggeredRef.current) {
        return;
      }
      const direction = detectSwipe(
        gesture.startX,
        gesture.startY,
        touch.clientX,
        touch.clientY,
      );
      if (direction === "up" && onSwipeUp) {
        triggeredRef.current = true;
        onSwipeUp();
      } else if (direction === "down" && onSwipeDown) {
        triggeredRef.current = true;
        onSwipeDown();
      }
    },
    [enabled, onVerticalDragMove, onSwipeUp, onSwipeDown],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const gesture = gestureRef.current;
      const alreadyTriggered = triggeredRef.current;
      gestureRef.current = null;
      triggeredRef.current = false;
      if (!enabled || !gesture || e.changedTouches.length !== 1) {
        return;
      }
      const touch = e.changedTouches[0];
      if (!touch) {
        return;
      }

      if (gesture.axis === "y" && onVerticalDragEnd) {
        const dy = touch.clientY - gesture.startY;
        onVerticalDragEnd(dy, gesture.velocityY);
        return;
      }

      if (alreadyTriggered) {
        return;
      }
      const direction = detectSwipe(
        gesture.startX,
        gesture.startY,
        touch.clientX,
        touch.clientY,
      );
      if (direction === "next") {
        onNext();
      } else if (direction === "prev") {
        onPrev();
      } else if (direction === "up") {
        onSwipeUp?.();
      } else if (direction === "down") {
        onSwipeDown?.();
      }
    },
    [enabled, onNext, onPrev, onSwipeUp, onSwipeDown, onVerticalDragEnd],
  );

  const onTouchCancel = useCallback(() => {
    const wasDraggingY = gestureRef.current?.axis === "y";
    gestureRef.current = null;
    triggeredRef.current = false;
    if (wasDraggingY) {
      onVerticalDragCancel?.();
    }
  }, [onVerticalDragCancel]);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}
