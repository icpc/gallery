import { useEffect, useRef } from "react";

export const DEFAULT_SLIDESHOW_INTERVAL_MS = 5000;

export interface SlideshowGuardInput {
  active: boolean;
  paused: boolean;
  totalItems: number;
}

export function shouldRunSlideshow({
  active,
  paused,
  totalItems,
}: SlideshowGuardInput): boolean {
  if (!active || paused) {
    return false;
  }
  return totalItems > 1;
}

interface UseSlideshowOptions extends SlideshowGuardInput {
  resetKey: number | string | null;
  onAdvance: () => void;
  intervalMs?: number;
}

export function useSlideshow({
  active,
  paused,
  totalItems,
  resetKey,
  onAdvance,
  intervalMs = DEFAULT_SLIDESHOW_INTERVAL_MS,
}: UseSlideshowOptions): void {
  const onAdvanceRef = useRef(onAdvance);

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  const running = shouldRunSlideshow({ active, paused, totalItems });

  useEffect(() => {
    if (!running || resetKey === null) {
      return;
    }

    const timer = window.setInterval(() => {
      onAdvanceRef.current();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [running, resetKey, intervalMs]);
}
