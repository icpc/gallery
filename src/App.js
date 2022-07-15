import {useEffect, useState} from 'react'
import MainLayout from "./components/MainLayout";
import "./styles/App.css"
import {AppContext} from "./components/AppContext";
import {current_year} from "./consts";

function App() {
    const [year, setYear] = useState(current_year);
    const [event, setEvent] = useState("Photo Tour");
    const [team, setTeam] = useState("");
    const [person, setPerson] = useState("");
    const [text, setText] = useState("");

  /*  useEffect(() => {
        if (localStorage.getItem('year')) {
            setYear(localStorage.getItem('year'))
        }
        if (localStorage.getItem('event')) {
            setEvent(localStorage.getItem('event'))
        }
        if (localStorage.getItem('team')) {
            setTeam(localStorage.getItem('team'))
        }
        if (localStorage.getItem('person')) {
            setPerson(localStorage.getItem('person'))
        }
        if (localStorage.getItem('text')) {
            setText(localStorage.getItem('text'))
        }
    }, [])

*/
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
            <MainLayout/>
        </AppContext.Provider>
    );
}

export default App;
