import React, {useEffect, useState} from 'react';
import MySelect from "./MySelect";
import {current_year, years} from "../consts";
import axios from "axios";

const Seleclor = ({year, event, team, person, setYear, setEvent, setTeam, setPerson}) => {

    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [people, setPeople] = useState([]);


    useEffect(() => {
        getMenu()
    }, [year]);

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function parseOptions(a) {
        return a.split(',').filter(x => x.length > 0).filter(onlyUnique);
    }

    function getOptionObj(a) {
        return a.map(x => {return {label: x, value: x}});
    }

    async function getMenu() {
        const response = await axios.get(`http://localhost:3000/${year}.html`);
        const menu = response.data;
        const split = menu.split("\n", 3);
        setPerson("");
        setEvent("Photo Tour");
        setTeam("");
        setEvents(parseOptions(split[0]));
        setTeams(parseOptions(split[1]));
        setPeople(parseOptions(split[2]));
    }


    return (
        <div>
            <div>
                {year}
                {event}
                {team}
            </div>
            <MySelect options={getOptionObj(years)} onChange={selectedYear => setYear(selectedYear.label)} name={"Select year"} value={year}/>
            <MySelect options={getOptionObj(events)} onChange={selectedEvent => setEvent(selectedEvent.label)} name={"Select event"} value={event}/>
            <MySelect options={getOptionObj(teams)} onChange={selectedTeam => setTeam(selectedTeam.label)} name={"Select team"} value={team}/>
            <MySelect options={getOptionObj(people)} onChange={selectedPerson => setPerson(selectedPerson.label)} name={"Select person"} value={person}/>
        </div>
    );
};

export default Seleclor;