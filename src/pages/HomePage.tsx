import { Link } from "react-router";
import { YouTubeEmbed } from "../components/media/YouTubeEmbed";
import { SpotifyEmbed } from "../components/media/SpotifyEmbed";
import { Reveal } from "../components/ui/Reveal";
import { ShowListing } from "../components/ui/ShowListing";
import { featuredRelease } from "../content/releases";
import { photos } from "../content/photos";
import { partitionShows, shows } from "../content/shows";
import { site } from "../content/site";
import { featuredVideo } from "../content/videos";

export default function HomePage() {
  const nextShow = partitionShows(shows, new Date()).upcoming[0];
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <img
          alt={site.hero.alt}
          className="hero-image"
          fetchPriority="high"
          height={site.hero.height}
          src={site.hero.src}
          width={site.hero.width}
        />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-kicker">Boston · post-rock / dream pop / indie / prog</p>
          <h1 id="home-title">IN CASE<br />OF EMERGENCY</h1>
          <p className="hero-role">Josh Hickman — lead guitar</p>
          <div className="hero-actions">
            <Link className="button-primary" to="/music">Listen</Link>
            <Link className="text-link" to="/shows">See shows <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <a className="hero-scroll" href="#featured-release"><span>Enter</span><i aria-hidden="true" /></a>
      </section>

      <Reveal as="section" className="section release-feature" delay={0}>
        <div className="section-label"><span>01</span><p>Featured release</p></div>
        <div className="release-feature-grid" id="featured-release">
          <div className="release-art media-hover">
            <img alt={featuredRelease.artwork.alt} height={featuredRelease.artwork.height} src={featuredRelease.artwork.src} width={featuredRelease.artwork.width} />
          </div>
          <div className="release-copy">
            <p className="eyebrow">Latest signal</p>
            <h2>{featuredRelease.title}</h2>
            <p>{featuredRelease.summary}</p>
            <SpotifyEmbed release={featuredRelease} />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section next-show" delay={1}>
        <div className="section-label"><span>02</span><p>Live</p></div>
        <div className="section-heading-row"><h2>Next transmission</h2><Link className="text-link" to="/shows">All shows <span aria-hidden="true">→</span></Link></div>
        {nextShow ? <ShowListing prominent show={nextShow} /> : <p className="empty-state">No dates announced. <Link to="/shows">Visit the live archive.</Link></p>}
      </Reveal>

      <Reveal as="section" className="section film-feature" delay={1}>
        <div className="section-label"><span>03</span><p>Performance film</p></div>
        <div className="section-heading-row"><h2>{featuredVideo.title}</h2><Link className="text-link" to="/video">All video <span aria-hidden="true">→</span></Link></div>
        <YouTubeEmbed video={featuredVideo} />
      </Reveal>

      <Reveal as="section" className="section photo-strip-section" delay={2}>
        <div className="section-label"><span>04</span><p>Afterimages</p></div>
        <div className="photo-strip">
          {photos.slice(0, 3).map((photo) => <img alt={photo.alt} height={photo.height} key={photo.src} loading="lazy" src={photo.src} width={photo.width} />)}
        </div>
        <Link className="text-link strip-link" to="/photos">Enter the photo archive <span aria-hidden="true">→</span></Link>
      </Reveal>

      <Reveal as="section" className="section closing-links" delay={1}>
        <p className="eyebrow">Keep listening</p>
        <h2>{site.copy.closingHeading}</h2>
        <div className="closing-actions"><Link className="button-primary" to="/music">Explore the records</Link><Link className="text-link" to="/shows">Find a show <span aria-hidden="true">→</span></Link></div>
      </Reveal>
    </>
  );
}
