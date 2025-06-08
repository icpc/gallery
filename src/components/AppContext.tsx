import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import useMediaQuery from "@mui/material/useMediaQuery";

import { DEFAULT_EVENT, LAST_YEAR } from "../consts";
import { AppContextData, AppContextType } from "../types";
import { getEventData, getPeopleData, getTeamData } from "../utils/DataLoader";

/**
 * The default context object for AppContext.
 */
const defaultContext: AppContextData = {
  year: LAST_YEAR,
  event: null,
  text: null,
  person: null,
  team: null,
  fullscreenPhotoId: null,
  slideShow: false,
};

const AppContext = createContext<AppContextType | null>(null);

function parseSearchParams(
  searchParams: URLSearchParams,
): Partial<AppContextData> {
  const searchParamsData: Partial<AppContextData> = {};
  if (searchParams.has("photo")) {
    searchParamsData.fullscreenPhotoId = searchParams.get("photo");
  }
  if (searchParams.has("slideshow")) {
    searchParamsData.slideShow = searchParams.get("slideshow") === "true";
  }
  if (searchParams.has("query")) {
    searchParamsData.text = decodeURIComponent(searchParams.get("query") || "");
    searchParamsData.year = null;
  } else {
    if (searchParams.has("album")) {
      searchParamsData.year = decodeURIComponent(
        searchParams.get("album") || "",
      );
    }
    if (searchParams.has("event")) {
      searchParamsData.event = decodeURIComponent(
        searchParams.get("event") || "",
      );
    } else if (searchParams.has("team")) {
      searchParamsData.team = decodeURIComponent(
        searchParams.get("team") || "",
      );
    } else if (searchParams.has("person")) {
      searchParamsData.person = decodeURIComponent(
        searchParams.get("person") || "",
      );
    } else {
      searchParamsData.event = DEFAULT_EVENT;
    }
  }
  return searchParamsData;
}

function serializeSearchParams(data: AppContextData): Record<string, string> {
  const { year, event, text, person, team, fullscreenPhotoId, slideShow } =
    data;
  const searchParams: Record<string, string> = {};
  if (year != null) {
    searchParams.album = year;
  }
  if (event != null) {
    searchParams.event = event;
  }
  if (person != null) {
    searchParams.person = person;
  }
  if (team != null) {
    searchParams.team = team;
  }
  if (text != null) {
    searchParams.query = text;
  }
  if (fullscreenPhotoId != null) {
    searchParams.photo = fullscreenPhotoId;
  }
  if (slideShow) {
    searchParams.slideshow = "true";
  }
  return searchParams;
}

function attachYearIfNull(data: AppContextData): AppContextData {
  return {
    ...data,
    year: data.year || LAST_YEAR,
  };
}

interface Props {
  children: ReactNode;
}

const AppContextProvider: FC<Props> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<AppContextData>({
    ...defaultContext,
    ...parseSearchParams(searchParams),
  });

  const desktop = useMediaQuery("(min-width: 900px)");
  const mobile = !desktop;

  const [isOpenMenu, setIsOpenMenu] = useState(desktop);

  const isSlideShow = data.slideShow;

  useEffect(() => {
    if (desktop) {
      setIsOpenMenu(true);
    } else {
      setIsOpenMenu(false);
    }
  }, [desktop]);

  useEffect(() => {
    setSearchParams(serializeSearchParams(data));
  }, [data, setSearchParams]);

  /**
   * Sets the year.
   * This function removes all other data from the context.
   */
  const setYear = (newYear: string) => {
    setData({
      ...defaultContext,
      year: newYear,
      event: DEFAULT_EVENT,
    });
  };

  const setText = (newText: string) => {
    setData((prevState) => {
      return {
        ...prevState,
        year: null,
        event: null,
        text: newText,
        person: null,
        team: null,
      };
    });
  };

  const setEvent = (newEvent: string) => {
    setData((prevState) => {
      return attachYearIfNull({
        ...prevState,
        event: newEvent,
        text: null,
        person: null,
        team: null,
      });
    });
  };

  const setPerson = (newPerson: string) => {
    setData((prevState) => {
      return attachYearIfNull({
        ...prevState,
        event: null,
        text: null,
        person: newPerson,
        team: null,
      });
    });
  };

  const setTeam = (newTeam: string) => {
    setData((prevState) => {
      return attachYearIfNull({
        ...prevState,
        event: null,
        text: null,
        person: null,
        team: newTeam,
      });
    });
  };

  const setFullscreenPhotoId = (newFullscreenPhotoId: string | null) => {
    setData((prevState) => {
      return {
        ...prevState,
        fullscreenPhotoId: newFullscreenPhotoId,
      };
    });
  };

  const setIsSlideShow = (newIsSlideShow: boolean) => {
    setData((prevState) => {
      return {
        ...prevState,
        slideShow: newIsSlideShow,
      };
    });
  };

  const [events, setEvents] = useState<string[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;

    getEventData(data.year).then((eventsData) => {
      if (!isCancelled) {
        setEvents(eventsData);
      }
    });

    getPeopleData(data.year).then((peopleData) => {
      if (!isCancelled) {
        setPeople(peopleData);
      }
    });

    getTeamData(data.year).then((teamData) => {
      if (!isCancelled) {
        setTeams(teamData);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [data.year]);

  return (
    <AppContext.Provider
      value={{
        data,
        setYear,
        setEvent,
        setText,
        setPerson,
        setTeam,
        setFullscreenPhotoId,
        isSlideShow,
        setIsSlideShow,
        isOpenMenu,
        setIsOpenMenu,
        desktop,
        mobile,
        events,
        people,
        teams,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined || context === null) {
    throw new Error("useAppContext must be called within AppContextProvider");
  }
  return context;
};

export { AppContextProvider, useAppContext };
