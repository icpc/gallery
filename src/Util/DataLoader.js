import { getRawEventData, getRawPeopleData, getRawTeamData } from "../consts";

import UniqueList from "./UniqueList";

async function getEventData(year) {
    if (!year) {
        return [];
    }
    const response = await getRawEventData(year);
    return UniqueList(response.split("\n").map(i => i.trim()).filter(i => i != ""));
}

async function getTeamData(year) {
    if (!year) {
        return [];
    }
    const response = await getRawTeamData(year);
    return UniqueList(response.split("\n").map(i => i.trim()).filter(i => i != ""));
}

async function getPeopleData(year) {
    if (!year) {
        return [];
    }
    const response = await getRawPeopleData(year);
    return UniqueList(response.split("\n").map(i => i.trim()).filter(i => i != ""));
}

export { getEventData, getPeopleData, getTeamData };
