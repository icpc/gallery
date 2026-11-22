import { uniqueList } from "@/shared/utils/uniqueList";
import type { Person, PhotoInfo, Position } from "@/types/gallery";

const MAX_INT = 65535;

export interface TagPrefixes {
  event: string;
  team: string;
  person: string;
  album: string;
  photographer: string;
}

function convertRel(hex: string): number {
  return Number.parseInt(`0x${hex}`, 16) / MAX_INT;
}

export function decodeFacePosition(encoded: string): Position | undefined {
  if (encoded.length !== 16 || !/^[0-9a-fA-F]{16}$/.test(encoded)) {
    return undefined;
  }
  return {
    left: convertRel(encoded.slice(0, 4)),
    top: convertRel(encoded.slice(4, 8)),
    right: convertRel(encoded.slice(8, 12)),
    bottom: convertRel(encoded.slice(12, 16)),
  };
}

export function encodeFacePosition(position: Position): string {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const toHex = (n: number) =>
    Math.round(clamp(n) * MAX_INT)
      .toString(16)
      .padStart(4, "0");
  return (
    toHex(position.left) +
    toHex(position.top) +
    toHex(position.right) +
    toHex(position.bottom)
  );
}

export function parsePersonTag(rawTag: string): Person | null {
  const openBracket = rawTag.indexOf("(");
  if (openBracket <= 0) {
    return null;
  }
  const closingBracket = rawTag.indexOf(")", openBracket);
  if (closingBracket === -1) {
    return null;
  }
  const name = rawTag.slice(0, openBracket).trim();
  const encoded = rawTag.slice(openBracket + 1, closingBracket);
  if (!name) {
    return null;
  }
  const position = decodeFacePosition(encoded);
  if (!position) {
    return null;
  }
  return { name, position };
}

export function serializePersonTag(
  person: Person,
  personPrefix: string,
): string {
  if (person.position) {
    return `${person.name}(${encodeFacePosition(person.position)})`;
  }
  return `${personPrefix}$${person.name}`;
}

function isManagedGalleryTag(tag: string, prefixes: TagPrefixes): boolean {
  return (
    tag.startsWith(`${prefixes.event}$`) ||
    tag.startsWith(`${prefixes.team}$`) ||
    tag.startsWith(`${prefixes.person}$`) ||
    tag.startsWith(`${prefixes.album}$`) ||
    tag.startsWith(`${prefixes.photographer}$`) ||
    parsePersonTag(tag) !== null
  );
}

/**
 * Extracts Flickr tags that are NOT managed by the gallery (e.g. custom labels)
 * so calling `flickr.photos.setTags` preserves them instead of wiping them out.
 */
export function extractPreservedTags(
  tags: readonly (string | null)[] | null | undefined,
  prefixes: TagPrefixes,
): string[] {
  if (!tags) {
    return [];
  }
  const preserved: string[] = [];
  for (const tag of tags) {
    if (tag === null) {
      continue;
    }
    const trimmed = tag.trim();
    if (trimmed !== "" && !isManagedGalleryTag(trimmed, prefixes)) {
      preserved.push(trimmed);
    }
  }
  return uniqueList(preserved);
}

export function parsePhotoInfoWithPrefixes(
  tags: readonly (string | null)[] | null | undefined,
  description: string | undefined,
  prefixes: TagPrefixes,
): PhotoInfo {
  const info: PhotoInfo = {
    event: [],
    team: [],
    person: [],
    album: [],
    photographer: [],
  };

  if (description) {
    const cleaned = description.replaceAll("Photographer: ", "").trim();
    if (cleaned) {
      info.photographer.push(cleaned);
    }
  }

  if (!tags) {
    return info;
  }

  for (const tag of tags) {
    if (!tag) continue;
    if (tag.startsWith(`${prefixes.event}$`)) {
      info.event.push(tag.slice(prefixes.event.length + 1));
      continue;
    }
    if (tag.startsWith(`${prefixes.team}$`)) {
      info.team.push(tag.slice(prefixes.team.length + 1));
      continue;
    }
    if (tag.startsWith(`${prefixes.person}$`)) {
      info.person.push({ name: tag.slice(prefixes.person.length + 1) });
      continue;
    }
    if (tag.startsWith(`${prefixes.album}$`)) {
      info.album.push(tag.slice(prefixes.album.length + 1));
      continue;
    }
    if (tag.startsWith(`${prefixes.photographer}$`)) {
      info.photographer.push(tag.slice(prefixes.photographer.length + 1));
      continue;
    }
    const parsedPerson = parsePersonTag(tag);
    if (parsedPerson) {
      info.person.push(parsedPerson);
    }
  }

  info.event = uniqueList(info.event);
  info.team = uniqueList(info.team);
  info.album = uniqueList(info.album);
  info.photographer = uniqueList(info.photographer);
  return info;
}

export function serializeRawPhotoTags(
  photoInfo: PhotoInfo | null,
  prefixes: TagPrefixes,
): string[] {
  if (!photoInfo) {
    return [];
  }
  const tags: string[] = [];
  for (const event of photoInfo.event) {
    tags.push(`${prefixes.event}$${event}`.trim());
  }
  for (const team of photoInfo.team) {
    tags.push(`${prefixes.team}$${team}`.trim());
  }
  for (const album of photoInfo.album) {
    tags.push(`${prefixes.album}$${album}`.trim());
  }
  for (const photographer of photoInfo.photographer) {
    tags.push(`${prefixes.photographer}$${photographer}`.trim());
  }
  for (const person of photoInfo.person) {
    tags.push(serializePersonTag(person, prefixes.person).trim());
  }
  return tags;
}

export function serializePhotoInfoWithPrefixes(
  photoInfo: PhotoInfo | null,
  prefixes: TagPrefixes,
): string[] {
  return serializeRawPhotoTags(photoInfo, prefixes).map((tag) => `"${tag}"`);
}

/**
 * Formats the complete space-delimited quoted tag payload expected by
 * `flickr.photos.setTags`, merging managed gallery tags with any preserved
 * non-gallery tags already on the photo.
 */
export function buildFlickrSetTagsPayload(
  photoInfo: PhotoInfo,
  preservedTags: readonly string[],
  prefixes: TagPrefixes,
): string {
  const managed = serializeRawPhotoTags(photoInfo, prefixes);
  const all = uniqueList([...preservedTags, ...managed]);
  return all.map((tag) => `"${tag.replaceAll('"', "")}"`).join(" ");
}
