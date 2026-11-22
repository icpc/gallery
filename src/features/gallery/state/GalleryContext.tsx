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
import {
  parseGallerySearchParams,
  selectEvent,
  selectPerson,
  selectTeam,
  selectText,
  selectYear,
  serializeGallerySearchParams,
} from "./galleryState";

const GalleryContext = createContext<GalleryContextValue | null>(null);

export const GalleryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const desktop = useMediaQuery("(min-width:900px)");
  const mobile = !desktop;

  const [isOpenMenu, setIsOpenMenu] = useState(desktop);

  // URL searchParams is the single source of truth so browser Back/Forward works natively.
  const data = useMemo(
    () => parseGallerySearchParams(searchParams, LAST_YEAR, DEFAULT_EVENT),
    [searchParams],
  );

  useEffect(() => {
    setIsOpenMenu(desktop);
  }, [desktop]);

  const updateState = useCallback(
    (
      updater: (prev: GalleryFilterState) => GalleryFilterState,
      replace = false,
    ) => {
      setSearchParams(
        (prevParams) => {
          const prevState = parseGallerySearchParams(
            prevParams,
            LAST_YEAR,
            DEFAULT_EVENT,
          );
          return serializeGallerySearchParams(updater(prevState), prevParams);
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const { data: events = [] } = useQuery({
    queryKey: ["events", data.year],
    queryFn: () => getEventData(data.year),
    enabled: Boolean(data.year),
  });

  const { data: people = [] } = useQuery({
    queryKey: ["people", data.year],
    queryFn: () => getPeopleData(data.year),
    enabled: Boolean(data.year),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams", data.year],
    queryFn: () => getTeamData(data.year),
    enabled: Boolean(data.year),
  });

  const setYear = useCallback(
    (newYear: string) => updateState((prev) => selectYear(prev, newYear)),
    [updateState],
  );

  const setText = useCallback(
    (newText: string) => updateState((prev) => selectText(prev, newText)),
    [updateState],
  );

  const setEvent = useCallback(
    (newEvent: string) =>
      updateState((prev) => selectEvent(prev, newEvent, LAST_YEAR)),
    [updateState],
  );

  const setPerson = useCallback(
    (newPerson: string) =>
      updateState((prev) => selectPerson(prev, newPerson, LAST_YEAR)),
    [updateState],
  );

  const setTeam = useCallback(
    (newTeam: string) =>
      updateState((prev) => selectTeam(prev, newTeam, LAST_YEAR)),
    [updateState],
  );

  const setFullscreenPhotoId = useCallback(
    (id: string | null, options?: { replace?: boolean }) => {
      updateState(
        (prev) => ({ ...prev, fullscreenPhotoId: id }),
        options?.replace ?? false,
      );
    },
    [updateState],
  );

  const setIsSlideShow = useCallback(
    (enabled: boolean) => {
      updateState((prev) => ({ ...prev, slideShow: enabled }), true);
    },
    [updateState],
  );

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
