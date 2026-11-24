export type ViewerHotkeyAction =
  | "prev"
  | "next"
  | "toggleSlideshow"
  | "close"
  | "toggleInfo"
  | "download"
  | "openFlickr"
  | "toggleEdit";

export interface ViewerKeyEventLike {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  defaultPrevented?: boolean;
}

export interface ViewerHotkeyState {
  editMode: boolean;
  isSlideShow: boolean;
}

/**
 * Resolves a keyboard event inside the fullscreen photo viewer to a viewer
 * action. Uses physical `code` for letter shortcuts so hotkeys work across
 * non-Latin keyboard layouts (e.g. Russian) as well as English.
 */
export function resolveViewerHotkey(
  event: ViewerKeyEventLike,
  state: ViewerHotkeyState,
): ViewerHotkeyAction | null {
  if (
    event.defaultPrevented ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  ) {
    return null;
  }

  const code = event.code ?? "";
  const keyLower = event.key.toLowerCase();

  if (event.key === "Escape" || code === "Escape") {
    return "close";
  }

  if (code === "KeyE" || keyLower === "e") {
    return "toggleEdit";
  }

  if (state.editMode) {
    return null;
  }

  if (event.key === "ArrowLeft" || code === "ArrowLeft") {
    return "prev";
  }
  if (event.key === "ArrowRight" || code === "ArrowRight") {
    return "next";
  }
  if (event.key === " " || code === "Space") {
    return "toggleSlideshow";
  }

  if (state.isSlideShow) {
    return null;
  }

  if (code === "KeyI" || keyLower === "i") {
    return "toggleInfo";
  }
  if (code === "KeyD" || keyLower === "d") {
    return "download";
  }
  if (code === "KeyF" || keyLower === "f") {
    return "openFlickr";
  }

  return null;
}
