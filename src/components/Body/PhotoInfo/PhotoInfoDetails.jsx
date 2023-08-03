import { usePhotoInfo } from "./PhotoInfoContext";


const ComaSeparated = (list) => {
    return list.map((item, index) => [
        index > 0 && ", ",
        item
    ]);
};

const PhotographerInfo = () => {
    const { photoInfo } = usePhotoInfo();

    if (!photoInfo || photoInfo.photographer.length === 0) {
        return null;
    }

    const photographer = photoInfo.photographer.map(photographer => (
        <span key={photographer}>
            {photographer}
        </span>
    ));

    return (
        <div>
            Photographer: {ComaSeparated(photographer)}
        </div>
    );
};

const AlbumInfo = () => {
    const { photoInfo } = usePhotoInfo();

    if (!photoInfo || photoInfo.album.length === 0) {
        return null;
    }

    const formatLink = (album) => `?album=${album}`.replaceAll(" ", "+");

    const albumLinks = photoInfo.album.map(album =>
        <a key={album} href={formatLink(album)}>
            {album}
        </a>);

    return (
        <div>
            Album: {ComaSeparated(albumLinks)}
        </div>
    );
};

const EventInfo = () => {
    const { photoInfo } = usePhotoInfo();

    if (!photoInfo || photoInfo.event.length === 0) {
        return null;
    }

    const formatLink = (event) => `?album=${photoInfo.album[0]}&event=${event}`.replaceAll(" ", "+");

    const eventLinks = photoInfo.event.map(event =>
        <a key={event} href={formatLink(event)}>
            {event}
        </a>);

    return (
        <div>
            Event: {ComaSeparated(eventLinks)}
        </div>
    );
};

const TeamInfo = () => {
    const { photoInfo } = usePhotoInfo();

    if (!photoInfo || photoInfo.team.length === 0) {
        return null;
    }

    const formatLink = (team) => `?album=${photoInfo.album[0]}&team=${team}`.replaceAll(" ", "+");

    const teamLinks = photoInfo.team.map(team =>
        <a key={team} href={formatLink(team)}>
            {team}
        </a>);

    return (
        <div>
            Team: {ComaSeparated(teamLinks)}
        </div>
    );
};

const PersonInfo = ({ setFace }) => {
    const { photoInfo } = usePhotoInfo();

    if (!photoInfo || photoInfo.person.length === 0) {
        return null;
    }

    const sortedPersons = photoInfo.person.sort((a, b) => a.position.left - b.position.left);

    const formatLink = (person) => `?album=${photoInfo.album[0]}&person=${person.name}`.replaceAll(" ", "+");

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

export { AlbumInfo, EventInfo, PersonInfo, PhotographerInfo, TeamInfo };