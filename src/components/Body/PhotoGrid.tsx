export default function PhotoGrid({ photos, handleClick }) {
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
}
