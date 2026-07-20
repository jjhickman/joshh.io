import { useState } from "react";
import type { Video } from "../../content/types";
import { ExternalLink } from "../ui/ExternalLink";

const isPlaceholderId = (id: string) => id.startsWith("PLACEHOLDER_");

export function YouTubeEmbed({ video }: { video: Video }) {
  const [active, setActive] = useState(false);
  const placeholder = isPlaceholderId(video.youtubeId);
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}` as const;

  return (
    <div className="video-player">
      <div className="video-frame">
        {active && !placeholder ? (
          <iframe
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
            title={`Watch ${video.title}`}
          />
        ) : (
          <>
            <img alt={video.poster.alt} height={video.poster.height} loading="lazy" src={video.poster.src} width={video.poster.width} />
            <button
              className="video-consent"
              disabled={placeholder}
              onClick={() => setActive(true)}
              type="button"
            >
              <span className="play-icon" aria-hidden="true">{placeholder ? "◇" : "▶"}</span>
              <span>{placeholder ? "Video coming soon" : "Load video"}</span>
            </button>
          </>
        )}
      </div>
      {!placeholder && <ExternalLink className="embed-fallback" href={youtubeUrl}>Watch on YouTube</ExternalLink>}
      {placeholder && <p className="placeholder-note">Poster preview · video link forthcoming</p>}
    </div>
  );
}
