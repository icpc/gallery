import { createContext, useContext, useEffect, useState } from "react";

import { ParsePhotoInfo } from "../../../Util/PhotoInfoHelper";
import { getPhotoInfo } from "../../../Util/PhotoService";
import { useAppContext } from "../../AppContext";

const PhotoInfoContext = createContext(null);

const PhotoInfoProvider = ({ children }) => {
  const { data } = useAppContext();

  const [photoInfo, setPhotoInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [face, setFace] = useState(null);

  useEffect(() => {
    const fullscreenPhotoId = data.fullscreenPhotoId;
    if (fullscreenPhotoId === null) {
      return;
    }
    getPhotoInfo(fullscreenPhotoId).then((response) => {
      const tags = response.data?.photo?.tags?.tag?.map((tag) => tag.raw);
      const description = response.data?.photo?.description._content;
      const newPhotoInfo = ParsePhotoInfo(tags, description);
      setPhotoInfo(newPhotoInfo);
    });
  }, [data.fullscreenPhotoId]);

  function setEvents(newEvents) {
    setPhotoInfo({ ...photoInfo, events: newEvents });
  }

  function setPerson(newPerson) {
    setPhotoInfo({ ...photoInfo, person: newPerson });
  }

  function appendPerson(newPerson) {
    setPerson([...photoInfo.person, newPerson]);
  }

  function setAlbum(newAlbum) {
    setPhotoInfo({ ...photoInfo, album: newAlbum });
  }

  function setPhotographer(newPhotographer) {
    setPhotoInfo({ ...photoInfo, photographer: newPhotographer });
  }

  function setTeam(newTeam) {
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
        setPerson,
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

const usePhotoInfo = () => {
  const context = useContext(PhotoInfoContext);
  if (context === undefined || context === null) {
    throw new Error("usePhotoInfo must be called within PhotoInfoProvider");
  }
  return context;
};

export { PhotoInfoProvider, usePhotoInfo };
