import React, {useState} from 'react';
import {TAG_EVENT, TAG_TEAM, TAG_ALBUM, TAG_PHOTOGRAPHER,TAG_PERSON} from "../../consts";
import "../../styles/PhotoInfo.css"
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';

const PhotoInfo = ({photoInfo, setFace, photo}) => {
    console.log(TAG_EVENT, TAG_TEAM, TAG_ALBUM, TAG_PHOTOGRAPHER,TAG_PERSON)
    console.log(photoInfo)
    function set() {
        setHide(hide ^ 1);
    }
    const [hide, setHide] = useState(false);
    return (
        <div className="photoInfo">

            {!hide && photoInfo && <div>
                Photographer: {photoInfo[TAG_PHOTOGRAPHER].join(", ")}
            </div>}

            {!hide && photoInfo && photoInfo[TAG_ALBUM].length !== 0 && <div>
                Album: {photoInfo[TAG_ALBUM].map(album => <a key={album + photo.url}
                                                          href={"?album=" + album.replaceAll(' ', '+') }
                                                          className={"album " + album}
                                                          style={{display: "inline", padding: "2px"}}>{album}</a>)}
            </div>}

            {!hide && photoInfo && photoInfo[TAG_EVENT].length !== 0 && <div>
                Event: {photoInfo[TAG_EVENT].map(event => <a key={event + photo.url}
                                                          href={"?album=" + photoInfo[TAG_ALBUM][0].replaceAll(' ', '+') + "&event=" + event.replaceAll(' ', '+')}
                                                          className={"event " + event}
                                                          style={{display: "inline", padding: "2px"}}>{event}</a>)}
            </div>}

            {!hide && photoInfo && photoInfo[TAG_TEAM].length !== 0 && <div>
                Team: {photoInfo[TAG_TEAM].map(team => <a key={team + photo.url}
                                                       href={"?album=" + photoInfo[TAG_ALBUM][0].replaceAll(' ', '+') + "&team=" + team.replaceAll(' ', '+')}
                                                       className={"team " + team}
                                                       style={{display: "inline", padding: "2px"}}>{team}</a>)}
            </div>}

            {!hide && photoInfo && photoInfo[TAG_PERSON].length !== 0 && <div>
                Person: {photoInfo[TAG_PERSON].map(person => {
                	return <a key={person.name + photo.url + person.position.top}
                                                             href={"?album=" + photoInfo[TAG_ALBUM][0].replaceAll(' ', '+') + "&person=" + person.name.replaceAll(' ', '+')}
                                                             className={"name " + person.name}
                                                             onMouseLeave={() => setFace(null)}
                                                             onMouseEnter={() => setFace(person)} 
                                                             style={{display: "inline", padding: "2px"}}>{person.name}</a>;
                                                             })}
            </div>
            }
            <div className={"control-bottom"}>
                <div onClick={set} className="photoInfo-hide">
                    {!hide ? <VisibilityOffIcon fontSize="large"/> : <VisibilityIcon fontSize="large"/>}
                </div>
                <a className="download" href={photo.origin} download target="_blank" rel="noreferrer">
                    <DownloadIcon fontSize="large"/>
                </a>
            </div>
        </div>

    );
};

export default PhotoInfo;