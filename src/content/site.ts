import heroImage from "../assets/images/hero/placeholder-hero.svg";
import type { AbsoluteUrl, ImageAsset, RouteMetadata } from "./types";

export const site = {
  name: "Josh Hickman",
  band: "IN CASE OF EMERGENCY",
  role: "lead guitar",
  genres: ["post-rock", "dream pop", "indie", "prog"],
  location: "Boston",
  hero: {
    src: heroImage, // PLACEHOLDER
    alt: "Abstract silhouette of a guitarist in cold blue stage light", // PLACEHOLDER
    width: 1920,
    height: 1200,
  } satisfies ImageAsset,
  copy: {
    musicIntro: "Boston post-rock moving through dream pop, indie, and prog—patiently built, then let loose.", // PLACEHOLDER
    showsIntro: "Rooms, volume, and the long way through.", // PLACEHOLDER
    videoIntro: "Light, volume, and motion held in a frame.", // PLACEHOLDER
    photosIntro: "Fragments from rooms where the light moved almost as slowly as the sound.", // PLACEHOLDER
    closingHeading: "Find the signal after the lights go down.", // PLACEHOLDER
    notFoundMessage: "There is nothing at this address, but the music is still playing.", // PLACEHOLDER
  },
  assetProvenance: "All current visual assets are generated, in-repository placeholder artwork.",
};

export const navigation = [
  { label: "Music", to: "/music" },
  { label: "Shows", to: "/shows" },
  { label: "Video", to: "/video" },
  { label: "Photos", to: "/photos" },
  { label: "Tech", to: "/tech", quiet: true },
] as const;

export const socialLinks = [
  { label: "Instagram", href: "https://example.com/in-case-of-emergency-instagram" }, // PLACEHOLDER
  { label: "YouTube", href: "https://example.com/in-case-of-emergency-youtube" }, // PLACEHOLDER
] satisfies Array<{ label: string; href: AbsoluteUrl }>;

export const routeMetadata = {
  home: { title: "Josh Hickman — IN CASE OF EMERGENCY", description: "Josh Hickman plays lead guitar in Boston post-rock band IN CASE OF EMERGENCY.", canonicalPath: "/" }, // PLACEHOLDER
  music: { title: "Music — IN CASE OF EMERGENCY", description: "Listen to releases from Boston post-rock band IN CASE OF EMERGENCY.", canonicalPath: "/music" }, // PLACEHOLDER
  shows: { title: "Shows — IN CASE OF EMERGENCY", description: "Upcoming Boston-area shows and the live archive for IN CASE OF EMERGENCY.", canonicalPath: "/shows" }, // PLACEHOLDER
  video: { title: "Video — IN CASE OF EMERGENCY", description: "Performance films and music videos from IN CASE OF EMERGENCY.", canonicalPath: "/video" }, // PLACEHOLDER
  photos: { title: "Photos — IN CASE OF EMERGENCY", description: "An atmospheric visual archive from IN CASE OF EMERGENCY.", canonicalPath: "/photos" }, // PLACEHOLDER
  tech: { title: "Tech — Josh Hickman", description: "A quiet note on Josh Hickman’s software engineering practice.", canonicalPath: "/tech" }, // PLACEHOLDER
} satisfies Record<string, RouteMetadata>;
