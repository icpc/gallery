import { useMemo } from "react";

import { places } from "../../consts";

import PhotoGrid from "./PhotoGrid";

const PhotoGridByYear = ({ photos, handleClick }) => {
  const photosByYear = useMemo(() => {
    const photosByYear = {};
    photos.forEach((photo) => {
      if (!photosByYear[photo.year]) {
        photosByYear[photo.year] = [];
      }
      photosByYear[photo.year].push(photo);
    });
    return photosByYear;
  }, [photos]);

  if (Object.keys(photosByYear).length < 2) {
    return <PhotoGrid photos={photos} handleClick={handleClick} />;
  }

  const compareYears = (a, b) => {
    const yearA = a[0];
    const yearB = b[0];
    const yearIndex = (targetYear) =>
      places.findIndex(({ year }) => year === targetYear);
    const indexDiff = yearIndex(yearB) - yearIndex(yearA);
    if (indexDiff !== 0) {
      return indexDiff;
    }
    return yearA.localeCompare(yearB);
  };

  return (
    <div>
      {Object.entries(photosByYear)
        .sort(compareYears)
        .reverse()
        .map(([year, photos]) => (
          <div key={year}>
            <h2 className="event-title">{year}</h2>
            <PhotoGrid photos={photos} handleClick={handleClick} />
          </div>
        ))}
    </div>
  );
};

export default PhotoGridByYear;
