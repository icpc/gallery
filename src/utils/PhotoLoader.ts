import { useQuery } from "@tanstack/react-query";

import { useAppContext } from "../components/AppContext";
import { TAG_ALBUM, TAG_EVENT, TAG_PERSON, TAG_TEAM, places } from "../consts";
import { FlickrPhoto, GroupedPhotos, Photo } from "../types";

import { getAllPhotosFromPhotoset, getAllWithText } from "./PhotoService";
import { convertRawFlickrTag } from "./convertRawFlickrTag";

/**
 * Custom hook that loads photos based on the current app context.
 */
const usePhotoLoader = () => {
  const { data, events } = useAppContext();

  const formatTag = (prefix: string, tag: string) =>
    convertRawFlickrTag(`${prefix}$${tag}`);

  const matchesFilters = (photo: Photo) => {
    const tags = photo.tags;
    const hasTag = (prefix: string, tag: string | null) => {
      if (!tag) return true;
      return tags.some((t) => t === formatTag(prefix, tag));
    };
    // Process by events or something
    return hasTag(TAG_TEAM, data.team) && hasTag(TAG_PERSON, data.person);
  };

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

  const textQuery = useQuery({
    queryKey: ["photos", "search", data.text],
    queryFn: () => getAllWithText(data.text || ""),
    enabled: !!data.text,
    select: (raw: FlickrPhoto[]): GroupedPhotos[] => {
      const photos = processPhotos(raw);
      const byYear: Record<string, Photo[]> = {};
      photos.forEach((p) => {
        byYear[p.year] ||= [];
        byYear[p.year].push(p);
      });
      return Object.entries(byYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([yr, photos]) => ({ key: yr, photos }));
    },
  });

  const photosetId = places.find(({ year }) => year === data.year)?.photoset_id;

  const yearQuery = useQuery({
    queryKey: ["photos", "photoset", photosetId],
    queryFn: () => getAllPhotosFromPhotoset(photosetId || ""),
    enabled: !!photosetId,
    select: (raw: FlickrPhoto[]): GroupedPhotos[] => {
      const photos = processPhotos(raw).filter(matchesFilters);
      const byEvent: Record<string, Photo[]> = {};
      photos.forEach((p) => {
        byEvent[p.event] ||= [];
        byEvent[p.event].push(p);
      });
      return Object.keys(byEvent)
        .sort((a, b) => {
          const ia = events.indexOf(a);
          const ib = events.indexOf(b);
          return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
        })
        .map((evt) => ({ key: evt, photos: byEvent[evt] }));
    },
  });

  if (data.text) {
    return textQuery;
  } else {
    return yearQuery;
  }
};

export default usePhotoLoader;
