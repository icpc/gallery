import { FC } from "react";

import { Photo } from "../../types";

interface Props {
  photos: Photo[];
  handleClick: (id: string) => void;
}

const PhotoGrid: FC<Props> = ({ photos, handleClick }) => {
  return (
    <div className="masonry">
      {photos.map((photo) => {
        return (
          <figure key={photo.id} className="masonry-brick">
            <img
              className="preview"
              src={photo?.url_preview}
              alt={photo.url_preview}
              loading="lazy"
              onClick={() => handleClick(photo.id)}
            />
          </figure>
        );
      })}
    </div>
  );
};

export default PhotoGrid;
