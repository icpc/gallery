import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import { parsePhotoInfo } from "@/features/viewer/utils/photoTags";
import { getPhotoInfo } from "@/services/flickr/api";
import type { Person, PhotoInfo, PhotoInfoContextValue } from "@/types/gallery";

const PhotoInfoContext = createContext<PhotoInfoContextValue | null>(null);

export const PhotoInfoProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data } = useGallery();
  const [photoInfo, setPhotoInfo] = useState<PhotoInfo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [face, setFace] = useState<Person | null>(null);

  useEffect(() => {
    const fullscreenPhotoId = data.fullscreenPhotoId;
    if (fullscreenPhotoId === null) {
      return;
    }
    const controller = new AbortController();
    getPhotoInfo(fullscreenPhotoId, { signal: controller.signal })
      .then((response) => {
        if (!response || controller.signal.aborted) {
          return;
        }
        const tags = response.data?.photo?.tags?.tag?.map((tag) => tag.raw);
        const description = response.data?.photo?.description?._content;
        setPhotoInfo(parsePhotoInfo(tags, description));
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("Failed to get photo info", err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [data.fullscreenPhotoId]);

  const setEvents = useCallback((newEvents: string[]) => {
    setPhotoInfo((prev) => (prev ? { ...prev, event: newEvents } : prev));
  }, []);

  const setPerson = useCallback((newPersonNames: string[]) => {
    setPhotoInfo((prev) => {
      if (!prev) return prev;
      const byName = new Map(prev.person.map((p) => [p.name, p]));
      const nextPersons: Person[] = newPersonNames.map(
        (name) => byName.get(name) ?? { name },
      );
      return { ...prev, person: nextPersons };
    });
  }, []);

  const appendPerson = useCallback((newPerson: Person) => {
    setPhotoInfo((prev) =>
      prev ? { ...prev, person: [...prev.person, newPerson] } : prev,
    );
  }, []);

  const setAlbum = useCallback((newAlbum: string[]) => {
    setPhotoInfo((prev) => (prev ? { ...prev, album: newAlbum } : prev));
  }, []);

  const setPhotographer = useCallback((newPhotographer: string[]) => {
    setPhotoInfo((prev) =>
      prev ? { ...prev, photographer: newPhotographer } : prev,
    );
  }, []);

  const setTeam = useCallback((newTeam: string[]) => {
    setPhotoInfo((prev) => (prev ? { ...prev, team: newTeam } : prev));
  }, []);

  const value = useMemo<PhotoInfoContextValue>(
    () => ({
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
    }),
    [
      photoInfo,
      editMode,
      face,
      setEvents,
      setPerson,
      setAlbum,
      setTeam,
      setPhotographer,
      appendPerson,
    ],
  );

  return (
    <PhotoInfoContext.Provider value={value}>
      {children}
    </PhotoInfoContext.Provider>
  );
};

export function usePhotoInfo(): PhotoInfoContextValue {
  const context = useContext(PhotoInfoContext);
  if (!context) {
    throw new Error("usePhotoInfo must be called within PhotoInfoProvider");
  }
  return context;
}
