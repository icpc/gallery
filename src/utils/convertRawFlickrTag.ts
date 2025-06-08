// Converts a Flickr raw tag to a regular tag
export function convertRawFlickrTag(raw: string): string {
  let decoded = raw;
  // Drop leading/trailing whitespace
  decoded = decoded.trim();
  // Normalize to NFC form
  decoded = decoded.normalize("NFC");
  // Convert to lowercase
  decoded = decoded.toLowerCase();
  // Only allow letters (\p{L}), numbers (\p{N}), section sign (§), and curly apostrophe (’)
  decoded = decoded.replace(/[^\p{L}\p{N}\u00A7]+/gu, "");
  // Convert to lowercase again (redundant but ensures consistency)
  return decoded;
}
