import React, {useContext, useEffect, useState} from "react";
import Seleclor from "./Seleclor";
import Search from "./Search";
import "../../styles/Header.css"
import {AppContext} from "../AppContext";
import axios from "axios";


export const Header = ({setSearchParams}) => {
    const {data, setData} = useContext(AppContext);
    const [event, setEvent] = useState("");
    const [person, setPerson] = useState("");
    const [team, setTeam] = useState("");

    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [people, setPeople] = useState([]);


    function updData() {
        setEvent(data.event === undefined ? "" : data.event);
        setTeam(data.team === undefined ? "" : data.team);
        setPerson(data.person === undefined ? "" : data.person);
    }


    useEffect(() => {
        updData();
        if (data.year !== undefined) {
            getMenu()
        }
    }, [data.year]);


    async function getMenu() {
        const response = await axios.get(process.env.PUBLIC_URL + `/${data.year}.html`);
        const menu = response.data;
        const split = menu.split("\n", 3);
        let obj = data;
        if (data.event === undefined && data.team === undefined && data.person === undefined) {
            obj["event"] = "Photo Tour";
        }
        delete obj.text;
        setData(obj);
        setEvents(parseOptions(split[0]));
        setTeams(parseOptions(split[1]));
        setPeople(parseOptions(split[2]));
    }

    useEffect(() => {
        updData();
    }, [data])

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function parseOptions(a) {
        return a.split(',').filter(x => x.length > 0).filter(onlyUnique);
    }

    function getOptionObj(a) {
        return a.map(x => {
            return {label: x}
        });
    }

    return <div>
        <div className={"header-input-wrapper"}>
            <Seleclor options={getOptionObj(events)} setSearchParams={setSearchParams} name={"Select event"} link={`/event.svg`} func={selectedEvent => {
                setData({
                    "year": data.year,
                    "event": selectedEvent.label
                })

                setSearchParams({
                    album: data.year,
                    event: selectedEvent.label
                });
                updData();
            }} value={event}/>
            <Seleclor options={getOptionObj(teams)} setSearchParams={setSearchParams} name={"Select team"} link={`/team.svg`} func={selectedTeam => {
                setData({
                    "year": data.year,
                    "team": selectedTeam.label
                })
                setSearchParams({
                    album: data.year,
                    team: selectedTeam.label
                });
                updData();
            }} value={team}/>
            <Seleclor options={getOptionObj(people)} setSearchParams={setSearchParams} name={"Select person"} link={`/person.svg`} func={selectedPerson => {
                setData({
                    "year": data.year,
                    "person": selectedPerson.label
                })
                setSearchParams({
                    album: data.year,
                    person: selectedPerson.label
                });
                updData();
            }} value={person}/>
            <Search setSearchParams={setSearchParams}/>
        </div>
    </div>
}
export default Header;