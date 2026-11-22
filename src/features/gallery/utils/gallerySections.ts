import { convertRawFlickrTag, formatFlickrTag } from "@/services/flickr/tags";
import {
  type FlickrPhoto,
  flickrSizes,
  type Photo,
  type PhotoSource,
} from "@/types/gallery";

export interface GalleryPhotoItem {
  entryKey: string;
  sectionKey: string;
  flatIndex: number;
  photo: Photo;
}

export interface GallerySection {
  key: string;
  items: GalleryPhotoItem[];
}

export interface GallerySequence {
  sections: GallerySection[];
  items: GalleryPhotoItem[];
}

export interface NormalizePhotosConfig {
  years: readonly string[];
  events: readonly string[];
  tagAlbum: string;
  tagEvent: string;
}

/**
 * Merges multiple Flickr photo pages into a deduplicated list sorted by
 * `date_taken` descending. Used to combine progressive page-1 results with
 * streamed remaining pages safely.
 */
export function mergeFlickrPhotoPages(
  ...pages: ReadonlyArray<readonly FlickrPhoto[]>
): FlickrPhoto[] {
  const seen = new Set<string>();
  const merged: FlickrPhoto[] = [];

  for (const page of pages) {
    for (const photo of page) {
      if (!seen.has(photo.id)) {
        seen.add(photo.id);
        merged.push(photo);
      }
    }
  }

  merged.sort((a, b) => {
    const dateA = a.date_taken ? Date.parse(a.date_taken) : 0;
    const dateB = b.date_taken ? Date.parse(b.date_taken) : 0;
    return dateB - dateA;
  });

  return merged;
}

export function normalizeFlickrPhotos(
  rawPhotos: readonly FlickrPhoto[],
  config: NormalizePhotosConfig,
): Photo[] {
  const albumMatchers = config.years.map((year) => ({
    year,
    tag: formatFlickrTag(config.tagAlbum, year),
  }));
  const eventMatchers = config.events.map((event) => ({
    event,
    tag: formatFlickrTag(config.tagEvent, event),
  }));

  const normalized: Photo[] = [];

  for (const photo of rawPhotos) {
    const sources: PhotoSource[] = [];
    for (const size of flickrSizes) {
      const url = photo[`url_${size}` as const];
      if (!url) continue;
      sources.push({
        url,
        width: Number(photo[`width_${size}` as const]) || 0,
        height: Number(photo[`height_${size}` as const]) || 0,
      });
    }
    sources.sort((a, b) => a.width - b.width);

    const src =
      sources.find((source) => source.width > 2000) ??
      sources[sources.length - 1];
    if (!src) continue;

    const tags = photo.tags ? photo.tags.split(" ") : [];
    const tagSet = new Set(tags);

    const year =
      albumMatchers.find((matcher) => tagSet.has(matcher.tag))?.year ??
      "Unknown";
    const events = eventMatchers
      .filter((matcher) => tagSet.has(matcher.tag))
      .map((matcher) => matcher.event);

    normalized.push({
      id: photo.id,
      sources,
      src,
      origin: photo.url_o,
      tags,
      year,
      events,
    });
  }

  return normalized;
}

export interface BuildSectionsOptions {
  mode: "search" | "album";
  year: string | null;
  event: string | null;
  team: string | null;
  person: string | null;
  eventsOrder: readonly string[];
  tagAlbum: string;
  tagTeam: string;
}

/**
 * Produces canonical ordered sections AND a flat duplicate-safe item list where
 * each rendered tile has a unique `entryKey` (`${sectionKey}:${photo.id}`) and
 * exact `flatIndex`. A photo tagged with multiple events stays visible in every
 * matching event section without causing Next/Prev navigation loops.
 */
export function buildGallerySections(
  photos: readonly Photo[],
  options: BuildSectionsOptions,
): GallerySequence {
  const buckets = new Map<string, Photo[]>();

  if (options.mode === "search") {
    for (const photo of photos) {
      const list = buckets.get(photo.year) ?? [];
      list.push(photo);
      buckets.set(photo.year, list);
    }

    const sortedKeys = Array.from(buckets.keys()).sort(
      (a, b) => Number(b) - Number(a),
    );
    return flattenBuckets(sortedKeys, buckets);
  }

  const albumTag = options.year
    ? formatFlickrTag(options.tagAlbum, options.year)
    : null;
  const teamTag = options.team
    ? formatFlickrTag(options.tagTeam, options.team)
    : null;
  const personToken = options.person
    ? convertRawFlickrTag(options.person)
    : null;

  const filtered = photos.filter((photo) => {
    if (albumTag && !photo.tags.includes(albumTag)) {
      return false;
    }
    if (teamTag && !photo.tags.includes(teamTag)) {
      return false;
    }
    if (personToken && !photo.tags.some((t) => t.includes(personToken))) {
      return false;
    }
    return true;
  });

  if (options.event) {
    for (const evt of options.eventsOrder) {
      buckets.set(evt, []);
    }
  }

  for (const photo of filtered) {
    const targetEvents = photo.events.length > 0 ? photo.events : ["Unknown"];
    for (const evt of targetEvents) {
      const list = buckets.get(evt) ?? [];
      list.push(photo);
      buckets.set(evt, list);
    }
  }

  const orderIndex = new Map(
    options.eventsOrder.map((evt, index) => [evt, index]),
  );
  const sortedKeys = Array.from(buckets.keys()).sort((a, b) => {
    const ia = orderIndex.get(a) ?? Number.POSITIVE_INFINITY;
    const ib = orderIndex.get(b) ?? Number.POSITIVE_INFINITY;
    return ia - ib;
  });

  return flattenBuckets(sortedKeys, buckets);
}

function flattenBuckets(
  sortedKeys: readonly string[],
  buckets: ReadonlyMap<string, Photo[]>,
): GallerySequence {
  const sections: GallerySection[] = [];
  const items: GalleryPhotoItem[] = [];

  for (const sectionKey of sortedKeys) {
    const sectionPhotos = buckets.get(sectionKey) ?? [];
    const sectionItems: GalleryPhotoItem[] = [];

    for (const photo of sectionPhotos) {
      const item: GalleryPhotoItem = {
        entryKey: `${sectionKey}:${photo.id}`,
        sectionKey,
        flatIndex: items.length,
        photo,
      };
      items.push(item);
      sectionItems.push(item);
    }

    sections.push({ key: sectionKey, items: sectionItems });
  }

  return { sections, items };
}
