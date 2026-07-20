import { videoImage } from "./images";
import { videosSchema } from "./schemas";
import type { Video } from "./types";
import videosJson from "./data/videos.json";

export const videos: Video[] = videosSchema.parse(videosJson).map((entry) => {
  const video: Video = {
    id: entry.id,
    title: entry.title,
    youtubeId: entry.youtubeId,
    poster: {
      src: videoImage(entry.poster.file),
      alt: entry.poster.alt,
      width: entry.poster.width,
      height: entry.poster.height,
    },
  };
  if (entry.publishedAt !== undefined) {
    video.publishedAt = entry.publishedAt as NonNullable<Video["publishedAt"]>;
  }
  if (entry.featured !== undefined) video.featured = entry.featured;
  return video;
});

export const featuredVideo = videos.find((video) => video.featured) ?? videos[0]!;
