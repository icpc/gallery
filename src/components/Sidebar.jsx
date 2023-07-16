import React from 'react';
import TableOfContents from "./TableOfContents";

const Sidebar = () => {
    return (
        <div className={"sidebar"} style={{marginLeft: "1rem"}}>
            <TableOfContents/>
        </div>
    );
};

export default Sidebar;