import { FC, useMemo } from "react";

import { places } from "../../consts";
import { Photo } from "../../types";

import PhotoGrid from "./PhotoGrid";

interface Props {
  photos: Photo[];
  handleClick: (id: string) => void;
}

const PhotoGridByYear: FC<Props> = ({ photos, handleClick }) => {
  const photosByYear: Record<string, Photo[]> = useMemo(() => {
    const photosByYear: Record<string, Photo[]> = {};
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

  const compareYears = (a: [string, Photo[]], b: [string, Photo[]]) => {
    const yearA = a[0];
    const yearB = b[0];
    const yearIndex = (targetYear: string) =>
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
