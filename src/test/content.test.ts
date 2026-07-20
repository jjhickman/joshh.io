import { describe, expect, it } from "vitest";
import { photos } from "../content/photos";
import { releases, spotifyAlbumUrl, spotifyEmbedUrl } from "../content/releases";
import { partitionShows, shows } from "../content/shows";
import { socialLinks } from "../content/site";
import { videos } from "../content/videos";
import type { AbsoluteUrl, Release } from "../content/types";

const validCalendarDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

describe("content invariants", () => {
  it("keeps release slugs and media ids unique with one feature each", () => {
    expect(new Set(releases.map(({ slug }) => slug)).size).toBe(releases.length);
    expect(new Set(videos.map(({ id }) => id)).size).toBe(videos.length);
    expect(releases.filter(({ featured }) => featured)).toHaveLength(1);
    expect(videos.filter(({ featured }) => featured)).toHaveLength(1);
  });

  it("uses the exact verified Spotify IDs and derives HTTPS URLs", () => {
    expect(releases.map(({ spotifyAlbumId }) => spotifyAlbumId)).toEqual([
      "6UfhFkIHodlG0kNF8I1TXC",
      "2EWkRLlezZ5RuB5xw3Z2Bs",
      "2a2Dz8i6AayYmmNvKAokTX",
    ]);
    for (const release of releases) {
      expect(spotifyAlbumUrl(release.spotifyAlbumId)).toBe(`https://open.spotify.com/album/${release.spotifyAlbumId}`);
      expect(spotifyEmbedUrl(release.spotifyAlbumId)).toBe(`https://open.spotify.com/embed/album/${release.spotifyAlbumId}`);
      expect(validCalendarDate(release.releaseDate)).toBe(true);
    }
  });

  it("keeps every authored external link on HTTPS", () => {
    const links = [
      ...socialLinks.map(({ href }) => href),
      ...shows.flatMap(({ ticketUrl, venueUrl }) => [ticketUrl, venueUrl].filter(Boolean)),
      ...(releases as readonly Release[]).flatMap(({ links }) =>
        links
          ? [links.appleMusic, links.bandcamp].filter((link): link is AbsoluteUrl => link !== undefined)
          : [],
      ),
    ];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link).toMatch(/^https:\/\//);
  });

  it("has useful, dimensioned images", () => {
    const images = [...releases.map(({ artwork }) => artwork), ...videos.map(({ poster }) => poster), ...photos];
    for (const image of images) {
      expect(image.src).toBeTruthy();
      expect(image.alt.trim().length).toBeGreaterThan(8);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
  });

  it("contains exactly two future and three past offset-aware Boston-area shows", () => {
    expect(shows).toHaveLength(5);
    for (const show of shows) {
      expect(show.startAt).toMatch(/[+-]\d{2}:\d{2}$/);
      expect(["Boston", "Cambridge", "Somerville", "Allston"]).toContain(show.city);
      expect(show.region).toBe("MA");
    }
    const result = partitionShows(shows, new Date("2026-07-19T12:00:00-04:00"));
    expect(result.upcoming).toHaveLength(2);
    expect(result.past).toHaveLength(3);
    expect(result.upcoming.map(({ id }) => id)).toEqual(["harbor-room-2026", "northlight-hall-2026"]);
    expect(result.past.map(({ id }) => id)).toEqual(["signal-house-2026", "the-foundry-2025", "meridian-stage-2025"]);
  });

  it("partitions deterministically at the boundary without mutating input", () => {
    const input = [...shows];
    const boundary = new Date(shows[0]!.startAt);
    expect(partitionShows(input, boundary).upcoming[0]?.id).toBe(shows[0]!.id);
    expect(input).toEqual(shows);
  });
});
