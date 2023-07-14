import { useContext, useEffect, useState } from 'react';
import "../../consts";
import PhotoService from "../../Util/PhotoService";
import { AppContext } from "../AppContext";


const usePhotoLoader = () => {
    const { data } = useContext(AppContext);

    const [photosByEvent, setPhotosByEvent] = useState(new Map());
    const [photosList, setPhotosList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [internalEvent, setInternalEvent] = useState(undefined);

    useEffect(() => {
        setPhotosByEvent(new Map())
        setPage(1)
        setInternalEvent(data.event)
        setTotalPages(1)
    },
        [data, data.year, data.event, data.text, data.team, data.person]
    )

    useEffect(() => {
        setPhotosList([].concat(...Array.from(photosByEvent.values())));
    },
        [photosByEvent]
    )

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    const appendPhotos = (event, photos) => {
        setPhotosByEvent(new Map(photosByEvent.set(event, [...(photosByEvent.get(event) || []), ...photos].filter(onlyUnique))));
    };

    const getNextEvent = (currentEvent) => {
        const events = data?.events;
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
        if (internalEvent !== undefined) {
            response = await PhotoService.getAllWithEvent(data.year, internalEvent.replaceAll(" ", "%20"), page)
        } else if (data?.team !== undefined) {
            response = await PhotoService.getAllWithTeam(data.year, data.team.replaceAll(" ", "%20"), page)
        } else if (data?.person !== undefined) {
            response = await PhotoService.getAllWithPerson(data.year, data.person.replaceAll(" ", "%20"), page)
        } else if (data?.text !== undefined) {
            response = await PhotoService.getAllWithText(data.text.replaceAll(" ", "%20"), page);
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