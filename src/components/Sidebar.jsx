import React from 'react';
import TableOfContents from "./TableOfContents";

const Sidebar = ({setSearchParams}) => {
    return (
        <div className={"sidebar"} style={{width: "25%", marginLeft: "40px", marginTop: "2rem"}}>
            <TableOfContents setSearchParams={setSearchParams}/>
        </div>
    );
};

export default Sidebar;