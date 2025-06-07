import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { ParsePhotoInfo } from "../../../Util/PhotoInfoHelper";
import { getPhotoInfo } from "../../../Util/PhotoService";
import { Person, PhotoInfo, PhotoInfoContextType } from "../../../types";
import { useAppContext } from "../../AppContext";

const PhotoInfoContext = createContext<PhotoInfoContextType | null>(null);

interface Props {
  children: ReactNode;
}

const PhotoInfoProvider: FC<Props> = ({ children }) => {
  const { data } = useAppContext();

  const [photoInfo, setPhotoInfo] = useState<PhotoInfo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [face, setFace] = useState<Person | null>(null);

  useEffect(() => {
    const fullscreenPhotoId = data.fullscreenPhotoId;
    if (fullscreenPhotoId === null) {
      return;
    }
    getPhotoInfo(fullscreenPhotoId)
      .then((response) => {
        if (!response) {
          return;
        }
        const tags = response.data?.photo?.tags?.tag?.map((tag) => tag.raw);
        const description = response.data?.photo?.description?._content;
        const newPhotoInfo = ParsePhotoInfo(tags, description);
        setPhotoInfo(newPhotoInfo);
      })
      .catch((err) => {
        console.error("Failed to get photo info", err);
      });
  }, [data.fullscreenPhotoId]);

  function setEvents(newEvents: string[]) {
    if (!photoInfo) return;
    setPhotoInfo({ ...photoInfo, event: newEvents });
  }

  function setPerson(newPerson: Person[]) {
    if (!photoInfo) return;
    setPhotoInfo({ ...photoInfo, person: newPerson });
  }

  function setPersonNames(newPersonNames: string[]) {
    const newPersons: Person[] = newPersonNames.map((name) => ({ name }));
    setPhotoInfo({ ...photoInfo, person: newPersons } as PhotoInfo);
  }

  function appendPerson(newPerson: Person) {
    setPerson([...(photoInfo?.person || []), newPerson]);
  }

  function setAlbum(newAlbum: string[]) {
    if (!photoInfo) return;
    setPhotoInfo({ ...photoInfo, album: newAlbum });
  }

  function setPhotographer(newPhotographer: string[]) {
    if (!photoInfo) return;
    setPhotoInfo({ ...photoInfo, photographer: newPhotographer });
  }

  function setTeam(newTeam: string[]) {
    if (!photoInfo) return;
    setPhotoInfo({ ...photoInfo, team: newTeam });
  }

  return (
    <PhotoInfoContext.Provider
      value={{
        photoInfo,
        setPhotoInfo,
        editMode,
        setEditMode,
        face,
        setFace,
        setEvents,
        setPerson: setPersonNames,
        setAlbum,
        setTeam,
        setPhotographer,
        appendPerson,
      }}
    >
      {children}
    </PhotoInfoContext.Provider>
  );
};

const usePhotoInfo = (): PhotoInfoContextType => {
  const context = useContext(PhotoInfoContext);
  if (context === undefined || context === null) {
    throw new Error("usePhotoInfo must be called within PhotoInfoProvider");
  }
  return context;
};

export { PhotoInfoProvider, usePhotoInfo };
