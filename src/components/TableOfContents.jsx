import { CONTEST_NAME, places, years } from "../consts";

import { useAppContext } from "./AppContext";

import "../styles/TableOfContents.css";

const TableOfContents = () => {
    const { data, setYear } = useAppContext();

    const handleClick = (_, selectedYear) => {
        setYear(selectedYear);
        document.querySelector(".body").scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <nav aria-label="Table of contents">
            {years.map(year => {
                if (year !== data.year) {
                    return <div className="year-wrapper" key={year} onClick={event => handleClick(event, year)}>
                        <div className="year">{year}</div>
                        <div className="place">{places[year]}</div>
                    </div>;
                } else {
                    return <div className="year-wrapper" key={year} title="to top" onClick={event => handleClick(event, year)}>
                        <div className="year big-year">{CONTEST_NAME} {year}</div>
                        <div className="place big-place">{places[year]}</div>
                    </div>;
                }
            })}
        </nav>
    );
};

export default TableOfContents;
