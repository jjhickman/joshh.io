import { useState } from "react";
import type { Release } from "../../content/types";
import { spotifyAlbumUrl, spotifyEmbedUrl } from "../../content/releases";
import { ExternalLink } from "../ui/ExternalLink";

export function SpotifyEmbed({ release }: { release: Release }) {
  const [active, setActive] = useState(false);

  return (
    <div className="spotify-player">
      {active ? (
        <iframe
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          src={spotifyEmbedUrl(release.spotifyAlbumId)}
          title={`Listen to ${release.title} on Spotify`}
        />
      ) : (
        <button className="embed-consent" onClick={() => setActive(true)} type="button">
          <span className="play-icon" aria-hidden="true">▶</span>
          <span><strong>Load Spotify player</strong><small>Connects to Spotify after activation</small></span>
        </button>
      )}
      <ExternalLink className="embed-fallback" href={spotifyAlbumUrl(release.spotifyAlbumId)}>
        Open {release.title} on Spotify
      </ExternalLink>
    </div>
  );
}
