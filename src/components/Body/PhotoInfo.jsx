import React, {useContext, useState} from 'react';
import "../../styles/PhotoInfo.css"
import {AppContext} from "../AppContext";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';

const PhotoInfo = ({photoInfo, setFace, photo, slideShow}) => {
    console.log(photoInfo);

    function set() {
        setHide(hide ^ 1);
    }

    const {data} = useContext(AppContext);
    const [hide, setHide] = useState(false);
    console.log(photoInfo)
    return (
        <div className="photoInfo">
            {!hide && <div>{photoInfo?.photographer}</div>}
            {!hide && photoInfo?.event?.length !== 0 && <div>
                Event: {photoInfo?.event?.map(event => <a key={event + photo.url}
                                                          href={"?" + (data.year === undefined ? "query=" + event.replaceAll(' ', '+') : "album=" + data.year + "&event=" + event.replaceAll(' ', '+'))}
                                                          className={"event " + event}
                                                          style={{display: "inline", padding: "2px"}}>{event}</a>)}
            </div>}

            {!hide && photoInfo?.team?.length !== 0 && <div>
                Team: {photoInfo?.team?.map(team => <a key={team + photo.url}
                                                       href={"?" + (data.year === undefined ? "query=" + team.replaceAll(' ', '+') : "album=" + data.year + "&team=" + team.replaceAll(' ', '+'))}
                                                       className={"team " + team}
                                                       style={{display: "inline", padding: "2px"}}>{team}</a>)}
            </div>}
            {!hide && photoInfo?.person?.length !== 0 && <div>
                Person: {photoInfo?.person?.map(person => <a key={person.name + photo.url}
                                                             href={"?" + (data.year === undefined ? "query=" + person.name.replaceAll(' ', '+') : "album=" + data.year + "&person=" + person.name.replaceAll(' ', '+'))}
                                                             className={"name " + person.name}
                                                             onMouseLeave={() => setFace(null)}
                                                             onMouseEnter={() => setFace(person)} style={{
                display: "inline",
                padding: "2px"
            }}>{person.name}</a>)}
            </div>
            }
            <div className={"control-bottom"}>
                <div onClick={set} className="photoInfo-hide">
                    {!hide ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                </div>
                <a className="download" href={photo.origin} target="_blank">
                    <DownloadIcon/>
                </a>
            </div>
        </div>

    );
};

export default PhotoInfo;