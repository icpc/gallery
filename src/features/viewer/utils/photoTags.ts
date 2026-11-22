import {
  TAG_ALBUM,
  TAG_EVENT,
  TAG_PERSON,
  TAG_PHOTOGRAPHER,
  TAG_TEAM,
} from "@/config/gallery";
import type { PhotoInfo } from "@/types/gallery";
import {
  buildFlickrSetTagsPayload,
  extractPreservedTags,
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

export function getGalleryTagPrefixes(): TagPrefixes {
  return galleryPrefixes;
}

export function parsePhotoInfo(
  tags: readonly (string | null)[] | null | undefined,
  description: string | undefined,
): PhotoInfo {
  return parsePhotoInfoWithPrefixes(tags, description, galleryPrefixes);
}

export function serializePhotoInfo(photoInfo: PhotoInfo | null): string[] {
  return serializePhotoInfoWithPrefixes(photoInfo, galleryPrefixes);
}

export function extractGalleryPreservedTags(
  tags: readonly (string | null)[] | null | undefined,
): string[] {
  return extractPreservedTags(tags, galleryPrefixes);
}

export function buildGallerySetTagsPayload(
  photoInfo: PhotoInfo,
  preservedTags: readonly string[],
): string {
  return buildFlickrSetTagsPayload(photoInfo, preservedTags, galleryPrefixes);
}
