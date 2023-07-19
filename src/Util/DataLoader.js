import { getRawEventData, getRawPeopleData, getRawTeamData } from "../consts";

async function getEventData(year) {
    if (!year) {
        return [];
    }
    const response = await getRawEventData(year);
    return response.split("\n").map(i => i.trim());
}

async function getTeamData(year) {
    if (!year) {
        return [];
    }
    const response = await getRawTeamData(year);
    return response.split("\n").map(i => i.trim());
}

async function getPeopleData(year) {
    if (!year) {
        return [];
    }
    const response = await getRawPeopleData(year);
    return response.split("\n").map(i => i.trim());
}

export { getEventData, getPeopleData, getTeamData };
