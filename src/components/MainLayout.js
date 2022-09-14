import React from "react";
import Header from "./Header/Header";
import Body from "./Body/Body";
import "../styles/App.css"


export const MainLayout = ({setSearchParams}) => {

    return <div style={{width: "100%", height: "100%", margin: "0 1rem"}}>
        <Header setSearchParams={setSearchParams}/>
        <Body/>
    </div>;
};

export default MainLayout;
