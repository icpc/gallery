import { useEffect, useMemo, useState } from "react";
import axios from "axios";

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

    /**
     * State hook that stores a Map object containing photo objects grouped by event.
     * @type {[Map, function]} - A tuple containing the current state value and a function to update it.
     */
    const [photosByEvent, setPhotosByEvent] = useState(new Map());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [internalEvent, setInternalEvent] = useState(undefined);
    const [fetching, setFetching] = useState(false);
    const [axiosCancelTokenSource, setAxiosCancelTokenSource] = useState(new axios.CancelToken.source());

    const [events, setEvents] = useState([]);

    useEffect(() => {
        let isCancelled = false;

        getEventData(data.year)
            .then(eventsData => {
                if (!isCancelled) {
                    setEvents(eventsData);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [data.year]);

    useEffect(() => {
        axiosCancelTokenSource.cancel();
        setPhotosByEvent(new Map());
        setPage(1);
        setInternalEvent(data.event);
        setTotalPages(1);
        setAxiosCancelTokenSource(new axios.CancelToken.source());
    }, [data.year, data.event, data.text, data.team, data.person]);

    const onlyUnique = (value, index, self) => self.findIndex(photo => photo.id === value.id) === index;

    function appendPhotos(photosByEvent, event, photos) {
        const appendedEventPhotos = [...(photosByEvent.get(event) || []), ...photos];
        return new Map(photosByEvent.set(event, appendedEventPhotos.filter(onlyUnique)));
    }

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
            setInternalEvent(nextEvent);
            setFetching(false);
            return;
        }

        const config = {
            cancelToken: axiosCancelTokenSource.token,
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
                const newPhotosByEvent = appendPhotos(photosByEvent, internalEvent, response.data.photos.photo.map(({ datetaken, url_m, url_o, url_l, id }) => ({
                    url_preview: url_m ?? url_o,
                    url: url_l ?? url_o,
                    id,
                    origin: url_o,
                    year: new Date(datetaken)?.getUTCFullYear(),
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
