import { useEffect, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useAppContext } from "./components/AppContext";
import Body from "./components/Body/Body";
import Header from "./components/Header/Header";
import Logo from "./components/Logo";
import MobileYearWrapper from "./components/MobileYearWrapper";
import Sidebar from "./components/Sidebar";

import "./styles/App.css";


function App() {
    const desktop = useMediaQuery("(min-width: 900px)");
    const [isOpenMenu, setIsOpenMenu] = useState(false);

    const { data } = useAppContext();

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
            <Header isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu} />
            {desktop && <Sidebar />}
            {!desktop && <MobileYearWrapper setIsOpenMenu={setIsOpenMenu} />}
            <Body />
        </div>
    );
}

export default App;
