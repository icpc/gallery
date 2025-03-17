import axios from "axios";

import {
  TAG_ALBUM,
  TAG_EVENT,
  TAG_TEAM,
  api_key,
  user_id,
} from "../consts";

const extras =
  "tags,machine_tags,url_m,url_c,url_l,url_o,description,date_upload,date_taken";

function buildQuery(params) {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `https://api.flickr.com/services/rest?${queryString}`;
}

function buildSearchUrl(tags = [], page = 1, text = "") {
  const params = {
    method: "flickr.photos.search",
    api_key,
    user_id,
    tag_mode: "all",
    page,
    sort: "date-taken-desc",
    per_page: 25,
    extras,
    format: "json",
    nojsoncallback: "?",
  };
  if (tags.length) {
    params.tags = tags
      .map(([first, second]) => {
        const sanitized = second.replace(/[,:]/g, "");
        return `${first}$${sanitized}`;
      })
      .join(",");
  }
  if (text) {
    params.text = text;
  }
  return buildQuery(params);
}

function buildPhotoInfoUrl(id) {
  const params = {
    method: "flickr.photos.getInfo",
    api_key,
    user_id,
    format: "json",
    nojsoncallback: "?",
    photo_id: id,
  };
  return buildQuery(params);
}

async function fetchData(url, config = {}) {
  try {
    return await axios.get(url, config);
  } catch (e) {
    console.log(e);
  }
}

export function getAllWithEvent(
  year,
  event = "Photo%20Tour",
  page = 1,
  config = {},
) {
  return fetchData(
    buildSearchUrl(
      [
        [TAG_ALBUM, year],
        [TAG_EVENT, event],
      ],
      page,
    ),
    config,
  );
}

export function getAllWithTeam(year, team, page = 1, config = {}) {
  return fetchData(
    buildSearchUrl(
      [
        [TAG_ALBUM, year],
        [TAG_TEAM, team],
      ],
      page,
    ),
    config,
  );
}

export function getAllWithPerson(year, person, page = 1, config = {}) {
  return fetchData(buildSearchUrl([[TAG_ALBUM, year]], page, person), config);
}

export function getAllWithText(text, page = 1, config = {}) {
  return fetchData(
    buildSearchUrl([], page, `${text}%20and%20${TAG_ALBUM}$`),
    config,
  );
}

export function getPhotoInfo(id, config = {}) {
  return fetchData(buildPhotoInfoUrl(id), config);
}
