import { useQuery } from "@tanstack/react-query";
import { places, TAG_ALBUM, TAG_EVENT, TAG_TEAM } from "@/config/gallery";
import { useGallery } from "@/features/gallery/state/GalleryContext";
import {
  getAllPhotosFromPhotoset,
  getAllWithText,
} from "@/services/flickr/api";
import { convertRawFlickrTag, formatFlickrTag } from "@/services/flickr/tags";
import {
  type FlickrPhoto,
  flickrSizes,
  type GroupedPhotos,
  type Photo,
} from "@/types/gallery";

export function usePhotoLoader() {
  const { data, events } = useGallery();

  const albumFromTags = (tags: string[]) =>
    places
      .map(({ year }) => year)
      .find((year) =>
        tags.some((tag) => tag === formatFlickrTag(TAG_ALBUM, year)),
      ) ?? "Unknown";

  const eventsFromTags = (tags: string[]) =>
    events.filter((event) =>
      tags.some((t) => t === formatFlickrTag(TAG_EVENT, event)),
    );

  const processPhotos = (photos: FlickrPhoto[]): Photo[] =>
    photos
      .map((photo): Photo | null => {
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
        const src =
          sources.find((source) => source.width > 2000) ??
          sources[sources.length - 1];
        if (!src) return null;

        const tags = photo.tags.split(" ");
        return {
          sources,
          src,
          id: photo.id,
          tags,
          origin: photo.url_o,
          year: albumFromTags(tags),
          events: eventsFromTags(tags),
        };
      })
      .filter((photo): photo is Photo => photo !== null);

  const textQuery = useQuery({
    queryKey: ["photos", "search", TAG_ALBUM, data.text ?? ""],
    queryFn: () => {
      if (!data.text) return [];
      return getAllWithText(`${data.text}%20and%20${TAG_ALBUM}$`);
    },
    enabled: !!data.text,
    select: (raw: FlickrPhoto[]): GroupedPhotos[] => {
      const photos = processPhotos(raw);
      const byYear: Record<string, Photo[]> = {};
      for (const p of photos) {
        const list = byYear[p.year] ?? [];
        list.push(p);
        byYear[p.year] = list;
      }
      return Object.entries(byYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([yr, yearPhotos]) => ({ key: yr, photos: yearPhotos }));
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
          return tags.includes(formatFlickrTag(prefix, tag));
        };
        const hasPerson = (person: string | null) => {
          if (!person) return true;
          return tags.some((t) => t.includes(convertRawFlickrTag(person)));
        };
        return (
          hasTag(TAG_ALBUM, data.year) &&
          hasTag(TAG_TEAM, data.team) &&
          hasPerson(data.person)
        );
      });
      const byEvent: Record<string, Photo[]> = {};
      if (data.event) {
        for (const event of events) {
          byEvent[event] = [];
        }
      }
      for (const p of photos) {
        const eventList = p.events.length > 0 ? p.events : ["Unknown"];
        for (const event of eventList) {
          const list = byEvent[event] ?? [];
          list.push(p);
          byEvent[event] = list;
        }
      }
      return Object.keys(byEvent)
        .sort((a, b) => {
          const ia = events.indexOf(a);
          const ib = events.indexOf(b);
          return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
        })
        .map((evt) => ({ key: evt, photos: byEvent[evt] ?? [] }));
    },
  });

  return data.text ? textQuery : yearQuery;
}
