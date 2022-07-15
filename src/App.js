import {useEffect, useState} from 'react'
import MainLayout from "./components/MainLayout";
import "./styles/App.css"
import {AppContext} from "./components/AppContext";
import {current_year} from "./consts";
import { useSearchParams } from "react-router-dom";

function App() {
    const [year, setYear] = useState(current_year);
    const [event, setEvent] = useState("Photo Tour");
    const [team, setTeam] = useState("");
    const [person, setPerson] = useState("");
    const [text, setText] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.has('album')) {
            setYear(searchParams.get('album').replaceAll("+", " "))
        }
        if (searchParams.has('event')) {
            setEvent(searchParams.get('event').replaceAll("+", " "))
        }
        if (searchParams.has('team')) {
            setEvent("");
            setTeam(searchParams.get('team').replaceAll("+", " "))
        }
        if (searchParams.has('person')) {
            setEvent("");
            setPerson(searchParams.get('person').replaceAll("+", " "))
        }
        if (searchParams.has('query')) {
            setEvent("");
            setText(searchParams.get('query').replaceAll("+", " "))
        }
    }, [])

    return (
        <AppContext.Provider value={{
            year,
            setYear,
            event,
            setEvent,
            team,
            setTeam,
            person,
            setPerson,
            text,
            setText
        }}>
            <MainLayout setSearchParams={setSearchParams}/>
        </AppContext.Provider>
    );
}

export default App;
