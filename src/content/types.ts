export type AbsoluteUrl = `https://${string}`;
export type IsoDateTime = string;

export interface PlatformLinks {
  appleMusic?: AbsoluteUrl;
  bandcamp?: AbsoluteUrl;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  credit?: string;
}

export interface Release {
  slug: string;
  title: string;
  releaseDate: `${number}-${number}-${number}`;
  spotifyAlbumId: string;
  artwork: ImageAsset;
  summary?: string;
  links?: PlatformLinks;
  featured?: boolean;
}

export interface Show {
  id: string;
  startAt: IsoDateTime;
  endAt?: IsoDateTime;
  venue: string;
  city: string;
  region: string;
  billing?: string[];
  ticketUrl?: AbsoluteUrl;
  venueUrl?: AbsoluteUrl;
  status: "scheduled" | "sold-out" | "cancelled";
}

export interface Video {
  id: string;
  title: string;
  youtubeId: string;
  poster: ImageAsset;
  publishedAt?: `${number}-${number}-${number}`;
  featured?: boolean;
}

export interface RouteMetadata {
  title: string;
  description: string;
  canonicalPath: "/" | "/music" | "/shows" | "/video" | "/photos" | "/tech";
}
