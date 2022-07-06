import React, {useEffect, useState} from 'react';
import "../consts"
import PhotoService from "../API/PhotoService";
import InfiniteScroll from 'react-infinite-scroller';

const Body = ({year, event, team, person}) => {

    const [photos, setPhotos] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    async function uploadGallery() {
        console.log(page);
        const response = await PhotoService.getAllWithEvent(year, event.replaceAll(" ", "%20"), page);
        setPhotos([...photos, ...response.data.photos.photo.map(photo => photo?.url_m)].filter(onlyUnique));
        setPage(page + 1);
        setTotal(response.data.photos.pages)
    }

    async function firstUploadGallery() {
        const response = await PhotoService.getAllWithEvent(year);
        setPhotos([...photos, ...response.data.photos.photo.map(photo => photo?.url_m)].filter(onlyUnique));
        setTotal(response.data.photos.pages)
    }

    useEffect(() => {
            setPhotos([]);
            setPage(1);
            firstUploadGallery();
        },
        [year]
    )

    useEffect(() => {
            setPhotos([]);
            setPage(1);
            uploadGallery();
        },
        [event]
    )


    /*  useEffect(() => {

      })*/


    return (
        <div>
            {year}
            {event}
            {page}
            {photos.length}
            <InfiniteScroll
                loadMore={uploadGallery}
                hasMore={page <= total}
                loader={<div className="loader" key={0}>Loading ...</div>}
            >
                {photos.map(photo => {
                    return <img src={photo} key={photo}/>
                })}
            </InfiniteScroll>
        </div>
    );
};

export default Body;