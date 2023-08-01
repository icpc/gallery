import { TAG_ALBUM, TAG_EVENT, TAG_PERSON, TAG_PHOTOGRAPHER, TAG_TEAM } from "../../consts";

const ComaSeparated = (list) => {
    return list.map((item, index) => [
        index > 0 && ", ",
        item
    ]);
};

const PhotographerInfo = ({ photoInfo }) => {
    if (!photoInfo || photoInfo[TAG_PHOTOGRAPHER].length === 0) {
        return null;
    }

    const photographer = photoInfo[TAG_PHOTOGRAPHER];

    return (
        <div>
            Photographer: {photographer.join(", ")}
        </div>
    );
};

const AlbumInfo = ({ photoInfo }) => {
    if (!photoInfo || photoInfo[TAG_ALBUM].length === 0) {
        return null;
    }

    const formatLink = (album) => `?album=${album}`.replaceAll(" ", "+");

    const albumLinks = photoInfo[TAG_ALBUM].map(album =>
        <a key={album} href={formatLink(album)}>
            {album}
        </a>);

    return (
        <div>
            Album: {ComaSeparated(albumLinks)}
        </div>
    );
};

const EventInfo = ({ photoInfo }) => {
    if (!photoInfo || photoInfo[TAG_EVENT].length === 0) {
        return null;
    }

    const formatLink = (event) => `?album=${photoInfo[TAG_ALBUM][0]}&event=${event}`.replaceAll(" ", "+");

    const eventLinks = photoInfo[TAG_EVENT].map(event =>
        <a key={event} href={formatLink(event)}>
            {event}
        </a>);

    return (
        <div>
            Event: {ComaSeparated(eventLinks)}
        </div>
    );
};

const TeamInfo = ({ photoInfo }) => {
    if (!photoInfo || photoInfo[TAG_TEAM].length === 0) {
        return null;
    }

    const formatLink = (team) => `?album=${photoInfo[TAG_ALBUM][0]}&team=${team}`.replaceAll(" ", "+");

    const teamLinks = photoInfo[TAG_TEAM].map(team =>
        <a key={team} href={formatLink(team)}>
            {team}
        </a>);

    return (
        <div>
            Team: {ComaSeparated(teamLinks)}
        </div>
    );
};

const PersonInfo = ({ photoInfo, setFace }) => {
    if (!photoInfo || !photoInfo[TAG_PERSON]) {
        return null;
    }

    const sortedPersons = photoInfo[TAG_PERSON].sort((a, b) => a.position.left - b.position.left);

    const formatLink = (person) => `?album=${photoInfo[TAG_ALBUM][0]}&person=${person.name}`.replaceAll(" ", "+");

    const personLinks = sortedPersons.map(person =>
        <a key={person} href={formatLink(person)}
            onMouseLeave={() => setFace(null)}
            onMouseEnter={() => setFace(person)}>
            {person.name}
        </a>);

    if (personLinks.length === 0) {
        return null;
    }

    return (
        <div>
            Person: {ComaSeparated(personLinks)}
        </div>
    );
};

export { AlbumInfo, EventInfo, PersonInfo,PhotographerInfo, TeamInfo };
