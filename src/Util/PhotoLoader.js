import { useEffect, useMemo, useState } from "react";

import { useAppContext } from "../components/AppContext";
import { places, TAG_ALBUM } from "../consts";

import PhotoService from "./PhotoService";
import UniqueList from "./UniqueList";


/**
 * Custom hook that loads photos based on the current app context.
 * @returns {Object} - An object containing the following properties:
 * - hasMorePhotos: A function that returns a boolean indicating whether there are more photos to load.
 * - loadMorePhotos: A function that loads more photos.
 * - photosByEvent: A Map object containing photo objects grouped by event.
 * - photosList: An array of all photo objects.
 */
const usePhotoLoader = () => {
    const { data, events } = useAppContext();

    /**
     * State hook that stores a Map object containing photo objects grouped by event.
     * @type {[Map, function]} - A tuple containing the current state value and a function to update it.
     */
    const [photosByEvent, setPhotosByEvent] = useState(new Map());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [internalEvent, setInternalEvent] = useState(undefined);
    const [fetching, setFetching] = useState(false);
    const [axiosCancelController, setAxiosCancelController] = useState(new AbortController());

    useEffect(() => {
        axiosCancelController.abort();
        setPhotosByEvent(new Map());
        setPage(1);
        setInternalEvent(data.event);
        setTotalPages(1);
        setAxiosCancelController(new AbortController());
    }, [data.year, data.event, data.text, data.team, data.person]);


    function appendPhotos(photosByEvent, event, photos) {
        const appendedEventPhotos = [...(photosByEvent.get(event) || []), ...photos];
        return new Map(photosByEvent.set(event, UniqueList(appendedEventPhotos, photo => photo.id)));
    }

    function getNextEvent(currentEvent) {
        if (currentEvent == null || events === undefined)
            return null;
        const index = events.findIndex(event => event === currentEvent);
        if (index === -1 || index + 1 < events.length) {
            return events[index + 1];
        }
        return null;
    }

    function albumFromTags(tags) {
        const albumTag = TAG_ALBUM.toLowerCase();
        const tag = tags.split(" ").find(tag => tag.startsWith(albumTag));
        if (tag === undefined) {
            return "Unknown";
        }
        const targetTag = tag.replaceAll(albumTag, "");
        const found_tag = places.map(({ year }) => year).find((year) => (year.toLowerCase().replace(/[-_\s]/g, "") === targetTag));
        if (found_tag === undefined) {
            return "Unknown";
        }
        return found_tag;
    }

    /**
     * Returns a flattened array of all photos from all events.
     * @returns {Array} - An array of photo objects.
     */
    const photosList = useMemo(() => [].concat(...Array.from(photosByEvent.values())),
        [photosByEvent]);

    /**
     * Returns a boolean indicating whether there are more photos to load.
     * @returns {boolean} - A boolean indicating whether there are more photos to load.
     */
    function hasMorePhotos() {
        return page <= totalPages || getNextEvent(internalEvent) !== null;
    }

    /**
     * Loads more photos.
     * Only one loadMorePhotos call can be active at a time.
     */
    const loadMorePhotos = async () => {
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

        const config = {
            signal: axiosCancelController.signal,
        };

        try {
            let response;
            if (internalEvent) {
                response = await PhotoService.getAllWithEvent(data.year, encodeURIComponent(internalEvent), page, config);
            } else if (data.team) {
                response = await PhotoService.getAllWithTeam(data.year, encodeURIComponent(data.team), page, config);
            } else if (data.person) {
                response = await PhotoService.getAllWithPerson(data.year, encodeURIComponent(data.person), page, config);
            } else if (data.text) {
                response = await PhotoService.getAllWithText(encodeURIComponent(data.text), page, config);
            }

            if (response) {
                const newPhotosByEvent = appendPhotos(photosByEvent, internalEvent, response.data.photos.photo.map(({ url_m, url_o, url_l, id, width_o, width_l, height_o, height_l, tags }) => ({
                    url_preview: url_m ?? url_o,
                    url: url_l ?? url_o,
                    width: width_l ?? width_o,
                    height: height_l ?? height_o,
                    id,
                    origin: url_o,
                    year: albumFromTags(tags),
                })));
                setTotalPages(response.data.photos.pages);
                setPage(page + 1);

                setPhotosByEvent(newPhotosByEvent);
            }
        } finally {
            setFetching(false);
        }
    };

    return { hasMorePhotos, loadMorePhotos, photosByEvent, photosList };
};

export default usePhotoLoader;
