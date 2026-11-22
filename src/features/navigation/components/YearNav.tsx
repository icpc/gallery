import type { FC } from "react";
import { places } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";

import "../styles/YearNav.css";

export const YearNav: FC = () => {
  const { data, setYear } = useGallery();

  const handleClick = (selectedYear: string) => {
    setYear(selectedYear);
    document.querySelector(".body")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <nav aria-label="Table of contents" className="year-nav">
      {places.map(({ year, place, contest_name }) => {
        const isCurrent = year === data.year;
        return (
          <button
            type="button"
            className="year-wrapper"
            key={year}
            title={isCurrent ? "to top" : undefined}
            onClick={() => handleClick(year)}
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
