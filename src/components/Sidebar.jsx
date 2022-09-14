import React from 'react';
import TableOfContents from "./TableOfContents";

const Sidebar = ({setSearchParams}) => {
    return (
        <div style={{width: "25%", marginLeft: "40px", marginTop: "50px"}}>
            <img className={"logo"} src={process.env.PUBLIC_URL + "/icpc_header.svg"} style={{height: "63px"}}/>
            <TableOfContents setSearchParams={setSearchParams}/>
        </div>
    );
};

export default Sidebar;