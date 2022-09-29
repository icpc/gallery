import React from 'react';
import TableOfContents from "./TableOfContents";

const Sidebar = ({setSearchParams}) => {
    return (
        <div className={"sidebar"} style={{marginLeft: "1rem"}}>
            <TableOfContents setSearchParams={setSearchParams}/>
        </div>
    );
};

export default Sidebar;