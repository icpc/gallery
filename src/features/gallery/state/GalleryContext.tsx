import useMediaQuery from "@mui/material/useMediaQuery";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router";
import {
  DEFAULT_EVENT,
  getEventData,
  getPeopleData,
  getTeamData,
  LAST_YEAR,
} from "@/config/gallery";
import type { GalleryContextValue, GalleryFilterState } from "@/types/gallery";

const defaultState: GalleryFilterState = {
  year: LAST_YEAR,
  event: null,
  text: null,
  person: null,
  team: null,
  fullscreenPhotoId: null,
  slideShow: false,
};

const GalleryContext = createContext<GalleryContextValue | null>(null);

function parseSearchParams(
  searchParams: URLSearchParams,
): Partial<GalleryFilterState> {
  const parsed: Partial<GalleryFilterState> = {};
  if (searchParams.has("photo")) {
    parsed.fullscreenPhotoId = searchParams.get("photo");
  }
  if (searchParams.has("slideshow")) {
    parsed.slideShow = searchParams.get("slideshow") === "true";
  }
  if (searchParams.has("slideshowSpeed")) {
    const sec = Number.parseFloat(searchParams.get("slideshowSpeed") || "");
    if (!Number.isNaN(sec) && sec > 0) {
      parsed.slideshowSpeed = sec;
    }
  }
  if (searchParams.has("query")) {
    parsed.text = decodeURIComponent(searchParams.get("query") || "");
    parsed.year = null;
  } else {
    if (searchParams.has("album")) {
      parsed.year = decodeURIComponent(searchParams.get("album") || "");
    }
    if (searchParams.has("event")) {
      parsed.event = decodeURIComponent(searchParams.get("event") || "");
    } else if (searchParams.has("team")) {
      parsed.team = decodeURIComponent(searchParams.get("team") || "");
    } else if (searchParams.has("person")) {
      parsed.person = decodeURIComponent(searchParams.get("person") || "");
    } else {
      parsed.event = DEFAULT_EVENT;
    }
  }
  return parsed;
}

function serializeSearchParams(
  data: GalleryFilterState,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (data.year != null) params.album = data.year;
  if (data.event != null) params.event = data.event;
  if (data.person != null) params.person = data.person;
  if (data.team != null) params.team = data.team;
  if (data.text != null) params.query = data.text;
  if (data.fullscreenPhotoId != null) params.photo = data.fullscreenPhotoId;
  if (data.slideShow) params.slideshow = "true";
  if (data.slideshowSpeed != null && data.slideshowSpeed > 0) {
    params.slideshowSpeed = String(data.slideshowSpeed);
  }
  return params;
}

function attachYearIfNull(state: GalleryFilterState): GalleryFilterState {
  if (state.year === null) {
    return { ...state, year: LAST_YEAR };
  }
  return state;
}

export const GalleryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const desktop = useMediaQuery("(min-width:900px)");
  const mobile = !desktop;

  const [isOpenMenu, setIsOpenMenu] = useState(desktop);
  const [data, setData] = useState<GalleryFilterState>(() => ({
    ...defaultState,
    ...parseSearchParams(searchParams),
  }));

  useEffect(() => {
    setSearchParams(serializeSearchParams(data));
  }, [data, setSearchParams]);

  useEffect(() => {
    setIsOpenMenu(desktop);
  }, [desktop]);

  const setYear = useCallback((newYear: string) => {
    setData((prev) => ({
      ...prev,
      year: newYear,
      event: null,
      text: null,
      person: null,
      team: null,
    }));
  }, []);

  const setText = useCallback((newText: string) => {
    setData((prev) => ({
      ...prev,
      year: null,
      event: null,
      text: newText,
      person: null,
      team: null,
    }));
  }, []);

  const setEvent = useCallback((newEvent: string) => {
    setData((prev) =>
      attachYearIfNull({
        ...prev,
        event: newEvent,
        text: null,
        person: null,
        team: null,
      }),
    );
  }, []);

  const setPerson = useCallback((newPerson: string) => {
    setData((prev) =>
      attachYearIfNull({
        ...prev,
        event: null,
        text: null,
        person: newPerson,
        team: null,
      }),
    );
  }, []);

  const setTeam = useCallback((newTeam: string) => {
    setData((prev) =>
      attachYearIfNull({
        ...prev,
        event: null,
        text: null,
        person: null,
        team: newTeam,
      }),
    );
  }, []);

  const setFullscreenPhotoId = useCallback((id: string | null) => {
    setData((prev) => ({ ...prev, fullscreenPhotoId: id }));
  }, []);

  const setIsSlideShow = useCallback((enabled: boolean) => {
    setData((prev) => ({ ...prev, slideShow: enabled }));
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ["events", data.year],
    queryFn: () => getEventData(data.year),
    enabled: !!data.year,
  });

  const { data: people = [] } = useQuery({
    queryKey: ["people", data.year],
    queryFn: () => getPeopleData(data.year),
    enabled: !!data.year,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams", data.year],
    queryFn: () => getTeamData(data.year),
    enabled: !!data.year,
  });

  const value = useMemo<GalleryContextValue>(
    () => ({
      data,
      setYear,
      setEvent,
      setText,
      setPerson,
      setTeam,
      setFullscreenPhotoId,
      isSlideShow: data.slideShow,
      setIsSlideShow,
      isOpenMenu,
      setIsOpenMenu,
      desktop,
      mobile,
      events,
      people,
      teams,
    }),
    [
      data,
      setYear,
      setEvent,
      setText,
      setPerson,
      setTeam,
      setFullscreenPhotoId,
      setIsSlideShow,
      isOpenMenu,
      desktop,
      mobile,
      events,
      people,
      teams,
    ],
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
};

export function useGallery(): GalleryContextValue {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be called within GalleryProvider");
  }
  return context;
}
