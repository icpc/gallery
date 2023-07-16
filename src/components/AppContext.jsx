import { createContext, useCallback, useContext, useState, useEffect } from 'react'
import { DEFAULT_EVENT, LAST_YEAR } from '../consts';
import { useSearchParams } from 'react-router-dom';

/**
 * Data for the entire app. 
 * Exactly one of event, text, person, team should be non-null at the same time. 
 * If query is not null, team should be null.
 * @typedef {Object} DefaultContext
 * @property {string|null} year - The year.
 * @property {string|null} event - The event.
 * @property {string|null} text - The text.
 * @property {string|null} person - The person.
 * @property {string|null} team - The team.
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
    team: null
}

const AppContext = createContext(null);


function parseSearchParams(searchParams) {
    let searchParamsData = {};
    if (searchParams.has('query')) {
        searchParamsData.text = decodeURIComponent(searchParams.get('query'));
        searchParamsData.year = null;
    } else {
        if (searchParams.has('album')) {
            searchParamsData.year = decodeURIComponent(searchParams.get('album'));
        }
        if (searchParams.has('event')) {
            searchParamsData.event = decodeURIComponent(searchParams.get('event'));
        } else if (searchParams.has('team')) {
            searchParamsData.team = decodeURIComponent(searchParams.get('team'));
        } else if (searchParams.has('person')) {
            searchParamsData.person = decodeURIComponent(searchParams.get('person'));
        } else {
            searchParamsData.event = DEFAULT_EVENT;
        }
    }
    return searchParamsData;
}

function serizalizeSearchParams(year, event, text, person, team) {
    let searchParams = {};
    if (year) {
        searchParams.album = year;
    }
    if (event) {
        searchParams.event = event;
    }
    if (person) {
        searchParams.person = person;
    }
    if (team) {
        searchParams.team = team;
    }
    if (text) {
        searchParams.query = text;
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

    useEffect(() => {
        setSearchParams(serizalizeSearchParams(data.year, data.event, data.text, data.person, data.team));
    }, [data.year, data.event, data.text, data.person, data.team, setSearchParams]);

    /**
     * Sets the year.
     * This function removes all other data from the context.
     */
    const setYear = useCallback((newYear) => {
        setData({
            ...defaultContext,
            year: newYear,
            event: DEFAULT_EVENT,
        })
    }, []);

    const setText = useCallback((newText) => {
        setData({
            ...data,
            year: null,
            event: null,
            text: newText,
            person: null,
            team: null,
        })
    }, [data]);

    const setEvent = useCallback((newEvent) => {
        setData(
            attachYearIfNull({
                ...data,
                event: newEvent,
                text: null,
                person: null,
                team: null,
            })
        )
    }, [data]);


    const setPerson = useCallback((newPerson) => {
        setData(
            attachYearIfNull({
                ...data,
                event: null,
                text: null,
                person: newPerson,
                team: null,
            })
        )
    }, [data]);

    const setTeam = useCallback((newTeam) => {
        setData(
            attachYearIfNull({
                ...data,
                event: null,
                text: null,
                person: null,
                team: newTeam,
            })
        )
    }, [data]);

    return (<AppContext.Provider value={{
        data,
        setYear,
        setEvent,
        setText,
        setPerson,
        setTeam,
    }}>
        {children}
    </AppContext.Provider>)
}

/**
 * The provider component for the AppContext object.
 * @function AppContextProvider
 * @param {Object} props.
 * @param {React.ReactNode} props.children.
 * @returns {{
 *  data: DefaultContext,
 *  setYear: function,
 *  setEvent: function,
 *  setText: function,
 *  setPerson: function,
 *  setTeam: function,
 * }}.
 */
const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined || context === null) {
        throw new Error(`useAppContext must be called within AppContextProvider`)
    }
    return context
}

export { useAppContext, AppContextProvider };