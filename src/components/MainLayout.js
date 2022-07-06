import React, {useEffect, useState} from "react";
import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";
import {current_year} from "../consts";


export const MainLayout = () => {
    const [year, setYear] = useState(current_year);
    const [event, setEvent] = useState("Photo Tour");
    const [team, setTeam] = useState("");
    const [person, setPerson] = useState("");

   /* useEffect(() => {
            const dataYear = localStorage.getItem("year");
            if (dataYear) {
                console.log("lol")
                setYear(dataYear);
            }
            const dataEvent = localStorage.getItem("event");
            if (dataEvent) {
                setEvent(dataEvent);
            }
            const dataTeam = localStorage.getItem("team");
            if (dataTeam) {
                setTeam(dataTeam);
            }
            const dataPerson = localStorage.getItem("person");
            if (dataPerson) {
                setPerson(dataPerson);
            }
        }, []
    );

    useEffect(() => {
        localStorage.setItem("year", year);
        localStorage.setItem("event", event);
        localStorage.setItem("team", team);
        localStorage.setItem("person", person);
        console.log(localStorage)
        console.log(localStorage.getItem("year"))
        console.log(event)
        console.log(team)
        console.log(localStorage.getItem("person"))
    }, [team, person, event, year])
*/

    return <div style={{width: "100%", height: "100%"}}>
        <Header year={year} event={event} team={team} person={person} setYear={setYear} setEvent={setEvent} setTeam={setTeam} setPerson={setPerson}/>
        <Body year={year} event={event} team={team} person={person} />
        <Footer/>
    </div>;
};

export default MainLayout;
