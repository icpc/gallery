import React, {useContext, useEffect, useState} from "react";
import Seleclor from "./Seleclor";
import Search from "./Search";
import "../../styles/Header.css"
import {AppContext} from "../AppContext";
import axios from "axios";
import {LAST_YEAR} from "../../consts";


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

    const setter = (selectedTeam, type) => {
        if (data.year === undefined) {
            data.year = LAST_YEAR;
        }
        if (selectedTeam === null) {
            return;
        }
        setData({
            "year": data.year,
            [type]: selectedTeam.label
        })
        setSearchParams({
            album: data.year,
            [type]: selectedTeam.label
        });
        updData();
    }

    return <div className={"header-wrapper"}>
        <div className={"header"}>
            <a href={"?album=" + LAST_YEAR}  style={{width: "25%", marginLeft: "40px", marginTop: "40px", display:"flex", justifyContent:"center"}}>
                <img className={"logo"} src={process.env.PUBLIC_URL + "/icpc_header.svg"}
                                                  style={{height: "63px"}} alt={"go home page"}/></a>

            <div className={"header-input-wrapper"}>
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
                <Search setSearchParams={setSearchParams}/>
            </div>
        </div>
    </div>
}
export default Header;