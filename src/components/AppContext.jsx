import { createContext, useCallback, useContext, useState } from 'react'
import { DEFAULT_EVENT, LAST_YEAR } from '../consts';

/**
 * Data for the entire app. 
 * Exactly one of event, text, person, team should be non-null at the same time.
 * @typedef {Object} DefaultContext
 * @property {string} year - The year.
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
    event: DEFAULT_EVENT,
    text: null,
    person: null,
    team: null
}

const AppContext = createContext(null);

const AppContextProvider = ({ children }) => {
    /**
     * The state object and its setter function for AppContext.
     * @typedef {Object} AppState
     * @property {DefaultContext} data.
     * @property {function} setData - Setter function for the data object. Try not to use this directly.
     */
    const [data, setData] = useState(defaultContext);

    /**
     * Sets the year.
     * This function removes all other data from the context.
     */
    const setYear = useCallback((newYear) => {
        setData({
            ...defaultContext,
            year: newYear,
        })
    }, []);

    const setEvent = useCallback((newEvent) => {
        setData({
            ...data,
            event: newEvent,
            text: null,
            person: null,
            team: null,
        })
    }, [data]);

    const setText = useCallback((newText) => {
        setData({
            ...data,
            event: null,
            text: newText,
            person: null,
            team: null,
        })
    }, [data]);

    const setPerson = useCallback((newPerson) => {
        setData({
            ...data,
            event: null,
            text: null,
            person: newPerson,
            team: null,
        })
    }, [data]);

    const setTeam = useCallback((newTeam) => {
        setData({
            ...data,
            event: null,
            text: null,
            person: null,
            team: newTeam,
        })
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