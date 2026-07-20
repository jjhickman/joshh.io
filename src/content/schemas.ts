import { z } from "zod";

// Single source of truth for machine-editable content: the frontend content
// modules, the admin UI forms, and the admin API Lambda all validate against
// these schemas, so an invalid edit fails identically everywhere.

const absoluteUrl = z
  .string()
  .regex(/^https:\/\/\S+$/, "must be an absolute https:// URL");

// Template-literal types accept strings like "1e3-2-3"; the calendar
// refinement keeps machine edits honest.
const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
  }, "must be a real calendar date");

const offsetDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[+-]\d{2}:\d{2}|Z)$/,
    "must be an ISO timestamp with an explicit UTC offset",
  )
  .refine((value) => !Number.isNaN(Date.parse(value)), "must parse as a date");

const imageFileName = z
  .string()
  .regex(
    /^[a-z0-9][a-z0-9-]*\.(?:jpe?g|png|webp|avif|svg)$/,
    "lowercase-kebab file name with an image extension",
  );

const imageRef = z.object({
  file: imageFileName,
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const showSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  startAt: offsetDateTime,
  endAt: offsetDateTime.optional(),
  venue: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  billing: z.array(z.string().min(1)).optional(),
  ticketUrl: absoluteUrl.optional(),
  venueUrl: absoluteUrl.optional(),
  status: z.enum(["scheduled", "sold-out", "cancelled"]),
});

export const photoEntrySchema = imageRef.extend({
  caption: z.string().optional(),
  credit: z.string().optional(),
});

export const videoEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  youtubeId: z.string().regex(/^(?:PLACEHOLDER_\w+|[A-Za-z0-9_-]{11})$/),
  publishedAt: calendarDate.optional(),
  poster: imageRef,
  featured: z.boolean().optional(),
});

export const releaseEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  releaseDate: calendarDate,
  spotifyAlbumId: z.string().regex(/^[A-Za-z0-9]{22}$/),
  artwork: imageRef,
  summary: z.string().optional(),
  links: z
    .object({
      appleMusic: absoluteUrl.optional(),
      bandcamp: absoluteUrl.optional(),
    })
    .optional(),
  featured: z.boolean().optional(),
});

export const showsSchema = z.array(showSchema);
export const photosSchema = z.array(photoEntrySchema);
export const videosSchema = z.array(videoEntrySchema);
export const releasesSchema = z.array(releaseEntrySchema);

export const collectionSchemas = {
  shows: showsSchema,
  photos: photosSchema,
  videos: videosSchema,
  releases: releasesSchema,
} as const;

export type CollectionName = keyof typeof collectionSchemas;
export type ShowEntry = z.infer<typeof showSchema>;
export type PhotoEntry = z.infer<typeof photoEntrySchema>;
export type VideoEntry = z.infer<typeof videoEntrySchema>;
export type ReleaseEntry = z.infer<typeof releaseEntrySchema>;
