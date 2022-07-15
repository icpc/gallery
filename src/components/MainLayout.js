import React, {useEffect, useState} from "react";
import Header from "./Header/Header";
import Body from "./Body/Body";
import Footer from "./Footer";
import {current_year} from "../consts";


export const MainLayout = () => {

    return <div style={{width: "100%", height: "100%"}}>
        <Header/>
        <Body />
        <Footer/>
    </div>;
};

export default MainLayout;
