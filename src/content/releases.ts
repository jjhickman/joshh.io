import { releaseImage } from "./images";
import { releasesSchema } from "./schemas";
import type { AbsoluteUrl, Release } from "./types";
import releasesJson from "./data/releases.json";

export const spotifyEmbedUrl = (albumId: string): AbsoluteUrl =>
  `https://open.spotify.com/embed/album/${albumId}`;

export const spotifyAlbumUrl = (albumId: string): AbsoluteUrl =>
  `https://open.spotify.com/album/${albumId}`;

export const releases: Release[] = releasesSchema.parse(releasesJson).map((entry) => {
  const release: Release = {
    slug: entry.slug,
    title: entry.title,
    releaseDate: entry.releaseDate as Release["releaseDate"],
    spotifyAlbumId: entry.spotifyAlbumId,
    artwork: {
      src: releaseImage(entry.artwork.file),
      alt: entry.artwork.alt,
      width: entry.artwork.width,
      height: entry.artwork.height,
    },
  };
  if (entry.summary !== undefined) release.summary = entry.summary;
  if (entry.links !== undefined) release.links = entry.links as NonNullable<Release["links"]>;
  if (entry.featured !== undefined) release.featured = entry.featured;
  return release;
});

export const featuredRelease = releases.find((release) => release.featured) ?? releases[0]!;
