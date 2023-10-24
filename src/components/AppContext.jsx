import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";

import { DEFAULT_EVENT, LAST_YEAR } from "../consts";
import { getEventData, getPeopleData, getTeamData } from "../Util/DataLoader";

/**
 * Data for the entire app.
 * Exactly one of event, text, person, team should be non-null at the same time.
 * If query is not null, team should be null.
 * @typedef {Object} DefaultContext
 * @property {string|null} year
 * @property {string|null} event
 * @property {string|null} text
 * @property {string|null} person
 * @property {string|null} team
 * @property {string|null} fullscreenPhotoId
 * @property {boolean} slideShow
 */

/**
 * The default context object for AppContext.
 * @type {DefaultContext}
 */
const defaultContext = {
    year: LAST_YEAR,
    event: null,
    text: null,
    person: null,
    team: null,
    fullscreenPhotoId: null,
    slideShow: false,
};

const AppContext = createContext(null);

function parseSearchParams(searchParams) {
    let searchParamsData = {};
    if (searchParams.has("photo")) {
        searchParamsData.fullscreenPhotoId = searchParams.get("photo");
    }
    if (searchParams.has("slideshow")) {
        searchParamsData.slideShow = searchParams.get("slideshow");
    }
    if (searchParams.has("query")) {
        searchParamsData.text = decodeURIComponent(searchParams.get("query"));
        searchParamsData.year = null;
    } else {
        if (searchParams.has("album")) {
            searchParamsData.year = decodeURIComponent(searchParams.get("album"));
        }
        if (searchParams.has("event")) {
            searchParamsData.event = decodeURIComponent(searchParams.get("event"));
        } else if (searchParams.has("team")) {
            searchParamsData.team = decodeURIComponent(searchParams.get("team"));
        } else if (searchParams.has("person")) {
            searchParamsData.person = decodeURIComponent(searchParams.get("person"));
        } else {
            searchParamsData.event = DEFAULT_EVENT;
        }
    }
    return searchParamsData;
}

function serializeSearchParams({ year, event, text, person, team, fullscreenPhotoId, slideShow }) {
    let searchParams = {};
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
        searchParams.slideshow = true;
    }
    return searchParams;
}

function attachYearIfNull(data) {
    if (!data.year) {
        data.year = LAST_YEAR;
    }
    return data;
}


const AppContextProvider = ({ children }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    /**
     * The state object and its setter function for AppContext.
     * @typedef {Object} AppState
     * @property {DefaultContext} data.
     * @property {function} setData - Setter function for the data object. Try not to use this directly.
     */
    const [data, setData] = useState({
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
        setSearchParams(
            serializeSearchParams(data));
    }, [data, setSearchParams]);

    /**
     * Sets the year.
     * This function removes all other data from the context.
     */
    const setYear = (newYear) => {
        setData({
            ...defaultContext,
            year: newYear,
            event: DEFAULT_EVENT,
        });
    };

    const setText = (newText) => {
        setData(prevState => {
            return attachYearIfNull({
                ...prevState,
                year: null,
                event: null,
                text: newText,
                person: null,
                team: null,
            });
        });
    };

    const setEvent = (newEvent) => {
        setData(prevState => {
            return attachYearIfNull({
                ...prevState,
                event: newEvent,
                text: null,
                person: null,
                team: null,
            });
        });
    };

    const setPerson = (newPerson) => {
        setData(prevState => {
            return attachYearIfNull({
                ...prevState,
                event: null,
                text: null,
                person: newPerson,
                team: null,
            });
        });
    };

    const setTeam = (newTeam) => {
        setData(prevState => {
            return attachYearIfNull({
                ...prevState,
                event: null,
                text: null,
                person: null,
                team: newTeam,
            });
        });
    };

    const setFullscreenPhotoId = (newFullscreenPhotoId) => {
        setData(prevState => {
            return {
                ...prevState,
                fullscreenPhotoId: newFullscreenPhotoId,
            };
        });
    };

    const setIsSlideShow = (newIsSlideShow) => {
        setData(prevState => {
            return {
                ...prevState,
                slideShow: newIsSlideShow,
            };
        });
    };

    const [events, setEvents] = useState([]);
    const [people, setPeople] = useState([]);
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        let isCancelled = false;

        getEventData(data.year)
            .then(eventsData => {
                if (!isCancelled) {
                    setEvents(eventsData);
                }
            });

        getPeopleData(data.year)
            .then(peopleData => {
                if (!isCancelled) {
                    setPeople(peopleData);
                }
            });

        getTeamData(data.year)
            .then(teamData => {
                if (!isCancelled) {
                    setTeams(teamData);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [data.year]);

    return (<AppContext.Provider value={{
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
        teams
    }}>
        {children}
    </AppContext.Provider>);
};

/**
 * The provider component for the AppContext object.
 * @function AppContextProvider
 * @returns {{
 *  data: DefaultContext,
 *  setYear: function,
 *  setEvent: function,
 *  setText: function,
 *  setPerson: function,
 *  setTeam: function,
 *  setFullscreenPhotoId: function,
 *  isSlideShow: boolean,
 *  setIsSlideShow: function,
 *  isOpenMenu: boolean,
 *  setIsOpenMenu: function,
 *  desktop: boolean,
 *  mobile: boolean,
 *  teams: Array,
 *  people: Array,
 *  events: Array,
 * }}.
 */
const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined || context === null) {
        throw new Error("useAppContext must be called within AppContextProvider");
    }
    return context;
};

export { AppContextProvider, useAppContext };
