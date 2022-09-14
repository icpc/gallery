import React from 'react';
import TableOfContents from "./TableOfContents";

const Sidebar = ({setSearchParams}) => {
    return (
        <div style={{width: "25%", marginLeft:"40px", marginTop: "20px" }}>
            <img className={"logo"} src={process.env.PUBLIC_URL + "/logo.svg"} style={{width:"100px"}}/>
            <TableOfContents setSearchParams={setSearchParams}/>
        </div>
    );
};

export default Sidebar;