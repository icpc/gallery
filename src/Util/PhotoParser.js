import { TAG_ALBUM, TAG_EVENT, TAG_PERSON, TAG_PHOTOGRAPHER, TAG_TEAM } from "../consts";

const MAX_INT = 65535;

const convertRel = (text) => convertNum(text) / MAX_INT;

function getPosition(encodedPosition) {
    return {
        left: convertRel(encodedPosition.substr(0, 4)),
        top: convertRel(encodedPosition.substr(4, 4)),
        right: convertRel(encodedPosition.substr(8, 4)),
        bottom: convertRel(encodedPosition.substr(12, 4)),
    };
}

function parsePerson(personTag) {
    const openBracket = personTag.indexOf("(");
    if (openBracket === -1) {
        return null;
    }
    const name = personTag.substr(0, openBracket);
    const closingBracket = personTag.indexOf(")", openBracket);
    const encodedPosition = personTag.substr(openBracket + 1, closingBracket - openBracket - 1);
    if (name === "") {
        return null;
    }
    return {
        name: name,
        position: getPosition(encodedPosition)
    };
}

const convertNum = (text) => parseInt("0x" + text);

function ParsePhotoInfo(tags, description) {
    let info = {
        event: [],
        team: [],
        person: [],
        album: [],
        photographer: [],
    };
    info.photographer?.push(description.replaceAll("Photographer: ", ""));
    for (const tag of tags) {
        if (tag === null) {
            continue;
        }
        if (tag.startsWith(TAG_EVENT)) {
            info.event.push(tag.replaceAll(TAG_EVENT + "$", ""));
            continue;
        }
        if (tag.startsWith(TAG_TEAM)) {
            info.team.push(tag.replaceAll(TAG_TEAM + "$", ""));
            continue;
        }
        if (tag.startsWith(TAG_PERSON)) {
            info.person.push({ name: tag.replaceAll(TAG_PERSON + "$", "") });
            continue;
        }
        if (tag.startsWith(TAG_ALBUM)) {
            info.album.push(tag.replaceAll(TAG_ALBUM + "$", ""));
            continue;
        }
        if (tag.startsWith(TAG_PHOTOGRAPHER)) {
            info.photographer.push(tag.replaceAll(TAG_PHOTOGRAPHER + "$", ""));
            continue;
        }
        const parsedPerson = parsePerson(tag);
        if (parsedPerson !== null) {
            info.person.push(parsedPerson);
        }
    }
    return info;
}

export { ParsePhotoInfo };
