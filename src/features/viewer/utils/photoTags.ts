import {
  TAG_ALBUM,
  TAG_EVENT,
  TAG_PERSON,
  TAG_PHOTOGRAPHER,
  TAG_TEAM,
} from "@/config/gallery";
import type { PhotoInfo } from "@/types/gallery";
import {
  parsePhotoInfoWithPrefixes,
  serializePhotoInfoWithPrefixes,
  type TagPrefixes,
} from "./photoTagParser";

const galleryPrefixes: TagPrefixes = {
  event: TAG_EVENT,
  team: TAG_TEAM,
  person: TAG_PERSON,
  album: TAG_ALBUM,
  photographer: TAG_PHOTOGRAPHER,
};

export function parsePhotoInfo(
  tags: readonly string[] | undefined,
  description: string | undefined,
): PhotoInfo {
  return parsePhotoInfoWithPrefixes(tags, description, galleryPrefixes);
}

export function serializePhotoInfo(photoInfo: PhotoInfo | null): string[] {
  return serializePhotoInfoWithPrefixes(photoInfo, galleryPrefixes);
}
