import React, {useEffect, useMemo, useState} from "react";
import {current_year, years} from "../consts";
import MySelect from "./MySelect";
import axios from "axios";
import Seleclor from "./Seleclor";


export const Header = ({year, event, team, person, setYear, setEvent, setTeam, setPerson}) => {

    return <div>
        {/*<div>
            {events}
        </div>*/}
        {/*<img className={"logo"} src={"/logo512.png"}/>*/}
        <Seleclor year={year} event={event} team={team} person={person} setYear={setYear} setEvent={setEvent} setTeam={setTeam} setPerson={setPerson}/>
    </div>
}
export default Header;