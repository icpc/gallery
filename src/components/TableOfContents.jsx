import "../styles/TableOfContents.css"
import {places, years, CONTEST_NAME, DEFAULT_EVENT} from "../consts";
import {AppContext} from "./AppContext";
import {useContext} from "react";

const TableOfContents = ({setSearchParams}) => {
    const {data, setData} = useContext(AppContext);


    const setDataType = (type, element, year) => {
        if (element !== undefined) {
            setSearchParams({
                album: year,
                [type]: element
            });
            return true;
        }
        return false;
    }

    const handleClick = (event, selectedYear) => {
        let obj = data;
        obj["year"] = selectedYear;
        if (!setDataType("event", data.event, selectedYear) &&
            !setDataType("team", data.team, selectedYear) &&
            !setDataType("person", data.person, selectedYear)) {
            setDataType("event", DEFAULT_EVENT, selectedYear);
            obj["event"] = DEFAULT_EVENT;
            delete obj.text;
        }
        setData(obj);
        document.querySelector(".body").scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
    return (
        <nav aria-label="Table of contents">
            {years.map(year => {
                if (year !== data.year) {
                    return <div className="year-wrapper" key={year} onClick={event => handleClick(event, year)}>
                        <div className="year">{year}</div>
                        <div className="place">{places[year]}</div>
                    </div>
                } else {
                    return <div className="year-wrapper" key={year} title="to top" onClick={event => handleClick(event, year)}>
                        <div className="year big-year">{CONTEST_NAME} {year}</div>
                        <div className="place big-place">{places[year]}</div>
                    </div>
                }
            })}
        </nav>
    );
};

export default TableOfContents;