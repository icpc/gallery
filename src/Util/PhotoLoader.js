import { useEffect, useMemo, useState } from "react";

import { useAppContext } from "../components/AppContext";

import { getEventData } from "./DataLoader";
import PhotoService from "./PhotoService";


/**
 * Custom hook that loads photos based on the current app context.
 * @returns {Object} - An object containing the following properties:
 * - hasMorePhotos: A function that returns a boolean indicating whether there are more photos to load.
 * - loadMorePhotos: A function that loads more photos.
 * - photosByEvent: A Map object containing photo objects grouped by event.
 * - photosList: An array of all photo objects.
 */
const usePhotoLoader = () => {
    const { data } = useAppContext();

    const [photosByEvent, setPhotosByEvent] = useState(new Map());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [internalEvent, setInternalEvent] = useState(undefined);

    const [events, setEvents] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setEvents(await getEventData(data.year));
        }
        fetchData();
    }, [data.year]);

    useEffect(() => {
        setPhotosByEvent(new Map());
        setPage(1);
        setInternalEvent(data.event);
        setTotalPages(1);
    }, [data.year, data.event, data.text, data.team, data.person]);

    const onlyUnique = (value, index, self) => self.findIndex(photo => photo.id === value.id) === index;

    const appendPhotos = (event, photos) => {
        const appendedEventPhotos = [...(photosByEvent.get(event) || []), ...photos];
        setPhotosByEvent(new Map(photosByEvent.set(event, appendedEventPhotos.filter(onlyUnique))));
    };

    function getNextEvent(currentEvent) {
        if (currentEvent === undefined || events === undefined)
            return null;
        const index = events.findIndex(event => event === currentEvent);
        if (index !== -1 && index + 1 < events.length) {
            return events[index + 1];
        }
        return null;
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

    async function loadMorePhotos() {
        let response;
        if (internalEvent) {
            response = await PhotoService.getAllWithEvent(data.year, encodeURIComponent(internalEvent), page);
        } else if (data.team) {
            response = await PhotoService.getAllWithTeam(data.year, encodeURIComponent(data.team), page);
        } else if (data.person) {
            response = await PhotoService.getAllWithPerson(data.year, encodeURIComponent(data.person), page);
        } else if (data.text) {
            response = await PhotoService.getAllWithText(encodeURIComponent(data.text), page);
        }

        if (response) {
            if (page > response.data.photos.pages && getNextEvent(internalEvent) !== null) {
                setPage(1);
                setInternalEvent(getNextEvent(internalEvent));
                return;
            }
            appendPhotos(internalEvent, response.data.photos.photo.map(({ datetaken, url_m, url_o, url_l, id }) => ({
                url_preview: url_m ?? url_o,
                url: url_l ?? url_o,
                id,
                origin: url_o,
                year: new Date(datetaken)?.getUTCFullYear(),
            })));
            setTotalPages(response.data.photos.pages);
            setPage(page + 1);
        }
    }

    return { hasMorePhotos, loadMorePhotos, photosByEvent, photosList };
};

export default usePhotoLoader;
