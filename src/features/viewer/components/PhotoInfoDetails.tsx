import { Autocomplete, TextField } from "@mui/material";
import type { FC, ReactNode } from "react";
import { places } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { usePhotoInfo } from "@/features/viewer/state/PhotoInfoContext";
import type { Person } from "@/types/gallery";

function commaSeparated(list: (ReactNode | string)[]): ReactNode[] {
  return list.flatMap((item, index) => (index > 0 ? [", ", item] : [item]));
}

export const PhotographerInfo: FC = () => {
  const { photoInfo } = usePhotoInfo();
  if (!photoInfo?.photographer.length) return null;

  return (
    <div>
      Photographer:{" "}
      {commaSeparated(
        photoInfo.photographer.map((name) => <span key={name}>{name}</span>),
      )}
    </div>
  );
};

export const PhotographerEdit: FC = () => {
  const { photoInfo, setPhotographer } = usePhotoInfo();
  if (!photoInfo) return null;

  return (
    <Autocomplete
      multiple
      freeSolo
      options={[]}
      value={photoInfo.photographer}
      onChange={(_event, newValue) => setPhotographer(newValue)}
      renderInput={(params) => (
        <TextField {...params} label="Photographer" variant="filled" />
      )}
    />
  );
};

export const AlbumInfo: FC = () => {
  const { photoInfo } = usePhotoInfo();
  if (!photoInfo?.album.length) return null;

  return (
    <div>
      Album:{" "}
      {commaSeparated(
        photoInfo.album.map((album) => (
          <a key={album} href={`?album=${album}`.replaceAll(" ", "+")}>
            {album}
          </a>
        )),
      )}
    </div>
  );
};

export const AlbumEdit: FC = () => {
  const { photoInfo, setAlbum } = usePhotoInfo();
  if (!photoInfo) return null;

  return (
    <Autocomplete
      multiple
      freeSolo
      options={places.map(({ year }) => year)}
      value={photoInfo.album}
      onChange={(_event, newValue) => setAlbum(newValue)}
      renderInput={(params) => (
        <TextField {...params} label="Album" variant="filled" />
      )}
    />
  );
};

export const EventInfo: FC = () => {
  const { photoInfo } = usePhotoInfo();
  if (!photoInfo?.event.length || !photoInfo.album.length) return null;

  return (
    <div>
      Event:{" "}
      {commaSeparated(
        photoInfo.event.map((event) => (
          <a
            key={event}
            href={`?album=${photoInfo.album[0]}&event=${event}`.replaceAll(
              " ",
              "+",
            )}
          >
            {event}
          </a>
        )),
      )}
    </div>
  );
};

export const EventEdit: FC = () => {
  const { photoInfo, setEvents } = usePhotoInfo();
  const { events } = useGallery();
  if (!photoInfo) return null;

  return (
    <Autocomplete
      multiple
      freeSolo
      options={events}
      value={photoInfo.event}
      onChange={(_event, newValue) => setEvents(newValue)}
      renderInput={(params) => (
        <TextField {...params} label="Event" variant="filled" />
      )}
    />
  );
};

export const TeamInfo: FC = () => {
  const { photoInfo } = usePhotoInfo();
  if (!photoInfo?.team.length) return null;

  return (
    <div>
      Team:{" "}
      {commaSeparated(
        photoInfo.team.map((team) => (
          <a
            key={team}
            href={`?album=${photoInfo.album[0]}&team=${team}`.replaceAll(
              " ",
              "+",
            )}
          >
            {team}
          </a>
        )),
      )}
    </div>
  );
};

export const TeamEdit: FC = () => {
  const { photoInfo, setTeam } = usePhotoInfo();
  const { teams } = useGallery();
  if (!photoInfo) return null;

  return (
    <Autocomplete
      multiple
      freeSolo
      options={teams}
      value={photoInfo.team}
      onChange={(_event, newValue) => setTeam(newValue)}
      renderInput={(params) => (
        <TextField {...params} label="Team" variant="filled" />
      )}
    />
  );
};

export const PersonInfo: FC<{ setFace: (face: Person | null) => void }> = ({
  setFace,
}) => {
  const { photoInfo } = usePhotoInfo();
  if (!photoInfo?.person.length || !photoInfo.album.length) return null;

  const sortedPersons = [...photoInfo.person].sort(
    (a, b) => (a.position?.left ?? 0) - (b.position?.left ?? 0),
  );

  return (
    <div>
      Person:{" "}
      {commaSeparated(
        sortedPersons.map((person) => (
          <a
            key={`${person.name}-${person.position?.left ?? "nopos"}`}
            href={`?album=${photoInfo.album[0]}&person=${person.name}`.replaceAll(
              " ",
              "+",
            )}
            onMouseLeave={() => setFace(null)}
            onMouseEnter={() => setFace(person)}
          >
            {person.name}
          </a>
        )),
      )}
    </div>
  );
};

export const PersonEdit: FC = () => {
  const { photoInfo, setPerson } = usePhotoInfo();
  if (!photoInfo) return null;

  return (
    <Autocomplete
      multiple
      options={[]}
      value={photoInfo.person.map((person) => person.name)}
      onChange={(_event, newValue) => setPerson(newValue)}
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
