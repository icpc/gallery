import React from 'react';
import TableOfContents from "./TableOfContents";
import {LAST_YEAR} from "../consts";

const Sidebar = ({setSearchParams}) => {
    return (
        <div className={"sidebar"} style={{width: "25%", marginLeft: "40px", marginTop: "50px"}}>
            <a href={"?album=" + LAST_YEAR}> <img className={"logo"} src={process.env.PUBLIC_URL + "/icpc_header.svg"} style={{height: "63px"}} alt={"go home page"}/></a>
            <TableOfContents setSearchParams={setSearchParams}/>
        </div>
    );
};

export default Sidebar;