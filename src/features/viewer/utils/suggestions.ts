import {
  encodeFacePosition,
  parsePhotoInfoWithPrefixes,
  serializeRawPhotoTags,
  type TagPrefixes,
} from "@/features/viewer/utils/photoTagParser";
import type { FaceDiffStatus, Person, PhotoInfo } from "@/types/gallery";

export interface ListDiff<T> {
  added: T[];
  removed: T[];
  unchanged: T[];
}

export interface PhotoInfoDiff {
  photographer: ListDiff<string>;
  album: ListDiff<string>;
  event: ListDiff<string>;
  team: ListDiff<string>;
  person: ListDiff<Person>;
  hasChanges: boolean;
}

export interface DiffFaceEntry {
  person: Person;
  status: FaceDiffStatus;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(encoded: string): Uint8Array {
  const padded = encoded
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(encoded.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function getPersonTagKey(person: Person): string {
  const posKey = person.position ? encodeFacePosition(person.position) : "none";
  return `${person.name}::${posKey}`;
}

export function encodeSuggestionPayload(
  photoInfo: PhotoInfo,
  prefixes: TagPrefixes,
): string {
  const rawTags = serializeRawPhotoTags(photoInfo, prefixes);
  const json = JSON.stringify(rawTags);
  const bytes = new TextEncoder().encode(json);
  return toBase64Url(bytes);
}

export function decodeSuggestionPayload(
  encoded: string | null | undefined,
  prefixes: TagPrefixes,
): PhotoInfo | null {
  if (!encoded || encoded.trim() === "") {
    return null;
  }
  try {
    const bytes = fromBase64Url(encoded.trim());
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const rawTags = parsed.filter(
      (item): item is string => typeof item === "string",
    );
    return parsePhotoInfoWithPrefixes(rawTags, undefined, prefixes);
  } catch {
    return null;
  }
}

function diffByKey<T>(
  original: readonly T[],
  proposed: readonly T[],
  getKey: (item: T) => string,
): ListDiff<T> {
  const originalKeys = new Set(original.map(getKey));
  const proposedKeys = new Set(proposed.map(getKey));

  const added: T[] = [];
  const unchanged: T[] = [];
  const removed: T[] = [];

  for (const item of proposed) {
    if (originalKeys.has(getKey(item))) {
      unchanged.push(item);
    } else {
      added.push(item);
    }
  }
  for (const item of original) {
    if (!proposedKeys.has(getKey(item))) {
      removed.push(item);
    }
  }

  return { added, removed, unchanged };
}

export function computePhotoInfoDiff(
  original: PhotoInfo,
  proposed: PhotoInfo,
): PhotoInfoDiff {
  const photographer = diffByKey(
    original.photographer,
    proposed.photographer,
    (v) => v,
  );
  const album = diffByKey(original.album, proposed.album, (v) => v);
  const event = diffByKey(original.event, proposed.event, (v) => v);
  const team = diffByKey(original.team, proposed.team, (v) => v);
  const person = diffByKey(original.person, proposed.person, getPersonTagKey);

  const hasChanges =
    photographer.added.length > 0 ||
    photographer.removed.length > 0 ||
    album.added.length > 0 ||
    album.removed.length > 0 ||
    event.added.length > 0 ||
    event.removed.length > 0 ||
    team.added.length > 0 ||
    team.removed.length > 0 ||
    person.added.length > 0 ||
    person.removed.length > 0;

  return {
    photographer,
    album,
    event,
    team,
    person,
    hasChanges,
  };
}

export function getDiffFaceEntries(diff: PhotoInfoDiff): DiffFaceEntry[] {
  return [
    ...diff.person.unchanged.map((person) => ({
      person,
      status: "unchanged" as const,
    })),
    ...diff.person.added.map((person) => ({
      person,
      status: "added" as const,
    })),
    ...diff.person.removed.map((person) => ({
      person,
      status: "removed" as const,
    })),
  ];
}
