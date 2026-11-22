/**
 * Converts a raw Flickr tag into Flickr's normalized machine/search tag form.
 */
export function convertRawFlickrTag(raw: string): string {
  return raw
    .trim()
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\u00A7\u00B1]+/gu, "");
}

export function formatFlickrTag(prefix: string, value: string): string {
  return convertRawFlickrTag(`${prefix}$${value}`);
}
