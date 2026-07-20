import { showsSchema } from "./schemas";
import type { Show } from "./types";
import showsJson from "./data/shows.json";

export const shows: Show[] = showsSchema.parse(showsJson).map((entry) => {
  const show: Show = {
    id: entry.id,
    startAt: entry.startAt,
    venue: entry.venue,
    city: entry.city,
    region: entry.region,
    status: entry.status,
  };
  if (entry.endAt !== undefined) show.endAt = entry.endAt;
  if (entry.billing !== undefined) show.billing = entry.billing;
  if (entry.ticketUrl !== undefined) show.ticketUrl = entry.ticketUrl as NonNullable<Show["ticketUrl"]>;
  if (entry.venueUrl !== undefined) show.venueUrl = entry.venueUrl as NonNullable<Show["venueUrl"]>;
  return show;
});

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
