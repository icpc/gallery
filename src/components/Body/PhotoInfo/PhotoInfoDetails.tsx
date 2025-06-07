import { FC, ReactNode } from "react";

import { Autocomplete, TextField } from "@mui/material";

import { places } from "../../../consts";
import { Person } from "../../../types";
import { useAppContext } from "../../AppContext";

import { usePhotoInfo } from "./PhotoInfoContext";

const ComaSeparated = (
  list: (ReactNode | string)[],
): (ReactNode | string | boolean)[] => {
  return list.map((item, index) => [index > 0 && ", ", item]).flat();
};

// TODO: Unify

const PhotographerInfo: FC = () => {
  const { photoInfo } = usePhotoInfo();

  if (
    !photoInfo ||
    !photoInfo.photographer ||
    photoInfo.photographer.length === 0
  ) {
    return null;
  }

  const photographer = photoInfo.photographer.map((photographer) => (
    <span key={photographer}>{photographer}</span>
  ));

  return <div>Photographer: {ComaSeparated(photographer)}</div>;
};

const PhotographerEdit: FC = () => {
  const { photoInfo, setPhotographer } = usePhotoInfo();

  if (!photoInfo) {
    return null;
  }

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
        <TextField {...params} label="Photographer" variant="filled" />
      )}
    />
  );
};

const AlbumInfo: FC = () => {
  const { photoInfo } = usePhotoInfo();

  if (!photoInfo || photoInfo.album.length === 0) {
    return null;
  }

  const formatLink = (album: string) => `?album=${album}`.replaceAll(" ", "+");

  const albumLinks = photoInfo.album.map((album) => (
    <a key={album} href={formatLink(album)}>
      {album}
    </a>
  ));

  return <div>Album: {ComaSeparated(albumLinks)}</div>;
};

const AlbumEdit: FC = () => {
  const { photoInfo, setAlbum } = usePhotoInfo();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={places.map(({ year }) => year)}
      value={photoInfo.album}
      onChange={(event, newValue) => {
        setAlbum(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Album" variant="filled" />
      )}
    />
  );
};

const EventInfo: FC = () => {
  const { photoInfo } = usePhotoInfo();

  if (!photoInfo || photoInfo.event.length === 0) {
    return null;
  }

  const formatLink = (event: string) =>
    `?album=${photoInfo.album[0]}&event=${event}`.replaceAll(" ", "+");

  const eventLinks = photoInfo.event.map((event) => (
    <a key={event} href={formatLink(event)}>
      {event}
    </a>
  ));

  return <div>Event: {ComaSeparated(eventLinks)}</div>;
};

const EventEdit: FC = () => {
  const { photoInfo, setEvents } = usePhotoInfo();
  const { events } = useAppContext();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={events}
      value={photoInfo.event || []}
      onChange={(event, newValue) => {
        setEvents(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Event" variant="filled" />
      )}
    />
  );
};

const TeamInfo: FC = () => {
  const { photoInfo } = usePhotoInfo();

  if (!photoInfo || photoInfo.team.length === 0) {
    return null;
  }

  const formatLink = (team: string) =>
    `?album=${photoInfo.album[0]}&team=${team}`.replaceAll(" ", "+");

  const teamLinks = photoInfo.team.map((team) => (
    <a key={team} href={formatLink(team)}>
      {team}
    </a>
  ));

  return <div>Team: {ComaSeparated(teamLinks)}</div>;
};

const TeamEdit: FC = () => {
  const { photoInfo, setTeam } = usePhotoInfo();
  const { teams } = useAppContext();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={teams}
      value={photoInfo.team || []}
      onChange={(event, newValue) => {
        setTeam(newValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Team" variant="filled" />
      )}
    />
  );
};

interface PersonInfoProps {
  setFace: (face: Person | null) => void;
}

const PersonInfo: FC<PersonInfoProps> = ({ setFace }) => {
  const { photoInfo } = usePhotoInfo();

  if (
    !photoInfo ||
    !photoInfo.person ||
    photoInfo.person.length === 0 ||
    photoInfo.album.length === 0
  ) {
    return null;
  }

  const sortedPersons = photoInfo.person.sort(
    (a, b) => (a.position?.left ?? 0) - (b.position?.left ?? 0),
  );

  const formatLink = (person: Person) =>
    `?album=${photoInfo.album[0]}&person=${person.name}`.replaceAll(" ", "+");

  const personLinks = sortedPersons.map((person) => (
    <a
      key={person.name}
      href={formatLink(person)}
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
    >
      {person.name}
    </a>
  ));

  return <div>Person: {ComaSeparated(personLinks)}</div>;
};

const PersonEdit: FC = () => {
  const { photoInfo, setPerson } = usePhotoInfo();

  if (!photoInfo) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      options={[]}
      value={photoInfo.person.map((person) => person.name)}
      onChange={(event, newValue) => {
        setPerson(newValue);
      }}
      fullWidth={false}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Person"
          placeholder="Drag to add new face"
          variant="filled"
        />
      )}
    />
  );
};

export {
  AlbumEdit,
  AlbumInfo,
  EventEdit,
  EventInfo,
  PersonEdit,
  PersonInfo,
  PhotographerEdit,
  PhotographerInfo,
  TeamEdit,
  TeamInfo,
};
