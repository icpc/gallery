// Converts a Flickr raw tag to a regular tag
export function convertRawFlickrTag(raw: string): string {
  let decoded = raw;
  decoded = decoded.trim();
  decoded = decoded.normalize("NFC");
  decoded = decoded.toLowerCase();
  // Only allow letters (\p{L}), numbers (\p{N}), section sign (§), plus-minus (±)
  decoded = decoded.replace(/[^\p{L}\p{N}\u00A7\u00B1]+/gu, "");
  return decoded;
}
