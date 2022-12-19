import {useEffect, useState} from 'react'
import "./styles/App.css"
import {AppContext} from "./components/AppContext";
import {LAST_YEAR} from "./consts";
import {useSearchParams} from "react-router-dom";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar";
import Body from "./components/Body/Body";
import Logo from "./components/Logo";
import useMediaQuery from '@mui/material/useMediaQuery';
import MobileYearWrapper from "./components/MobileYearWrapper";


function App() {
    const desktop = useMediaQuery('(min-width: 900px)');
    const [isOpenMenu, setIsOpenMenu] = useState();

    const [data, setData] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (desktop) {
            setIsOpenMenu(true);
        } else {
            setIsOpenMenu(false);
        }
    }, [desktop])

    useEffect(() => {
        let obj = {};
        if (searchParams.has('query')) {
            obj["text"] = searchParams.get('query').replaceAll("+", " ");
        } else {
            if (searchParams.has('album')) {
                obj["year"] = searchParams.get('album').replaceAll("+", " ");
            } else {
                obj["year"] = LAST_YEAR;
            }
            if (searchParams.has('event')) {
                obj["event"] = searchParams.get('event').replaceAll("+", " ");
            } else if (searchParams.has('team')) {
                obj["team"] = searchParams.get('team').replaceAll("+", " ");

            } else if (searchParams.has('person')) {
                obj["person"] = searchParams.get('person').replaceAll("+", " ");
            } else {
                obj["event"] = "Photo Tour";
            }
        }
        setData(obj);
    }, [])

    return (
        <AppContext.Provider value={{
            data,
            setData
        }}>
            <div className="content-layout">
                <Logo/>
                <Header setSearchParams={setSearchParams} isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu}/>
                {desktop && <Sidebar setSearchParams={setSearchParams}/>}
                {!desktop && <MobileYearWrapper setSearchParams={setSearchParams} setIsOpenMenu={setIsOpenMenu}/>}
                <Body/>
            </div>
        </AppContext.Provider>
    );
}

export default App;
