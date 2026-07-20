import type { CollectionName } from "../../content/schemas";

// Declarative field descriptors drive the collection editors: one list per
// collection, walked to render inputs and to rebuild a clean entry object for
// zod validation. Paths are dot-delimited to reach nested image refs and links.

export type FieldKind =
  | "text"
  | "datetime"
  | "date"
  | "url"
  | "number"
  | "checkbox"
  | "billing"
  | "select";

export interface FieldDef {
  path: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: readonly string[];
  hint?: string;
}

export interface CollectionDef {
  label: string;
  singular: string;
  fields: readonly FieldDef[];
  blank: () => Record<string, unknown>;
  /** Short human summary shown as the entry legend. */
  title: (entry: Record<string, unknown>, index: number) => string;
}

const imageFields = (base: string): FieldDef[] => [
  { path: `${base}.file`, label: "Image file", kind: "text", required: true, hint: "lowercase-kebab.ext already in assets" },
  { path: `${base}.alt`, label: "Image alt text", kind: "text", required: true },
  { path: `${base}.width`, label: "Width", kind: "number", required: true },
  { path: `${base}.height`, label: "Height", kind: "number", required: true },
];

export const collectionDefs: Record<CollectionName, CollectionDef> = {
  shows: {
    label: "Shows",
    singular: "show",
    fields: [
      { path: "id", label: "ID", kind: "text", required: true, hint: "lowercase, digits, hyphens" },
      { path: "startAt", label: "Start", kind: "datetime", required: true, hint: "YYYY-MM-DDTHH:MM:SS±HH:MM or Z" },
      { path: "endAt", label: "End", kind: "datetime", hint: "optional, same offset format" },
      { path: "venue", label: "Venue", kind: "text", required: true },
      { path: "city", label: "City", kind: "text", required: true },
      { path: "region", label: "Region", kind: "text", required: true },
      { path: "billing", label: "Billing", kind: "billing", hint: "comma-separated" },
      { path: "ticketUrl", label: "Ticket URL", kind: "url" },
      { path: "venueUrl", label: "Venue URL", kind: "url" },
      { path: "status", label: "Status", kind: "select", required: true, options: ["scheduled", "sold-out", "cancelled"] },
    ],
    blank: () => ({ id: "", startAt: "", venue: "", city: "", region: "", status: "scheduled" }),
    title: (entry, index) => asText(entry["venue"]) || asText(entry["id"]) || `Show ${String(index + 1)}`,
  },
  releases: {
    label: "Releases",
    singular: "release",
    fields: [
      { path: "slug", label: "Slug", kind: "text", required: true, hint: "lowercase, digits, hyphens" },
      { path: "title", label: "Title", kind: "text", required: true },
      { path: "releaseDate", label: "Release date", kind: "date", required: true, hint: "YYYY-MM-DD" },
      { path: "spotifyAlbumId", label: "Spotify album ID", kind: "text", required: true, hint: "22-character base62" },
      ...imageFields("artwork"),
      { path: "summary", label: "Summary", kind: "text" },
      { path: "links.appleMusic", label: "Apple Music URL", kind: "url" },
      { path: "links.bandcamp", label: "Bandcamp URL", kind: "url" },
      { path: "featured", label: "Featured", kind: "checkbox" },
    ],
    blank: () => ({ slug: "", title: "", releaseDate: "", spotifyAlbumId: "", artwork: { file: "", alt: "", width: 0, height: 0 } }),
    title: (entry, index) => asText(entry["title"]) || asText(entry["slug"]) || `Release ${String(index + 1)}`,
  },
  videos: {
    label: "Videos",
    singular: "video",
    fields: [
      { path: "id", label: "ID", kind: "text", required: true, hint: "lowercase, digits, hyphens" },
      { path: "title", label: "Title", kind: "text", required: true },
      { path: "youtubeId", label: "YouTube ID", kind: "text", required: true, hint: "11-character id" },
      { path: "publishedAt", label: "Published", kind: "date", hint: "optional, YYYY-MM-DD" },
      ...imageFields("poster"),
      { path: "featured", label: "Featured", kind: "checkbox" },
    ],
    blank: () => ({ id: "", title: "", youtubeId: "", poster: { file: "", alt: "", width: 0, height: 0 } }),
    title: (entry, index) => asText(entry["title"]) || asText(entry["id"]) || `Video ${String(index + 1)}`,
  },
  photos: {
    label: "Photos",
    singular: "photo",
    fields: [],
    blank: () => ({}),
    title: (_entry, index) => `Photo ${String(index + 1)}`,
  },
};

export const editableCollections = ["shows", "releases", "videos"] as const satisfies readonly CollectionName[];

/** Stringify only primitives; objects/null/undefined become an empty string. */
export function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return "";
}

export function getPath(entry: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, entry);
}

export function setPath(entry: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const next = structuredCloneSafe(entry);
  let node = next;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i]!;
    const child = node[key];
    node[key] = child && typeof child === "object" ? { ...(child as Record<string, unknown>) } : {};
    node = node[key] as Record<string, unknown>;
  }
  node[keys[keys.length - 1]!] = value;
  return next;
}

function structuredCloneSafe(entry: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(entry)) as Record<string, unknown>;
}

const OMIT = Symbol("omit");

function coerce(field: FieldDef, raw: unknown): unknown {
  switch (field.kind) {
    case "checkbox":
      return raw === true ? true : OMIT;
    case "billing": {
      const list = Array.isArray(raw)
        ? (raw as unknown[]).map((item) => asText(item).trim()).filter(Boolean)
        : asText(raw)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
      return list.length ? list : OMIT;
    }
    case "number": {
      if (raw === "" || raw === undefined || raw === null) return field.required ? Number.NaN : OMIT;
      return Number(raw);
    }
    default: {
      const value = asText(raw);
      if (value === "" && !field.required) return OMIT;
      return value;
    }
  }
}

/**
 * Rebuild a validation-ready entry from a working draft: optional empty fields
 * are dropped entirely (never set to undefined) and nested containers only
 * appear when at least one child is present.
 */
export function buildEntry(def: CollectionDef, draft: Record<string, unknown>): Record<string, unknown> {
  let out: Record<string, unknown> = {};
  for (const field of def.fields) {
    const value = coerce(field, getPath(draft, field.path));
    if (value === OMIT) continue;
    out = setPath(out, field.path, value);
  }
  return out;
}
