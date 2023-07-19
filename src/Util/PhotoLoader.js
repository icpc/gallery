import {useCallback, useEffect, useMemo, useState} from 'react';
import "../consts";
import PhotoService from "./PhotoService";
import {useAppContext} from "../components/AppContext";
import {getEventData} from './DataLoader';


const usePhotoLoader = () => {
    const {data} = useAppContext();

    const [photosByEvent, setPhotosByEvent] = useState(new Map());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [internalEvent, setInternalEvent] = useState(data.event);

    const [events, setEvents] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setEvents(await getEventData(data.year));
        }

        fetchData();
    }, [data.year]);

    useEffect(() => {
        setPhotosByEvent(new Map())
        setPage(1)
        setInternalEvent(data.event)
        setTotalPages(1)
    }, [data.year, data.event, data.text, data.team, data.person])

    const onlyUnique = useCallback((value, index, self) => self.findIndex(photo => photo.id === value.id) === index,
        []);

    const appendPhotos = (event, photos) => {
        const appendedEventPhotos = [...(photosByEvent.get(event) || []), ...photos];
        setPhotosByEvent(new Map(photosByEvent.set(event, appendedEventPhotos.filter(onlyUnique))));
    };

    const getNextEvent = useCallback((currentEvent) => {
        if (currentEvent === undefined || events === undefined) return null;
        const index = events.findIndex(event => event === currentEvent);
        if (index !== -1 && index + 1 < events.length) {
            return events[index + 1];
        }
        return null;
    }, [events])

    const photosList = useMemo(() => [].concat(...Array.from(photosByEvent.values())),
        [photosByEvent]);

    const hasMorePhotos = useMemo(() => page <= totalPages || getNextEvent(internalEvent) !== null,
        [page, totalPages, internalEvent, getNextEvent]);

    const loadMorePhotos = async () => {
        let response;
        if (internalEvent !== undefined) {
            response = await PhotoService.getAllWithEvent(data.year, encodeURIComponent(internalEvent), page)
        } else if (data.team !== undefined) {
            response = await PhotoService.getAllWithTeam(data.year, encodeURIComponent(data.team), page)
        } else if (data.person !== undefined) {
            response = await PhotoService.getAllWithPerson(data.year, encodeURIComponent(data.person), page)
        } else if (data.text !== undefined) {
            response = await PhotoService.getAllWithText(encodeURIComponent(data.text), page);
        }

        if (response) {
            if (page > response.data.photos.pages && getNextEvent(internalEvent) !== null) {
                setPage(1);
                setInternalEvent(getNextEvent(internalEvent));
                return;
            }
            appendPhotos(internalEvent, response.data.photos.photo.map(({datetaken, url_m, url_o, url_l, id}) => ({
                url_preview: url_m ?? url_o,
                url: url_l ?? url_o,
                id,
                origin: url_o,
                year: new Date(datetaken)?.getUTCFullYear()
            })));
            setTotalPages(response.data.photos.pages)
            setPage(page + 1);
        }
    };

    return {hasMorePhotos, loadMorePhotos, photosByEvent, photosList};
};

export default usePhotoLoader;