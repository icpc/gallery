import { FC } from "react";
import { places } from "../consts";

import { useAppContext } from "./AppContext";

import "../styles/TableOfContents.css";

const TableOfContents: FC = () => {
  const { data, setYear } = useAppContext();

  const handleClick = (selectedYear: string) => {
    setYear(selectedYear);
    document.querySelector(".body")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <nav aria-label="Table of contents">
      {places.map(({ year, place, contestName }) => {
        if (year !== data.year) {
          return (
            <div
              className="year-wrapper"
              key={year}
              onClick={() => handleClick(year)}
            >
              <div className="year">{year}</div>
              <div className="place">{place}</div>
            </div>
          );
        } else {
          return (
            <div
              className="year-wrapper"
              key={year}
              title="to top"
              onClick={() => handleClick(year)}
            >
              <div className="year big-year">
                {contestName} {year}
              </div>
              <div className="place big-place">{place}</div>
            </div>
          );
        }
      })}
    </nav>
  );
};

export default TableOfContents;
