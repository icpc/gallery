import React, {useContext, useState} from 'react';
import "../../styles/PhotoInfo.css"
import {AppContext} from "../AppContext";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';

const PhotoInfo = ({photoInfo, setFace, photo}) => {

    function set() {
        setHide(hide ^ 1);
    }

    const [hide, setHide] = useState(false);
    return (
        <div className="photoInfo">

            {!hide && <div>
                Photographer: {photoInfo?.photographer.join(", ")}
            </div>}

            {!hide && photoInfo?.album?.length !== 0 && <div>
                Album: {photoInfo?.album?.map(album => <a key={album + photo.url}
                                                          href={"?album=" + photoInfo?.album[0].replaceAll(' ', '+') }
                                                          className={"album " + album}
                                                          style={{display: "inline", padding: "2px"}}>{album}</a>)}
            </div>}

            {!hide && photoInfo?.event?.length !== 0 && <div>
                Event: {photoInfo?.event?.map(event => <a key={event + photo.url}
                                                          href={"?album=" + photoInfo?.album[0].replaceAll(' ', '+') + "&event=" + event.replaceAll(' ', '+')}
                                                          className={"event " + event}
                                                          style={{display: "inline", padding: "2px"}}>{event}</a>)}
            </div>}

            {!hide && photoInfo?.team?.length !== 0 && <div>
                Team: {photoInfo?.team?.map(team => <a key={team + photo.url}
                                                       href={"?album=" + photoInfo?.album[0].replaceAll(' ', '+') + "&team=" + team.replaceAll(' ', '+')}
                                                       className={"team " + team}
                                                       style={{display: "inline", padding: "2px"}}>{team}</a>)}
            </div>}

            {!hide && photoInfo?.person?.length !== 0 && <div>
                Person: {photoInfo?.person?.map(person => {
                	return <a key={person.name + photo.url + person.position.top}
                                                             href={"?album=" + photoInfo?.album[0].replaceAll(' ', '+') + "&person=" + person.name.replaceAll(' ', '+')}
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