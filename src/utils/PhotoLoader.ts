import { useCallback, useEffect, useState } from "react";

import { useAppContext } from "../components/AppContext";
import { TAG_ALBUM, TAG_EVENT, TAG_PERSON, TAG_TEAM, places } from "../consts";
import { FlickrPhoto, Photo } from "../types";

import { getAllPhotosFromPhotoset, getAllWithText } from "./PhotoService";
import { convertRawFlickrTag } from "./convertRawFlickrTag";

/**
 * Custom hook that loads photos based on the current app context.
 */
const usePhotoLoader = () => {
  const { data, events } = useAppContext();
  const [organizedPhotos, setOrganizedPhotos] = useState<
    { key: string; photos: Photo[] }[]
  >([]);

  const formatTag = (prefix: string, tag: string) =>
    convertRawFlickrTag(`${prefix}$${tag}`);

  const matchesFilters = useCallback(
    (photo: Photo) => {
      const tags = photo.tags;
      const hasTag = (prefix: string, tag: string | null) => {
        if (!tag) return true;
        return tags.some((t) => t === formatTag(prefix, tag));
      };
      // Process by events or something
      return hasTag(TAG_TEAM, data.team) && hasTag(TAG_PERSON, data.person);
    },
    [data.person, data.team],
  );

  const albumFromTags = (tags: string[]) =>
    places
      .map(({ year }) => year)
      .find((year) => tags.some((tag) => tag === formatTag(TAG_ALBUM, year))) ??
    "Unknown";

  const eventFromTags = (tags: string[]) =>
    events.find((event) =>
      tags.some((t) => t === formatTag(TAG_EVENT, event)),
    ) ?? "Unknown";

  const processPhotos = (photos: FlickrPhoto[]): Photo[] =>
    photos.map(
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
      }) => ({
        url_preview: url_m ?? url_o ?? "",
        url: url_l ?? url_o ?? "",
        width: width_l ?? width_o,
        height: height_l ?? height_o,
        id,
        origin: url_o ?? "",
        tags: tags.split(" "),
        year: albumFromTags(tags.split(" ")),
        event: eventFromTags(tags.split(" ")),
      }),
    );

  useEffect(() => {
    setOrganizedPhotos([]);
    if (data.text) {
      getAllWithText(data.text).then((photos) => {
        const processed_photos = processPhotos(photos);
        // If we search by text, we should group by year (decreasing order)
        const groups: Record<string, Photo[]> = {};
        processed_photos.forEach((photo) => {
          groups[photo.year] = groups[photo.year] || [];
          groups[photo.year].push(photo);
        });
        const organized = Object.keys(groups)
          .sort((a, b) => Number(b) - Number(a))
          .map((year) => ({ key: year, photos: groups[year] }));
        setOrganizedPhotos(organized);
      });
      return;
    }
    getAllPhotosFromPhotoset(
      places.find(({ year }) => year === data.year)?.photoset_id ?? "",
    ).then((photos) => {
      const processed_photos = processPhotos(photos);
      const filtered = processed_photos.filter(matchesFilters);
      // If we search by year, we should group by event
      // Events should be sorted in the order of the events array, and if not found, should be placed at the end
      const groups: Record<string, Photo[]> = {};
      filtered.forEach((photo) => {
        groups[photo.event] = groups[photo.event] || [];
        groups[photo.event].push(photo);
      });
      const organized = Object.keys(groups)
        .sort((a, b) => {
          const indexA = events.indexOf(a);
          const indexB = events.indexOf(b);
          return (
            (indexA === -1 ? Infinity : indexA) -
            (indexB === -1 ? Infinity : indexB)
          );
        })
        .map((eventKey) => ({
          key: eventKey,
          photos: groups[eventKey],
        }));
      setOrganizedPhotos(organized);
    });
  }, [places, data.text, data.year, events]);

  return { organizedPhotos };
};

export default usePhotoLoader;
