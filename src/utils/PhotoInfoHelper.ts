import {
  TAG_ALBUM,
  TAG_EVENT,
  TAG_PERSON,
  TAG_PHOTOGRAPHER,
  TAG_TEAM,
} from "../consts";
import { Person, PhotoInfo, Position } from "../types";

import UniqueList from "./UniqueList";

const MAX_INT = 65535;

const convertRel = (text: string): number => convertNum(text) / MAX_INT;

function getPosition(encodedPosition: string): Position {
  return {
    left: convertRel(encodedPosition.substr(0, 4)),
    top: convertRel(encodedPosition.substr(4, 4)),
    right: convertRel(encodedPosition.substr(8, 4)),
    bottom: convertRel(encodedPosition.substr(12, 4)),
  };
}

function serizalizePosition(position: Position): string {
  return (
    Math.round(position.left * MAX_INT)
      .toString(16)
      .padStart(4, "0") +
    Math.round(position.top * MAX_INT)
      .toString(16)
      .padStart(4, "0") +
    Math.round(position.right * MAX_INT)
      .toString(16)
      .padStart(4, "0") +
    Math.round(position.bottom * MAX_INT)
      .toString(16)
      .padStart(4, "0")
  );
}

function parsePerson(personTag: string): Person | null {
  const openBracket = personTag.indexOf("(");
  if (openBracket === -1) {
    return null;
  }
  const name = personTag.substr(0, openBracket);
  const closingBracket = personTag.indexOf(")", openBracket);
  const encodedPosition = personTag.substr(
    openBracket + 1,
    closingBracket - openBracket - 1,
  );
  if (name === "") {
    return null;
  }
  return {
    name: name,
    position: getPosition(encodedPosition),
  };
}

function serizalizePerson(person: Person): string {
  if (person.position) {
    return person.name + "(" + serizalizePosition(person.position) + ")";
  }
  return person.name;
}

const convertNum = (text: string): number => parseInt("0x" + text);

function ParsePhotoInfo(
  tags: string[] | undefined,
  description: string | undefined,
): PhotoInfo {
  const photoInfo: PhotoInfo = {
    event: [],
    team: [],
    person: [],
    album: [],
    photographer: [],
  };
  if (description) {
    photoInfo.photographer.push(description.replaceAll("Photographer: ", ""));
  }
  if (!tags) {
    return photoInfo;
  }
  for (const tag of tags) {
    if (tag === null) {
      continue;
    }
    if (tag.startsWith(TAG_EVENT)) {
      photoInfo.event.push(tag.replaceAll(TAG_EVENT + "$", ""));
      continue;
    }
    if (tag.startsWith(TAG_TEAM)) {
      photoInfo.team.push(tag.replaceAll(TAG_TEAM + "$", ""));
      continue;
    }
    if (tag.startsWith(TAG_PERSON)) {
      photoInfo.person.push({
        name: tag.replaceAll(TAG_PERSON + "$", ""),
      });
      continue;
    }
    if (tag.startsWith(TAG_ALBUM)) {
      photoInfo.album.push(tag.replaceAll(TAG_ALBUM + "$", ""));
      continue;
    }
    if (tag.startsWith(TAG_PHOTOGRAPHER)) {
      photoInfo.photographer.push(tag.replaceAll(TAG_PHOTOGRAPHER + "$", ""));
      continue;
    }
    const parsedPerson = parsePerson(tag);
    if (parsedPerson !== null) {
      photoInfo.person.push(parsedPerson);
    }
  }
  photoInfo.event = UniqueList(photoInfo.event);
  photoInfo.team = UniqueList(photoInfo.team);
  photoInfo.album = UniqueList(photoInfo.album);
  photoInfo.photographer = UniqueList(photoInfo.photographer);

  return photoInfo;
}

function SerializePhotoInfo(photoInfo: PhotoInfo | null): string[] {
  if (!photoInfo) {
    return [];
  }
  const tags: string[] = [];
  for (const event of photoInfo.event) {
    tags.push(TAG_EVENT + "$" + event);
  }
  for (const team of photoInfo.team) {
    tags.push(TAG_TEAM + "$" + team);
  }
  for (const album of photoInfo.album) {
    tags.push(TAG_ALBUM + "$" + album);
  }
  for (const photographer of photoInfo.photographer) {
    tags.push(TAG_PHOTOGRAPHER + "$" + photographer);
  }
  for (const person of photoInfo.person) {
    tags.push(serizalizePerson(person));
  }
  return tags.map((tag) => `"${tag.trim()}"`);
}

export { ParsePhotoInfo, SerializePhotoInfo };
