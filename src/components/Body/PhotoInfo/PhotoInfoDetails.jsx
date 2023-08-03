import { Autocomplete, TextField } from "@mui/material";

import { years } from "../../../consts";
import { useAppContext } from "../../AppContext";

import { usePhotoInfo } from "./PhotoInfoContext";


const ComaSeparated = (list) => {
    return list.map((item, index) => [
        index > 0 && ", ",
        item
    ]);
};

// TODO: Unify

const PhotographerInfo = () => {
    const { photoInfo, editMode, setPhotographer } = usePhotoInfo();

    if (!photoInfo) {
        return null;
    }

    if (editMode) {
        return (
            <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={photoInfo.photographer}
                onChange={(event, newValue) => {
                    setPhotographer(newValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Photographer"
                        variant="standard"
                    />
                )}
            />
        );
    }

    if (photoInfo.photographer.length === 0) {
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
    const { photoInfo, editMode, setAlbum } = usePhotoInfo();

    if (!photoInfo) {
        return null;
    }

    if (editMode) {
        return (
            <Autocomplete
                multiple
                freeSolo
                options={years}
                value={photoInfo.album}
                onChange={(event, newValue) => {
                    setAlbum(newValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Album"
                        variant="outlined"
                    />
                )}
            />
        );
    }

    if (photoInfo.album.length === 0) {
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
    const { photoInfo, editMode, setEvent } = usePhotoInfo();
    const { events } = useAppContext();

    if (!photoInfo) {
        return null;
    }

    if (editMode) {
        return (
            <Autocomplete
                multiple
                freeSolo
                options={events}
                value={photoInfo.event}
                onChange={(event, newValue) => {
                    setEvent(newValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Event"
                        variant="outlined"
                    />
                )}
            />
        );
    }

    if (photoInfo.event.length === 0) {
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
    const { photoInfo, editMode, setTeam } = usePhotoInfo();
    const { teams } = useAppContext();

    if (!photoInfo) {
        return null;
    }

    if (editMode) {
        return (
            <Autocomplete
                multiple
                freeSolo
                options={teams}
                value={photoInfo.team}
                onChange={(event, newValue) => {
                    setTeam(newValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Team"
                        variant="outlined"
                    />
                )}
            />
        );
    }

    if (photoInfo.team.length === 0) {
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
    const { photoInfo, editMode, setPerson } = usePhotoInfo();

    if (!photoInfo) {
        return null;
    }

    if (editMode) {
        return (
            <Autocomplete
                multiple
                options={[]}
                value={photoInfo.person.map(person => person.name)}
                onChange={(event, newValue) => {
                    setPerson(newValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Person"
                        placeholder="Drag to add new face"
                        variant="outlined"
                    />
                )}
            />
        );
    }

    if (photoInfo.person.length === 0) {
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


    return (
        <div>
            Person: {ComaSeparated(personLinks)}
        </div>
    );
};

export { AlbumInfo, EventInfo, PersonInfo, PhotographerInfo, TeamInfo };
