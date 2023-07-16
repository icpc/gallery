import { useEffect, useState } from 'react'
import "./styles/App.css"
import { useAppContext } from "./components/AppContext";
import { useSearchParams } from "react-router-dom";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar";
import Body from "./components/Body/Body";
import Logo from "./components/Logo";
import useMediaQuery from '@mui/material/useMediaQuery';
import MobileYearWrapper from "./components/MobileYearWrapper";


function App() {
    const desktop = useMediaQuery('(min-width: 900px)');
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
