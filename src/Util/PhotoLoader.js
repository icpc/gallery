import { useEffect, useState } from 'react';
import "../consts";
import PhotoService from "./PhotoService";
import { useAppContext } from "../components/AppContext";
import { getEventData } from './DataLoader';


const usePhotoLoader = () => {
    const { data } = useAppContext();

    const [photosByEvent, setPhotosByEvent] = useState(new Map());
    const [photosList, setPhotosList] = useState([]);
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
        setPhotosByEvent(new Map())
        setPage(1)
        setInternalEvent(data.event)
        setTotalPages(1)
    },
        [data.year, data.event, data.text, data.team, data.person]
    )

    useEffect(() => {
        setPhotosList([].concat(...Array.from(photosByEvent.values())));
    },
        [photosByEvent]
    )

    function onlyUnique(value, index, self) {
        return self.findIndex(photo => photo.id === value.id) === index;
    }

    const appendPhotos = (event, photos) => {
        const appendedEventPhotos = [...(photosByEvent.get(event) || []), ...photos];
        setPhotosByEvent(new Map(photosByEvent.set(event, appendedEventPhotos.filter(onlyUnique))));
    };

    const getNextEvent = (currentEvent) => {
        if (currentEvent === undefined || events === undefined)
            return null;
        const index = events.findIndex(event => event === currentEvent);
        if (index !== -1 && index + 1 < events.length) {
            return events[index + 1];
        }
        return null;
    }

    function hasMorePhotos() {
        return page <= totalPages || getNextEvent(internalEvent) !== null
    }

    async function loadMorePhotos() {
        let response;
        if (internalEvent) {
            response = await PhotoService.getAllWithEvent(data.year, encodeURIComponent(internalEvent), page)
        } else if (data.team) {
            response = await PhotoService.getAllWithTeam(data.year, encodeURIComponent(data.team), page)
        } else if (data.person) {
            response = await PhotoService.getAllWithPerson(data.year, encodeURIComponent(data.person), page)
        } else if (data.text) {
            response = await PhotoService.getAllWithText(encodeURIComponent(data.text), page);
        }

        if (response) {
            if (page > response.data.photos.pages && getNextEvent(internalEvent) !== null) {
                setPage(1);
                setInternalEvent(getNextEvent(internalEvent));
                return;
            }
            appendPhotos(internalEvent, [...response.data.photos.photo.map(photo => {
                return {
                    url_preview: (photo?.url_m !== undefined ? photo?.url_m : photo?.url_o),
                    url: (photo?.url_l !== undefined ? photo?.url_l : photo?.url_o),
                    id: photo?.id,
                    origin: photo?.url_o
                }
            })]);
            setTotalPages(response.data.photos.pages)
            setPage(page + 1);
        }
    }

    return { hasMorePhotos, loadMorePhotos, photosByEvent, photosList };
};

export default usePhotoLoader;