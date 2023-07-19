import { useEffect, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useAppContext } from "./components/AppContext";
import Body from "./components/Body/Body";
import Header from "./components/Header/Header";
import MobileYearWrapper from "./components/Header/MobileYearWrapper";
import Logo from "./components/Logo";
import Sidebar from "./components/Sidebar";

import "./styles/App.css";


function App() {
    const desktop = useMediaQuery("(min-width: 900px)");

    const { data, setIsOpenMenu } = useAppContext();

    useEffect(() => {
        if (desktop) {
            setIsOpenMenu(true);
        } else {
            setIsOpenMenu(false);
        }
    }, [desktop]);

    return (
        <div className="content-layout">
            {console.log(data)}
            <Logo />
            <Header />
            {desktop && <Sidebar />}
            {!desktop && <MobileYearWrapper />}
            <Body />
        </div>
    );
}

export default App;
