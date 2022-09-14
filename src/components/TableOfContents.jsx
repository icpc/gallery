import "../styles/TableOfContents.css"
import {places, years} from "../consts";
import {AppContext} from "./AppContext";
import {useContext} from "react";
import MySelect from "./UI/Select/MySelect";
const TableOfContents = ({setSearchParams}) => {
    const {data, setData} = useContext(AppContext);

    const handleClick = (event, selectedYear) => {
        console.log("select", selectedYear);
        let obj = data;
        obj["year"] = selectedYear;
        if (data.event !== undefined) {
            setSearchParams({
                album: selectedYear,
                event: data.event
            });
        } else if (data.team !== undefined) {
            setSearchParams({
                album: selectedYear,
                team: data.team
            });
        } else if (data.person !== undefined) {
            setSearchParams({
                album: selectedYear,
                person: data.person
            });
        } else {
            setSearchParams({
                album: selectedYear,
                event: "Photo Tour"
            });
            obj["event"] = "Photo Tour";
            delete obj.text;
        }
        setData(obj);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
        });
    }
    console.log(places);
    return (
        <nav aria-label="Table of contents">
            {years.map(year => {
                if (year !== data.year) {
                    return <div className="year-wrapper" key={year} onClick={event => handleClick(event, year)}>
                        <div className="year">{year}</div>
                        <div className="place">{places[year]}</div>
                    </div>
                } else {
                    return <div className="year-wrapper" key={year} onClick={event => handleClick(event, year)}>
                        <div className="year big-year">World Finals {year}</div>
                        <div className="place big-place">{places[year]}</div>
                    </div>
                }
            })}
        </nav>
    );
};

export default TableOfContents;