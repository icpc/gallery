import { getRawEventData, getRawPeopleData, getRawTeamData } from "../consts";

async function getEventData(year) {
    const response = await getRawEventData(year);
    return response.split("\n").map(i => i.trim());
}

async function getTeamData(year) {
    const response = await getRawTeamData(year);
    return response.split("\n").map(i => i.trim());
}

async function getPeopleData(year) {
    const response = await getRawPeopleData(year);
    return response.split("\n").map(i => i.trim());
}

export { getEventData, getPeopleData, getTeamData };