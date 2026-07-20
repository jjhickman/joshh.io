import videoPosterOne from "../assets/images/videos/placeholder-video-1.svg";
import videoPosterTwo from "../assets/images/videos/placeholder-video-2.svg";
import type { Video } from "./types";

export const videos = [
  // PLACEHOLDER
  {
    id: "live-session-one",
    title: "Live Session — Film One", // PLACEHOLDER
    youtubeId: "PLACEHOLDER_1",
    publishedAt: "2026-02-20", // PLACEHOLDER
    poster: {
      src: videoPosterOne, // PLACEHOLDER
      alt: "Shadowed guitarist in teal stage light", // PLACEHOLDER
      width: 1600,
      height: 900,
    },
    featured: true,
  },
  // PLACEHOLDER
  {
    id: "live-session-two",
    title: "Live Session — Film Two", // PLACEHOLDER
    youtubeId: "PLACEHOLDER_2",
    publishedAt: "2025-08-15", // PLACEHOLDER
    poster: {
      src: videoPosterTwo, // PLACEHOLDER
      alt: "Abstract stage beams crossing a dark room", // PLACEHOLDER
      width: 1600,
      height: 900,
    },
  },
] satisfies Video[];

export const featuredVideo = videos.find((video) => video.featured) ?? videos[0]!;
