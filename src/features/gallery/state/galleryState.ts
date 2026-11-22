import type { GalleryFilterState } from "@/types/gallery";

export function parseGallerySearchParams(
  searchParams: URLSearchParams,
  lastYear: string,
  defaultEvent: string,
): GalleryFilterState {
  const fullscreenPhotoId = searchParams.get("photo");
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
  if (data.slideShow) params.set("slideshow", "true");
  if (data.slideshowSpeed != null && data.slideshowSpeed > 0) {
    params.set("slideshowSpeed", String(data.slideshowSpeed));
  }

  if (extraParams) {
    for (const preservedKey of ["suggest", "settings"]) {
      const value = extraParams.get(preservedKey);
      if (value !== null) {
        params.set(preservedKey, value);
      }
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
    },
    lastYear,
  );
}
