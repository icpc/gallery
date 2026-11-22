import type { FC } from "react";

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
      {places.map(({ year, place, contest_name }) => {
        const isCurrent = year === data.year;
        return (
          <button
            type="button"
            className="year-wrapper"
            key={year}
            title={isCurrent ? "to top" : undefined}
            onClick={() => handleClick(year)}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              width: "100%",
              padding: 0,
              color: "inherit",
            }}
          >
            <div className={isCurrent ? "year big-year" : "year"}>
              {isCurrent ? `${contest_name} ${year}` : year}
            </div>
            <div className={isCurrent ? "place big-place" : "place"}>
              {place}
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default TableOfContents;
