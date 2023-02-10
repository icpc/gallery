import React, {useContext, useEffect, useState} from "react";
import Seleclor from "./Seleclor";
import Search from "./Search";
import "../../styles/Header.css"
import {AppContext} from "../AppContext";
import axios from "axios";
import {LAST_YEAR, places, years, DEFAULT_EVENT} from "../../consts";
import MenuIcon from '@mui/icons-material/Menu';
import "../../styles/DropdownMenu.css"
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery } from "@mui/material";


export const Header = ({setSearchParams, setIsOpenMenu, isOpenMenu}) => {
    const {data, setData} = useContext(AppContext);
    const [event, setEvent] = useState("");
    const [person, setPerson] = useState("");
    const [team, setTeam] = useState("");
    const [year, setYear] = useState("");


    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [people, setPeople] = useState([]);


    const desktop = useMediaQuery('(min-width: 900px)')

    function updData() {
        setYear(data.year === undefined ? "" : data.year);
        setEvent(data.event === undefined ? "" : data.event);
        setTeam(data.team === undefined ? "" : data.team);
        setPerson(data.person === undefined ? "" : data.person);
    }


    useEffect(() => {
        updData();
        if (data.year !== undefined) {
            getMenu(data.year)
        } else {
            getMenu(LAST_YEAR)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.year]);


    async function getMenu(year) {
        const responseEvent = await axios.get(process.env.PUBLIC_URL + `/data/existing/${year}.event`);
        const responseTeam = await axios.get(process.env.PUBLIC_URL + `/data/existing/${year}.team`);
        const responsePeople = await axios.get(process.env.PUBLIC_URL + `/data/existing/${year}.people`);

        const splitEvent = responseEvent.data.split("\n");
        const splitTeam = responseTeam.data.split("\n");
        const splitPeople = responsePeople.data.split("\n");
        let obj = data;
        if (year === data.year) {
            if (data.event === undefined && data.team === undefined && data.person === undefined) {
                obj.event = DEFAULT_EVENT;
            }
            delete obj.text;
            obj.events = splitEvent;
            obj.teams = splitTeam;
            obj.people = splitPeople;
            setData(obj);
        }
        setEvents(splitEvent);
        setTeams(splitTeam);
        setPeople(splitPeople);
    }

    useEffect(() => {
        updData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    // eslint-disable-next-line no-unused-vars
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function getOptionObj(a) {
        return a.map(x => {
            return {label: x}
        });
    }

    const setDataType = (type, element, year) => {
        if (element !== undefined) {
            setSearchParams({
                album: year,
                [type]: element
            });
            return true;
        }
        return false;
    }

    const setter = (selectedItem, type) => {
        if (type === "year") {
            let obj = data;
            obj["year"] = selectedItem.year;
            if (!setDataType("event", data.event, selectedItem.year) &&
                !setDataType("team", data.team, selectedItem.year) &&
                !setDataType("person", data.person, selectedItem.year)) {
                setDataType("event", DEFAULT_EVENT, selectedItem.year);
                obj["event"] = DEFAULT_EVENT;
                delete obj.text;
            }
            setData(obj);
        } else {
            if (data.year === undefined) {
                data.year = LAST_YEAR;
            }
            if (selectedItem === null) {
                return;
            }
            if (selectedItem === "clear") {
                setData({
                    "year": data.year,
                    "event": DEFAULT_EVENT,
                    "events": data.events,
                    "teams": data.teams,
                    "people": data.people 
                })
                setSearchParams({
                    album: data.year,
                    "event": DEFAULT_EVENT
                });
            } else {
                setData({
                    "year": data.year,
                    [type]: selectedItem.label,
                    "events": data.events,
                    "teams": data.teams,
                    "people": data.people 
                })
                setSearchParams({
                    album: data.year,
                    [type]: selectedItem.label
                });
            }
        }
        updData();
    }

    useEffect(() => {
        if (desktop) {
            setIsOpenMenu(true);
        }
        let element = document.getElementById("header-input-wrapper");
        if (!element) {
            return;
        }
        if (isOpenMenu) {
            element.style.display= 'flex';
        } else {
           element.style.display= 'none';
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpenMenu]);

    const changeMenu = () => {
        setIsOpenMenu(isOpenMenu ^ 1);
    }

    return <div className={"header-wrapper"}>
        <div className={"header"}>
            {!desktop &&
                <div className="button" onClick={changeMenu}>
                    {!isOpenMenu ? <MenuIcon fontSize="large"/>
                     : <CloseIcon fontSize="large"/>}
                </div>
            }
            <div className={"header-input-wrapper"} id={"header-input-wrapper"}>
                {!desktop && <Seleclor options={years.map(x => {
                    return {year: x, label: x + " " + places[x]}
                })}
                          setSearchParams={setSearchParams}
                          name={"Select year"}
                          link={`/calender.svg`}
                          func={selectedYear => {
                              setter(selectedYear, "year")
                          }}
                          value={year}/>}
                <Seleclor options={getOptionObj(events)}
                          setSearchParams={setSearchParams}
                          name={"Select event"}
                          link={`/event.svg`}
                          func={selectedEvent => {
                              setter(selectedEvent, "event")
                          }}
                          value={event}/>
                <Seleclor options={getOptionObj(teams)}
                          setSearchParams={setSearchParams}
                          name={"Select team"}
                          link={`/team.svg`}
                          func={selectedTeam => {
                              setter(selectedTeam, "team")
                          }} value={team}/>
                <Seleclor options={getOptionObj(people)}
                          setSearchParams={setSearchParams}
                          name={"Select person"}
                          link={`/person.svg`}
                          func={selectedPerson => {
                              setter(selectedPerson, "person")
                          }}
                          value={person}/>
                <Search setSearchParams={setSearchParams} setIsOpenMenu={setIsOpenMenu}/>
            </div>
        </div>
    </div>
}
export default Header;