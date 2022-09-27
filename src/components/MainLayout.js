import React from "react";
import Body from "./Body/Body";
import "../styles/App.css"
import Sidebar from "./Sidebar";


export const MainLayout = ({setSearchParams}) => {

    return <div style={{width: "100%", height: "100%", paddingTop: "120px", margin: "0 1rem 0 0", display: "flex", flexDirection:"row"}}>
        <Sidebar setSearchParams={setSearchParams}/>
        <Body/>
    </div>;
};

export default MainLayout;
