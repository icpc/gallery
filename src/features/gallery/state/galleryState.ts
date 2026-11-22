import type { GalleryFilterState } from "@/types/gallery";

export function isSettingsLocation(
  pathname: string,
  searchParams: URLSearchParams,
  hash: string,
): boolean {
  if (searchParams.has("settings")) {
    const val = searchParams.get("settings");
    if (val !== "false" && val !== "0") {
      return true;
    }
  }
  const normalizedHash = hash.replace(/^#\/?/, "").toLowerCase();
  if (normalizedHash === "settings") {
    return true;
  }
  const segments = pathname.split("/").filter(Boolean);
  return segments[segments.length - 1]?.toLowerCase() === "settings";
}

export function parseGallerySearchParams(
  searchParams: URLSearchParams,
  lastYear: string,
  defaultEvent: string,
): GalleryFilterState {
  const fullscreenPhotoId = searchParams.get("photo");
  const rawSuggest = searchParams.get("suggest");
  const suggestion =
    rawSuggest && rawSuggest.trim() !== "" ? rawSuggest.trim() : null;
  const slideShow = searchParams.get("slideshow") === "true";

  const rawSpeed = searchParams.get("slideshowSpeed");
  const parsedSpeed = rawSpeed ? Number.parseFloat(rawSpeed) : Number.NaN;
  const slideshowSpeed =
    !Number.isNaN(parsedSpeed) && parsedSpeed > 0 ? parsedSpeed : undefined;

  if (searchParams.has("query")) {
    return {
      year: null,
      event: null,
      team: null,
      person: null,
      text: searchParams.get("query") || "",
      fullscreenPhotoId,
      slideShow,
      slideshowSpeed,
      suggestion,
    };
  }

  const year = searchParams.get("album") || lastYear;
  const event = searchParams.get("event");
  const team = event === null ? searchParams.get("team") : null;
  const person =
    event === null && team === null ? searchParams.get("person") : null;

  return {
    year,
    event:
      event !== null
        ? event
        : team === null && person === null
          ? defaultEvent
          : null,
    team,
    person,
    text: null,
    fullscreenPhotoId,
    slideShow,
    slideshowSpeed,
    suggestion,
  };
}

export function serializeGallerySearchParams(
  data: GalleryFilterState,
  extraParams?: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams();

  if (data.year != null) params.set("album", data.year);
  if (data.event != null) params.set("event", data.event);
  if (data.person != null) params.set("person", data.person);
  if (data.team != null) params.set("team", data.team);
  if (data.text != null) params.set("query", data.text);
  if (data.fullscreenPhotoId != null)
    params.set("photo", data.fullscreenPhotoId);
  if (data.fullscreenPhotoId != null && data.suggestion != null) {
    params.set("suggest", data.suggestion);
  }
  if (data.slideShow) params.set("slideshow", "true");
  if (data.slideshowSpeed != null && data.slideshowSpeed > 0) {
    params.set("slideshowSpeed", String(data.slideshowSpeed));
  }

  if (extraParams?.has("settings")) {
    const value = extraParams.get("settings");
    if (value !== null) {
      params.set("settings", value);
    }
  }

  return params;
}

function attachYearIfNull(
  state: GalleryFilterState,
  lastYear: string,
): GalleryFilterState {
  return state.year === null ? { ...state, year: lastYear } : state;
}

export function selectYear(
  prev: GalleryFilterState,
  year: string,
): GalleryFilterState {
  return {
    ...prev,
    year,
    event: null,
    text: null,
    person: null,
    team: null,
    fullscreenPhotoId: null,
    slideShow: false,
    suggestion: null,
  };
}

export function selectText(
  prev: GalleryFilterState,
  text: string,
): GalleryFilterState {
  return {
    ...prev,
    year: null,
    event: null,
    text,
    person: null,
    team: null,
    fullscreenPhotoId: null,
    slideShow: false,
    suggestion: null,
  };
}

export function selectEvent(
  prev: GalleryFilterState,
  event: string,
  lastYear: string,
): GalleryFilterState {
  return attachYearIfNull(
    {
      ...prev,
      event,
      text: null,
      person: null,
      team: null,
      fullscreenPhotoId: null,
      slideShow: false,
      suggestion: null,
    },
    lastYear,
  );
}

export function selectTeam(
  prev: GalleryFilterState,
  team: string,
  lastYear: string,
): GalleryFilterState {
  return attachYearIfNull(
    {
      ...prev,
      event: null,
      text: null,
      person: null,
      team,
      fullscreenPhotoId: null,
      slideShow: false,
      suggestion: null,
    },
    lastYear,
  );
}

export function selectPerson(
  prev: GalleryFilterState,
  person: string,
  lastYear: string,
): GalleryFilterState {
  return attachYearIfNull(
    {
      ...prev,
      event: null,
      text: null,
      person,
      team: null,
      fullscreenPhotoId: null,
      slideShow: false,
      suggestion: null,
    },
    lastYear,
  );
}
