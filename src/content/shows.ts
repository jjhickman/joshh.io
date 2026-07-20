import type { Show } from "./types";

export const shows = [
  // PLACEHOLDER
  {
    id: "harbor-room-2026",
    startAt: "2026-10-17T20:00:00-04:00", // PLACEHOLDER
    venue: "Harbor Room", // PLACEHOLDER
    city: "Boston", // PLACEHOLDER
    region: "MA", // PLACEHOLDER
    billing: ["IN CASE OF EMERGENCY", "Glass Static"], // PLACEHOLDER
    ticketUrl: "https://example.com/harbor-room", // PLACEHOLDER
    status: "scheduled",
  },
  // PLACEHOLDER
  {
    id: "northlight-hall-2026",
    startAt: "2026-12-05T19:30:00-05:00", // PLACEHOLDER
    venue: "Northlight Hall", // PLACEHOLDER
    city: "Cambridge", // PLACEHOLDER
    region: "MA", // PLACEHOLDER
    billing: ["IN CASE OF EMERGENCY", "Low Weather"], // PLACEHOLDER
    venueUrl: "https://example.com/northlight-hall", // PLACEHOLDER
    status: "scheduled",
  },
  // PLACEHOLDER
  {
    id: "signal-house-2026",
    startAt: "2026-06-12T20:30:00-04:00", // PLACEHOLDER
    venue: "Signal House", // PLACEHOLDER
    city: "Somerville", // PLACEHOLDER
    region: "MA", // PLACEHOLDER
    billing: ["IN CASE OF EMERGENCY", "Soft Divide"], // PLACEHOLDER
    status: "scheduled",
  },
  // PLACEHOLDER
  {
    id: "the-foundry-2025",
    startAt: "2025-11-08T21:00:00-05:00", // PLACEHOLDER
    venue: "The Foundry", // PLACEHOLDER
    city: "Allston", // PLACEHOLDER
    region: "MA", // PLACEHOLDER
    billing: ["IN CASE OF EMERGENCY", "Arc Lamp"], // PLACEHOLDER
    status: "scheduled",
  },
  // PLACEHOLDER
  {
    id: "meridian-stage-2025",
    startAt: "2025-03-22T20:00:00-04:00", // PLACEHOLDER
    venue: "Meridian Stage", // PLACEHOLDER
    city: "Cambridge", // PLACEHOLDER
    region: "MA", // PLACEHOLDER
    billing: ["IN CASE OF EMERGENCY", "Night Geometry"], // PLACEHOLDER
    status: "scheduled",
  },
] satisfies Show[];

export function partitionShows(records: readonly Show[], now: Date): {
  upcoming: Show[];
  past: Show[];
} {
  const boundary = now.getTime();
  const upcoming = records
    .filter((show) => new Date(show.startAt).getTime() >= boundary)
    .toSorted((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  const past = records
    .filter((show) => new Date(show.startAt).getTime() < boundary)
    .toSorted((a, b) => Date.parse(b.startAt) - Date.parse(a.startAt));
  return { upcoming, past };
}
