import React, {useContext} from 'react';
import "../styles/App.css"
import {AppContext} from "./AppContext";
import {places,CONTEST_NAME} from "../consts";


const MobileYearWrapper = ({setIsOpenMenu}) => {
    const {data} = useContext(AppContext);

    const openMenu = () => {
        setIsOpenMenu(true);
    }

    if (data.text) {
        return  <div className="mobile-year-wrapper" style={{marginLeft:"1rem"}} onClick={openMenu}>
            <div className="year">{data.text}</div>
        </div>
    }

    return (
        <div className="mobile-year-wrapper" style={{marginLeft:"1rem"}} onClick={openMenu}>
            <div className="year">{CONTEST_NAME} {data.year}</div>
            <div className="place">{places[data.year]}</div>
        </div>
    );
};

export default MobileYearWrapper;