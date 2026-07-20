import { SpotifyEmbed } from "../components/media/SpotifyEmbed";
import { Reveal } from "../components/ui/Reveal";
import { RouteMeta } from "../components/ui/RouteMeta";
import { releases } from "../content/releases";
import { routeMetadata, site } from "../content/site";

export default function MusicPage() {
  const ordered = releases.toSorted((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  return (
    <>
      <RouteMeta {...routeMetadata.music} />
      <header className="page-header page-header-wide">
        <p className="eyebrow">IN CASE OF EMERGENCY</p>
        <h1>Music</h1>
        <p className="page-intro">{site.copy.musicIntro}</p>
      </header>
      <div className="catalog">
        {ordered.map((release, index) => (
          <Reveal as="article" className="release-row" delay={(index % 3) as 0 | 1 | 2} key={release.slug}>
            <div className="release-index">{String(index + 1).padStart(2, "0")}</div>
            <div className="release-art media-hover"><img alt={release.artwork.alt} height={release.artwork.height} loading={index === 0 ? "eager" : "lazy"} src={release.artwork.src} width={release.artwork.width} /></div>
            <div className="release-copy">
              <p className="eyebrow">{release.featured ? "Featured release" : "From the catalog"}</p>
              <h2>{release.title}</h2>
              <p>{release.summary}</p>
              <SpotifyEmbed release={release} />
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}
