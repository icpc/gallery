import React, {useContext, useEffect, useState} from "react";
import Seleclor from "./Seleclor";
import Search from "./Search";
import "../../styles/Header.css"
import {AppContext} from "../AppContext";
import axios from "axios";
import {LAST_YEAR, places, years} from "../../consts";
import MenuIcon from '@mui/icons-material/Menu';
import useMatchMedia from 'use-match-media-hook'
import "../../styles/DropdownMenu.css"
import CloseIcon from '@mui/icons-material/Close';


export const Header = ({setSearchParams, setIsOpenMenu, isOpenMenu}) => {
    const {data, setData} = useContext(AppContext);
    const [event, setEvent] = useState("");
    const [person, setPerson] = useState("");
    const [team, setTeam] = useState("");
    const [year, setYear] = useState("");


    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [people, setPeople] = useState([]);


    const queries = [
        '(min-width: 900px)'
    ]
    const [desktop] = useMatchMedia(queries)

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
    }, [data.year]);


    async function getMenu(year) {
        const response = await axios.get(process.env.PUBLIC_URL + `/${year}.html`);
        const menu = response.data;
        const split = menu.split("\n", 3);
        let obj = data;
        if (year === data.year) {
            if (data.event === undefined && data.team === undefined && data.person === undefined) {
                obj["event"] = "Photo Tour";
            }
            delete obj.text;
            setData(obj);
        }
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
                setDataType("event", "Photo Tour", selectedItem.year);
                obj["event"] = "Photo Tour";
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
                    "event": "Photo tour"
                })
                setSearchParams({
                    album: data.year,
                    "event": "Photo tour"
                });
            } else {
                setData({
                    "year": data.year,
                    [type]: selectedItem.label
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