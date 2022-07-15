import React from 'react';
import "../../styles/PhotoInfo.css"

const PhotoInfo = ({photoInfo}) => {
    console.log(photoInfo);
    return (
        <div className="photoInfo">
            <div>{photoInfo?.photographer}</div>
            {photoInfo?.event?.length !== 0 && <div>
                Event: {photoInfo?.event}
                </div>}
            {photoInfo?.team?.length !== 0 && <div>
                Team: {photoInfo?.team}
                </div>}
            {photoInfo?.person?.length !== 0 && <div>
                Person: {photoInfo?.person?.map(person => person.name).join(", ")}
                </div>
            }
        </div>

    );
};

export default PhotoInfo;