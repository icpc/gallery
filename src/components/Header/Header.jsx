import React, { useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { useMediaQuery } from "@mui/material";

import { places, years } from "../../consts";
import calendarIcon from "../../images/calender.svg";
import eventIcon from "../../images/event.svg";
import personIcon from "../../images/person.svg";
import teamIcon from "../../images/team.svg";
import { getEventData, getPeopleData, getTeamData } from "../../Util/DataLoader";
import { useAppContext } from "../AppContext";

import Search from "./Search";
import Selector from "./Selector";

import "../../styles/Header.css";
import "../../styles/DropdownMenu.css";


export const Header = () => {
    const { data, setYear, setEvent, setPerson, setTeam, isOpenMenu, setIsOpenMenu } = useAppContext();

    const desktop = useMediaQuery("(min-width: 900px)");

    const [events, setEvents] = React.useState([]);
    const [people, setPeople] = React.useState([]);
    const [teams, setTeams] = React.useState([]);

    useEffect(() => {
        async function fetchData() {
            setEvents(await getEventData(data.year));
            setPeople(await getPeopleData(data.year));
            setTeams(await getTeamData(data.year));
        }
        fetchData();
    }, [data.year]);

    function formatOptions(a) {
        return a.map(x => {
            return { label: x };
        });
    }

    function formatYearOption(a) {
        return a.map(x => {
            return { year: x, label: x + " " + places[x] };
        });
    }

    function selectItem(item, func) {
        if (item === "clear") {
            setYear(data.year);
        } else {
            func(item.label);
        }
    }

    // TODO: rewrite
    useEffect(() => {
        let element = document.getElementById("header-input-wrapper");
        if (!element) {
            return;
        }
        if (isOpenMenu) {
            element.style.display = "flex";
        } else {
            element.style.display = "none";
        }
    }, [isOpenMenu]);

    const changeMenu = () => {
        setIsOpenMenu(!isOpenMenu);
    };

    return <div className={"header-wrapper"}>
        <div className={"header"}>
            {!desktop &&
                <div className="button" onClick={changeMenu}>
                    {!isOpenMenu ? <MenuIcon fontSize="large" />
                        : <CloseIcon fontSize="large" />}
                </div>
            }
            <div className={"header-input-wrapper"} id={"header-input-wrapper"}>
                {!desktop && <Selector options={formatYearOption(years)}
                    name={"Select year"}
                    leftIcon={calendarIcon}
                    func={selectedItem => {
                        const year = selectedItem.year;
                        setYear(year);
                    }}
                    value={data.year} />}
                <Selector options={formatOptions(events)}
                    name={"Select event"}
                    leftIcon={eventIcon}
                    func={selectedItem => {
                        selectItem(selectedItem, setEvent);
                    }}
                    value={data.event} />
                <Selector options={formatOptions(teams)}
                    name={"Select team"}
                    leftIcon={teamIcon}
                    func={selectedItem => {
                        selectItem(selectedItem, setTeam);
                    }} value={data.team} />
                <Selector options={formatOptions(people)}
                    name={"Select person"}
                    leftIcon={personIcon}
                    func={selectedItem => {
                        selectItem(selectedItem, setPerson);
                    }}
                    value={data.person} />
                <Search setIsOpenMenu={setIsOpenMenu} />
            </div>
        </div>
    </div>;
};
export default Header;
