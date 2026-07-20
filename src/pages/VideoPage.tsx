import { YouTubeEmbed } from "../components/media/YouTubeEmbed";
import { Reveal } from "../components/ui/Reveal";
import { RouteMeta } from "../components/ui/RouteMeta";
import { routeMetadata, site } from "../content/site";
import { videos } from "../content/videos";

export default function VideoPage() {
  const [featured, ...remaining] = videos.toSorted((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  return (
    <>
      <RouteMeta {...routeMetadata.video} />
      <header className="page-header page-header-wide"><p className="eyebrow">PERFORMANCE / FILM</p><h1>Video</h1><p className="page-intro">{site.copy.videoIntro}</p></header>
      <div className="video-library">
        {featured && <Reveal as="article" className="video-feature"><div className="section-label"><span>01</span><p>Featured film</p></div><h2>{featured.title}</h2><YouTubeEmbed video={featured} /></Reveal>}
        {remaining.map((video, index) => <Reveal as="article" className="video-row" delay={1} key={video.id}><div className="video-row-copy"><p className="eyebrow">Film {String(index + 2).padStart(2, "0")}</p><h2>{video.title}</h2></div><YouTubeEmbed video={video} /></Reveal>)}
      </div>
    </>
  );
}
