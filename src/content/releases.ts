import concernsArtwork from "../assets/images/releases/placeholder-concerns.svg";
import feathersArtwork from "../assets/images/releases/placeholder-feathers.svg";
import partiallyBlindArtwork from "../assets/images/releases/placeholder-partially-blind.svg";
import type { AbsoluteUrl, Release } from "./types";

export const spotifyEmbedUrl = (albumId: string): AbsoluteUrl =>
  `https://open.spotify.com/embed/album/${albumId}`;

export const spotifyAlbumUrl = (albumId: string): AbsoluteUrl =>
  `https://open.spotify.com/album/${albumId}`;

export const releases = [
  {
    slug: "feathers",
    title: "Feathers",
    releaseDate: "2025-10-24", // PLACEHOLDER
    spotifyAlbumId: "6UfhFkIHodlG0kNF8I1TXC",
    artwork: {
      src: feathersArtwork, // PLACEHOLDER
      alt: "Abstract blue-black Feathers placeholder artwork", // PLACEHOLDER
      width: 1200,
      height: 1200,
    },
    summary: "A patient surge of guitar, haze, and bright edges from IN CASE OF EMERGENCY.", // PLACEHOLDER
    featured: true,
  },
  {
    slug: "partially-blind",
    title: "PARTIALLY BLIND",
    releaseDate: "2024-06-14", // PLACEHOLDER
    spotifyAlbumId: "2EWkRLlezZ5RuB5xw3Z2Bs",
    artwork: {
      src: partiallyBlindArtwork, // PLACEHOLDER
      alt: "Angular blue-black PARTIALLY BLIND placeholder artwork", // PLACEHOLDER
      width: 1200,
      height: 1200,
    },
    summary: "A wide-screen passage between dream pop shimmer and post-rock weight.", // PLACEHOLDER
  },
  {
    slug: "the-least-of-my-concerns",
    title: "The Least of My Concerns",
    releaseDate: "2022-09-02", // PLACEHOLDER
    spotifyAlbumId: "2a2Dz8i6AayYmmNvKAokTX",
    artwork: {
      src: concernsArtwork, // PLACEHOLDER
      alt: "Concentric blue-black The Least of My Concerns placeholder artwork", // PLACEHOLDER
      width: 1200,
      height: 1200,
    },
    summary: "An atmospheric early chapter built from tension, release, and melodic guitar.", // PLACEHOLDER
  },
] satisfies Release[];

export const featuredRelease = releases.find((release) => release.featured) ?? releases[0]!;
