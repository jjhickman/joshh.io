import { galleryImage } from "./images";
import { photosSchema } from "./schemas";
import type { ImageAsset } from "./types";
import photosJson from "./data/photos.json";

export const photos: ImageAsset[] = photosSchema.parse(photosJson).map((entry) => ({
  src: galleryImage(entry.file),
  alt: entry.alt,
  width: entry.width,
  height: entry.height,
  ...(entry.caption !== undefined ? { caption: entry.caption } : {}),
  ...(entry.credit !== undefined ? { credit: entry.credit } : {}),
}));
