import { TAG_ALBUM, TAG_EVENT, TAG_TEAM, api_key, user_id } from "../consts";
import { FlickrPhotoInfoResponse, FlickrPhotosResponse } from "../types";

const extras =
  "tags,machine_tags,url_m,url_c,url_l,url_o,description,date_upload,date_taken";

function buildQuery(params: Record<string, string | number>): string {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return `https://api.flickr.com/services/rest?${queryString}`;
}

function buildSearchUrl(
  tags: [string, string][] = [],
  page = 1,
  text = "",
): string {
  const params: Record<string, string | number> = {
    method: "flickr.photos.search",
    api_key,
    user_id,
    tag_mode: "all",
    page,
    sort: "date-taken-desc",
    per_page: 100,
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

function buildPhotoInfoUrl(id: string) {
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

// Refactored fetchData to use fetch instead of axios
async function fetchData<T>(
  url: string,
  config: RequestInit = {},
): Promise<{ data: T } | undefined> {
  try {
    const fetchConfig: RequestInit = { ...config };
    if (config?.signal) {
      fetchConfig.signal = config.signal;
    }
    const response = await fetch(url, fetchConfig);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Flickr returns JSONP if nojsoncallback is not set properly, but we use '?', so parse as JSON
    const data = await response.json();
    // Mimic axios response structure for compatibility
    return { data };
  } catch (e) {
    console.log(e);
  }
}

export function getAllWithEvent(
  year: string | null,
  event = "Photo%20Tour",
  page = 1,
  config: RequestInit = {},
) {
  return fetchData(
    buildSearchUrl(
      [
        [TAG_ALBUM, year ?? ""],
        [TAG_EVENT, event],
      ],
      page,
    ),
    config,
  ) as Promise<{ data: FlickrPhotosResponse } | undefined>;
}

export function getAllWithTeam(
  year: string | null,
  team: string,
  page = 1,
  config: RequestInit = {},
) {
  return fetchData<FlickrPhotosResponse>(
    buildSearchUrl(
      [
        [TAG_ALBUM, year ?? ""],
        [TAG_TEAM, team],
      ],
      page,
    ),
    config,
  );
}

export function getAllWithPerson(
  year: string | null,
  person: string,
  page = 1,
  config: RequestInit = {},
) {
  return fetchData<FlickrPhotosResponse>(
    buildSearchUrl([[TAG_ALBUM, year ?? ""]], page, person),
    config,
  );
}

export function getAllWithText(
  text: string,
  page = 1,
  config: RequestInit = {},
) {
  return fetchData<FlickrPhotosResponse>(
    buildSearchUrl([], page, `${text}%20and%20${TAG_ALBUM}$`),
    config,
  );
}

export function getPhotoInfo(id: string, config: RequestInit = {}) {
  return fetchData<FlickrPhotoInfoResponse>(buildPhotoInfoUrl(id), config);
}
