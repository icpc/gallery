import React from 'react';
import TableOfContents from "./TableOfContents";

const Sidebar = ({setSearchParams}) => {
    return (
        <div className={"sidebar"} style={{marginLeft: "40px"}}>
            <TableOfContents setSearchParams={setSearchParams}/>
        </div>
    );
};

export default Sidebar;