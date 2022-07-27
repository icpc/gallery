import React, {useContext} from 'react';
import "../../styles/PhotoInfo.css"
import {AppContext} from "../AppContext";


const PhotoInfo = ({photoInfo, setFace}) => {
    console.log(photoInfo);

    const {data} = useContext(AppContext);

    console.log(photoInfo)
    return (
        <div className="photoInfo">
            <div>{photoInfo?.photographer}</div>
            {photoInfo?.event?.length !== 0 && <div>
                Event: {photoInfo?.event?.map(event => <a key={event}
                href={"?" + (data.year === undefined ? "query=" + event.replaceAll(' ', '+') : "album=" +  data.year + "&event="+event.replaceAll(' ', '+'))} className={"event " + event} style={{display:"inline", padding: "2px"}}>{event}</a>)}
                </div>}
            {photoInfo?.team?.length !== 0 && <div>
                Team: {photoInfo?.team?.map(team => <a key={team}
                href={"?" + (data.year === undefined ? "query=" + team.replaceAll(' ', '+') : "album=" +  data.year+ "&team="+team.replaceAll(' ', '+'))} className={"team " + team} style={{display:"inline", padding: "2px"}}>{team}</a>)}
            </div>}
            {photoInfo?.person?.length !== 0 && <div>
                Person: {photoInfo?.person?.map(person => <a key={person}
                href={"?" + (data.year === undefined ? "query=" + person.name.replaceAll(' ', '+') : "album=" +  data.year+ "&person="+person.name.replaceAll(' ', '+'))} className={"name " + person.name} onMouseLeave={() => setFace(null)} onMouseEnter={() => setFace(person)} style={{display:"inline", padding: "2px"}}>{person.name}</a>)}
                </div>
            }

        </div>

    );
};

export default PhotoInfo;