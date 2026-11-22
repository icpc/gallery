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

export function serializePersonTag(person: Person): string {
  if (person.position) {
    return `${person.name}(${encodeFacePosition(person.position)})`;
  }
  return person.name;
}

export function parsePhotoInfoWithPrefixes(
  tags: readonly string[] | undefined,
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

export function serializePhotoInfoWithPrefixes(
  photoInfo: PhotoInfo | null,
  prefixes: TagPrefixes,
): string[] {
  if (!photoInfo) {
    return [];
  }
  const tags: string[] = [];
  for (const event of photoInfo.event) {
    tags.push(`${prefixes.event}$${event}`);
  }
  for (const team of photoInfo.team) {
    tags.push(`${prefixes.team}$${team}`);
  }
  for (const album of photoInfo.album) {
    tags.push(`${prefixes.album}$${album}`);
  }
  for (const photographer of photoInfo.photographer) {
    tags.push(`${prefixes.photographer}$${photographer}`);
  }
  for (const person of photoInfo.person) {
    tags.push(serializePersonTag(person));
  }
  return tags.map((tag) => `"${tag.trim()}"`);
}
