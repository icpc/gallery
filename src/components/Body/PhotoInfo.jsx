import React, { useState } from 'react';
import { TAG_EVENT, TAG_TEAM, TAG_ALBUM, TAG_PHOTOGRAPHER, TAG_PERSON, FLICKR_IMAGE_PREFIX } from "../../consts";
import "../../styles/PhotoInfo.css"
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Tooltip, IconButton } from '@mui/material';

const PhotoInfo = ({ photoInfo, setFace, photo }) => {
    const [hidden, setHidden] = useState(false);

    function toogleHidden() {
        setHidden(hidden ^ 1);
    }

    return (
        <div className="photoInfo">

            {!hidden && photoInfo && <div>
                Photographer: {photoInfo[TAG_PHOTOGRAPHER].join(", ")}
            </div>}

            {!hidden && photoInfo && photoInfo[TAG_ALBUM].length !== 0 && <div>
                Album: {photoInfo[TAG_ALBUM].map(album => <a key={album + photo.url}
                    href={"?album=" + album.replaceAll(' ', '+')}
                    className={"album " + album}
                    style={{ display: "inline", padding: "2px" }}>{album}</a>)}
            </div>}

            {!hidden && photoInfo && photoInfo[TAG_EVENT].length !== 0 && <div>
                Event: {photoInfo[TAG_EVENT].map(event => <a key={event + photo.url}
                    href={"?album=" + photoInfo[TAG_ALBUM][0].replaceAll(' ', '+') + "&event=" + event.replaceAll(' ', '+')}
                    className={"event " + event}
                    style={{ display: "inline", padding: "2px" }}>{event}</a>)}
            </div>}

            {!hidden && photoInfo && photoInfo[TAG_TEAM].length !== 0 && <div>
                Team: {photoInfo[TAG_TEAM].map(team => <a key={team + photo.url}
                    href={"?album=" + photoInfo[TAG_ALBUM][0].replaceAll(' ', '+') + "&team=" + team.replaceAll(' ', '+')}
                    className={"team " + team}
                    style={{ display: "inline", padding: "2px" }}>{team}</a>)}
            </div>}

            {!hidden && photoInfo && photoInfo[TAG_PERSON].length !== 0 && <div>
                Person: {photoInfo[TAG_PERSON].map(person => {
                    return <a key={person.name + photo.url + person.position.top}
                        href={"?album=" + photoInfo[TAG_ALBUM][0].replaceAll(' ', '+') + "&person=" + person.name.replaceAll(' ', '+')}
                        className={"name " + person.name}
                        onMouseLeave={() => setFace(null)}
                        onMouseEnter={() => setFace(person)}
                        style={{ display: "inline", padding: "2px" }}>{person.name}</a>;
                })}
            </div>}

            <div className="control-bottom">
                <Tooltip title={(hidden ? "Show" : "Hide") + " photo info"}>
                    <IconButton className="photoInfo-hide" onClick={toogleHidden}>
                        {hidden
                            ? <VisibilityOffIcon className="icon-button" fontSize="large" />
                            : <VisibilityIcon className="icon-button" fontSize="large" />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="Go to Flickr">
                    <IconButton href={FLICKR_IMAGE_PREFIX + photo.id} target="_blank" rel="noreferrer">
                        <OpenInNewIcon className="icon-button" fontSize="large" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Download photo">
                    <IconButton href={photo.origin} download target="_blank" rel="noreferrer">
                        <DownloadIcon className="icon-button" fontSize="large" />
                    </IconButton>
                </Tooltip>
            </div>
        </div>

    );
};

export default PhotoInfo;