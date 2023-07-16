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

    const { data, setYear, setEvent, setText, setPerson, setTeam } = useAppContext();

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (desktop) {
            setIsOpenMenu(true);
        } else {
            setIsOpenMenu(false);
        }
    }, [desktop]);

    // TODO: somehow make this less ugly
    useEffect(() => {
        if (searchParams.has('album')) {
            setYear(searchParams.get('album').replaceAll("+", " "));
        }
        if (searchParams.has('query')) {
            setText(searchParams.get('query').replaceAll("+", " "));
        } else if (searchParams.has('event')) {
            setEvent(searchParams.get('event').replaceAll("+", " "));
        } else if (searchParams.has('team')) {
            setTeam(searchParams.get('team').replaceAll("+", " "));
        } else if (searchParams.has('person')) {
            setPerson(searchParams.get('person').replaceAll("+", " "));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let searchParams = {};
        if (data.year) {
            searchParams.album = data.year;
        }
        if (data.event) {
            searchParams.event = data.event;
        }
        if (data.person) {
            searchParams.person = data.person;
        }
        if (data.team) {
            searchParams.team = data.team;
        }
        if (data.text) {
            searchParams.query = data.text;
        }
        setSearchParams(searchParams);
    }, [data.year, data.event, data.text, data.person, data.team, setSearchParams]);

    return (
        <div className="content-layout">
            {console.log(data)}
            {console.log(isOpenMenu)}
            <Logo />
            <Header isOpenMenu={isOpenMenu} setIsOpenMenu={setIsOpenMenu} />
            {desktop && <Sidebar />}
            {!desktop && <MobileYearWrapper setIsOpenMenu={setIsOpenMenu} />}
            <Body />
        </div>
    );
}

export default App;
