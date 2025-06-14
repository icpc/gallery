import { useQuery } from "@tanstack/react-query";

import { useAppContext } from "../components/AppContext";
import { TAG_ALBUM, TAG_EVENT, TAG_PERSON, TAG_TEAM, places } from "../consts";
import { FlickrPhoto, GroupedPhotos, Photo, flickrSizes } from "../types";

import { getAllPhotosFromPhotoset, getAllWithText } from "./PhotoService";
import { convertRawFlickrTag } from "./convertRawFlickrTag";

/**
 * Custom hook that loads photos based on the current app context.
 */
const usePhotoLoader = () => {
  const { data, events } = useAppContext();

  const formatTag = (prefix: string, tag: string) =>
    convertRawFlickrTag(`${prefix}$${tag}`);

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
    photos.map((photo) => {
      const sources = flickrSizes
        .map((s) => {
          const url = photo[`url_${s}` as const];
          const width = photo[`width_${s}` as const];
          const height = photo[`height_${s}` as const];
          if (!url) return null;
          return { url, width: width ?? 0, height: height ?? 0 };
        })
        .filter((x) => x !== null);
      sources.sort((a, b) => a.width - b.width);
      // The default is the first photo with width > 1000
      const src =
        sources.find((source) => source?.width > 1000) ??
        sources[sources.length - 1];

      return {
        sources,
        src,
        id: photo.id,
        tags: photo.tags.split(" "),
        origin: photo.url_o,
        year: albumFromTags(photo.tags.split(" ")),
        event: eventFromTags(photo.tags.split(" ")),
      };
    });

  const textQuery = useQuery({
    queryKey: ["photos", "search", data.text ?? ""],
    queryFn: () => {
      if (!data.text) return [];
      return getAllWithText(data.text);
    },
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
    queryKey: ["photos", "photoset", photosetId ?? ""],
    queryFn: () => {
      if (!photosetId) return [];
      return getAllPhotosFromPhotoset(photosetId);
    },
    enabled: !!photosetId,
    select: (raw: FlickrPhoto[]): GroupedPhotos[] => {
      const photos = processPhotos(raw).filter((photo: Photo) => {
        const tags = photo.tags;
        const hasTag = (prefix: string, tag: string | null) => {
          if (!tag) return true;
          return tags.some((t) => t === formatTag(prefix, tag));
        };
        return (
          hasTag(TAG_ALBUM, data.year) &&
          hasTag(TAG_TEAM, data.team) &&
          hasTag(TAG_PERSON, data.person)
        );
      });
      const byEvent: Record<string, Photo[]> = {};
      if (data.event) {
        events.forEach((event) => {
          byEvent[event] = [];
        });
      }
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
