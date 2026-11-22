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
import {
  buildGallerySetTagsPayload,
  extractGalleryPreservedTags,
  getGalleryTagPrefixes,
  parsePhotoInfo,
} from "@/features/viewer/utils/photoTags";
import {
  computePhotoInfoDiff,
  decodeSuggestionPayload,
  encodeSuggestionPayload,
  type PhotoInfoDiff,
} from "@/features/viewer/utils/suggestions";
import {
  getCachedPhotoInfo,
  getPhotoInfo,
  updatePhotoTags,
} from "@/services/flickr/api";
import { loadFlickrAuth } from "@/services/flickr/authStore";
import type {
  FlickrPhotoInfoResponse,
  Person,
  PhotoInfo,
  PhotoInfoContextValue,
} from "@/types/gallery";

const PhotoInfoContext = createContext<PhotoInfoContextValue | null>(null);

function extractFromResponse(response: FlickrPhotoInfoResponse): {
  info: PhotoInfo;
  preserved: string[];
} {
  const tags = response.photo?.tags?.tag?.map((tag) => tag.raw);
  const description = response.photo?.description?._content;
  return {
    info: parsePhotoInfo(tags, description),
    preserved: extractGalleryPreservedTags(tags),
  };
}

export const PhotoInfoProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data, setSuggestion } = useGallery();
  const [originalPhotoInfo, setOriginalPhotoInfo] = useState<PhotoInfo | null>(
    null,
  );
  const [preservedTags, setPreservedTags] = useState<string[]>([]);
  const [photoInfo, setPhotoInfo] = useState<PhotoInfo | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [face, setFace] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fullscreenPhotoId = data.fullscreenPhotoId;
    setFace(null);
    setEditMode(false);
    setSaveError(null);

    if (fullscreenPhotoId === null) {
      setOriginalPhotoInfo(null);
      setPreservedTags([]);
      setPhotoInfo(null);
      setIsLoading(false);
      return;
    }

    const cached = getCachedPhotoInfo(fullscreenPhotoId);
    if (cached) {
      const { info, preserved } = extractFromResponse(cached);
      setOriginalPhotoInfo(info);
      setPreservedTags(preserved);
      setPhotoInfo(info);
      setIsLoading(false);
      return;
    }

    setOriginalPhotoInfo(null);
    setPreservedTags([]);
    setPhotoInfo(null);
    const controller = new AbortController();
    setIsLoading(true);

    void getPhotoInfo(fullscreenPhotoId, controller.signal).then((response) => {
      if (controller.signal.aborted) {
        return;
      }
      setIsLoading(false);
      if (!response) {
        return;
      }
      const { info, preserved } = extractFromResponse(response);
      setOriginalPhotoInfo(info);
      setPreservedTags(preserved);
      setPhotoInfo(info);
    });

    return () => {
      controller.abort();
    };
  }, [data.fullscreenPhotoId]);

  const suggestedPhotoInfo = useMemo<PhotoInfo | null>(
    () => decodeSuggestionPayload(data.suggestion, getGalleryTagPrefixes()),
    [data.suggestion],
  );

  const isPreviewingSuggestion =
    suggestedPhotoInfo !== null && !editMode && data.fullscreenPhotoId !== null;

  const activeDiff = useMemo<PhotoInfoDiff | null>(() => {
    if (!originalPhotoInfo) {
      return null;
    }
    if (editMode && photoInfo) {
      return computePhotoInfoDiff(originalPhotoInfo, photoInfo);
    }
    if (suggestedPhotoInfo) {
      return computePhotoInfoDiff(originalPhotoInfo, suggestedPhotoInfo);
    }
    return null;
  }, [originalPhotoInfo, photoInfo, suggestedPhotoInfo, editMode]);

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

  const resetDraft = useCallback(() => {
    if (originalPhotoInfo) {
      setPhotoInfo(originalPhotoInfo);
    }
    setSaveError(null);
  }, [originalPhotoInfo]);

  const loadSuggestionIntoEditor = useCallback(() => {
    if (suggestedPhotoInfo) {
      setPhotoInfo(suggestedPhotoInfo);
      setEditMode(true);
      setSaveError(null);
    }
  }, [suggestedPhotoInfo]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null);
    setSaveError(null);
  }, [setSuggestion]);

  const buildSuggestionPreviewUrl = useCallback((): string | null => {
    if (!photoInfo || !data.fullscreenPhotoId) {
      return null;
    }
    const encoded = encodeSuggestionPayload(photoInfo, getGalleryTagPrefixes());
    const url = new URL(window.location.href);
    url.searchParams.set("photo", data.fullscreenPhotoId);
    url.searchParams.set("suggest", encoded);
    url.searchParams.delete("settings");
    url.searchParams.delete("slideshow");
    return url.toString();
  }, [photoInfo, data.fullscreenPhotoId]);

  const saveToFlickr = useCallback(
    async (
      targetInfo?: PhotoInfo,
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      const photoId = data.fullscreenPhotoId;
      const infoToSave = targetInfo ?? photoInfo;
      if (!photoId || !infoToSave) {
        return { ok: false, error: "No active photo metadata to save." };
      }
      const credentials = loadFlickrAuth();
      if (!credentials) {
        return {
          ok: false,
          error:
            "Flickr write credentials are not configured. Open ?settings=true to add them.",
        };
      }

      setIsSaving(true);
      setSaveError(null);
      const payload = buildGallerySetTagsPayload(infoToSave, preservedTags);
      const result = await updatePhotoTags(photoId, payload, credentials);
      setIsSaving(false);

      if (result.ok) {
        setOriginalPhotoInfo(infoToSave);
        setPhotoInfo(infoToSave);
        setEditMode(false);
        setSuggestion(null);
        return { ok: true };
      }

      setSaveError(result.error);
      return result;
    },
    [data.fullscreenPhotoId, photoInfo, preservedTags, setSuggestion],
  );

  const value = useMemo<PhotoInfoContextValue>(
    () => ({
      photoInfo,
      originalPhotoInfo,
      suggestedPhotoInfo,
      isPreviewingSuggestion,
      activeDiff,
      isLoading,
      isSaving,
      saveError,
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
      resetDraft,
      loadSuggestionIntoEditor,
      dismissSuggestion,
      buildSuggestionPreviewUrl,
      saveToFlickr,
    }),
    [
      photoInfo,
      originalPhotoInfo,
      suggestedPhotoInfo,
      isPreviewingSuggestion,
      activeDiff,
      isLoading,
      isSaving,
      saveError,
      editMode,
      face,
      setEvents,
      setPerson,
      setAlbum,
      setTeam,
      setPhotographer,
      appendPerson,
      resetDraft,
      loadSuggestionIntoEditor,
      dismissSuggestion,
      buildSuggestionPreviewUrl,
      saveToFlickr,
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
