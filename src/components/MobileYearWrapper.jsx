import { CONTEST_NAME, places } from "../consts";

import { useAppContext } from "./AppContext";

import "../styles/App.css";


const MobileYearWrapper = ({ setIsOpenMenu }) => {
    const { data } = useAppContext();

    const openMenu = () => {
        setIsOpenMenu(true);
    };

    if (data.text) {
        return <div className="mobile-year-wrapper" style={{ marginLeft: "1rem" }} onClick={openMenu}>
            <div className="year">{data.text}</div>
        </div>;
    }

    return (
        <div className="mobile-year-wrapper" style={{ marginLeft: "1rem" }} onClick={openMenu}>
            <div className="year">{CONTEST_NAME} {data.year}</div>
            <div className="place">{places[data.year]}</div>
        </div>
    );
};

export default MobileYearWrapper;
