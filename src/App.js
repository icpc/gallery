import {useEffect, useState} from 'react'
import MainLayout from "./components/MainLayout";
import "./styles/App.css"
import {AppContext} from "./components/AppContext";
import {current_year, LAST_YEAR} from "./consts";
import { useSearchParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function App() {
    const [data, setData] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();

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
                <Sidebar setSearchParams={setSearchParams}/>
                <MainLayout setSearchParams={setSearchParams}/>
            </div>
        </AppContext.Provider>
    );
}

export default App;
