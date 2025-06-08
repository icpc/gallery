import { useEffect, useMemo, useRef, useState } from "react";

import { useAppContext } from "../components/AppContext";
import { TAG_ALBUM, places } from "../consts";
import { FlickrPhoto, Photo } from "../types";

import {
  getAllWithEvent,
  getAllWithPerson,
  getAllWithTeam,
  getAllWithText,
} from "./PhotoService";
import UniqueList from "./UniqueList";

/**
 * Custom hook that loads photos based on the current app context.
 */
const usePhotoLoader = () => {
  const { data, events = [] } = useAppContext();

  /**
   * State hook that stores a Map object containing photo objects grouped by event.
   * @type {[Map, function]} - A tuple containing the current state value and a function to update it.
   */
  const [photosByEvent, setPhotosByEvent] = useState<
    Map<string | null, Photo[]>
  >(new Map());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [internalEvent, setInternalEvent] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const abortControllerRef = useRef<AbortController>();

  // Add a ref to track if the component is mounted
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const currentAbortController = abortControllerRef.current;
    return () => {
      isMountedRef.current = false;
      if (currentAbortController) {
        currentAbortController.abort();
      }
    };
  }, []);

  useEffect(() => {
    const currentAbortController = abortControllerRef.current;
    if (currentAbortController) {
      currentAbortController.abort();
    }
    const newController = new AbortController();
    abortControllerRef.current = newController;

    setPhotosByEvent(new Map());
    setPage(1);
    setInternalEvent(data.event);
    setTotalPages(1);
  }, [data.year, data.event, data.text, data.team, data.person]);

  function appendPhotos(
    photosByEvent: Map<string | null, Photo[]>,
    event: string | null | undefined,
    photos: Photo[],
  ): Map<string | null, Photo[]> {
    const key = event ?? null;
    const appendedEventPhotos = [...(photosByEvent.get(key) || []), ...photos];
    return new Map(
      photosByEvent.set(
        key,
        UniqueList(appendedEventPhotos, (photo) => photo.id),
      ),
    );
  }

  function getNextEvent(
    currentEvent: string | null | undefined,
  ): string | null {
    if (currentEvent == null || events === undefined) return null;
    const index = events.findIndex((event) => event === currentEvent);
    if (index === -1 || index + 1 < events.length) {
      return events[index + 1];
    }
    return null;
  }

  function albumFromTags(tags: string): string {
    const albumTag = TAG_ALBUM.toLowerCase();
    const tag = tags.split(" ").find((tag) => tag.startsWith(albumTag));
    if (tag === undefined) {
      return "Unknown";
    }
    const targetTag = tag.replaceAll(albumTag, "");
    const found_tag = places
      .map(({ year }) => year)
      .find((year) => year.toLowerCase().replace(/[-_\s]/g, "") === targetTag);
    if (found_tag === undefined) {
      return "Unknown";
    }
    return found_tag;
  }

  /**
   * Returns a flattened array of all photos from all events.
   */
  const photosList: Photo[] = useMemo(
    () => ([] as Photo[]).concat(...Array.from(photosByEvent.values())),
    [photosByEvent],
  );

  function hasMorePhotos(): boolean {
    return page <= totalPages || getNextEvent(internalEvent) !== null;
  }

  /**
   * Loads more photos.
   * Only one loadMorePhotos call can be active at a time.
   */
  const loadMorePhotos = async (): Promise<void> => {
    if (fetching) {
      return;
    }

    setFetching(true);

    const nextEvent = getNextEvent(internalEvent);
    if (page > totalPages && nextEvent !== null) {
      setPage(1);
      setTotalPages(1);
      setInternalEvent(nextEvent);
      setFetching(false);
      return;
    }

    // Always use a fresh controller for each request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const config: RequestInit = {
      signal: controller.signal,
    };

    try {
      let response;
      if (internalEvent) {
        response = await getAllWithEvent(
          data.year,
          internalEvent,
          page,
          config,
        );
      } else if (data.team) {
        response = await getAllWithTeam(data.year, data.team, page, config);
      } else if (data.person) {
        response = await getAllWithPerson(data.year, data.person, page, config);
      } else if (data.text) {
        response = await getAllWithText(data.text, page, config);
      } else {
        setFetching(false);
        return;
      }

      if (response && isMountedRef.current) {
        const newPhotos: Photo[] = response.data.photos.photo.map(
          ({
            url_m,
            url_o,
            url_l,
            id,
            width_o = 0,
            width_l = 0,
            height_o = 0,
            height_l = 0,
            tags,
          }: FlickrPhoto) => ({
            url_preview: url_m ?? url_o ?? "",
            url: url_l ?? url_o ?? "",
            width: width_l ?? width_o,
            height: height_l ?? height_o,
            id,
            origin: url_o ?? "",
            year: albumFromTags(tags),
          }),
        );
        const newPhotosByEvent = appendPhotos(
          photosByEvent,
          internalEvent,
          newPhotos,
        );
        setTotalPages(response.data.photos.pages);
        setPage(page + 1);
        setPhotosByEvent(newPhotosByEvent);
      }
    } finally {
      if (isMountedRef.current) setFetching(false);
    }
  };

  return { hasMorePhotos, loadMorePhotos, photosByEvent, photosList };
};

export default usePhotoLoader;
