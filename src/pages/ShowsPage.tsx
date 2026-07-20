import { Reveal } from "../components/ui/Reveal";
import { RouteMeta } from "../components/ui/RouteMeta";
import { ShowListing } from "../components/ui/ShowListing";
import { partitionShows, shows } from "../content/shows";
import { routeMetadata, site } from "../content/site";

export default function ShowsPage() {
  const { upcoming, past } = partitionShows(shows, new Date());
  const [next, ...later] = upcoming;
  return (
    <>
      <RouteMeta {...routeMetadata.shows} />
      <header className="page-header">
        <p className="eyebrow">IN CASE OF EMERGENCY · LIVE</p>
        <h1>Shows</h1>
        <p className="page-intro">{site.copy.showsIntro}</p>
      </header>
      <div className="shows-page">
        <Reveal as="section" className="show-section next-show-block">
          <div className="section-label"><span>Now</span><p>Next show</p></div>
          {next ? <ShowListing prominent show={next} /> : <p className="empty-state">No dates announced. The archive stays open below.</p>}
        </Reveal>
        <Reveal as="section" className="show-section" delay={1}>
          <div className="show-section-heading"><h2>Upcoming</h2><span>{later.length}</span></div>
          {later.length ? later.map((show) => <ShowListing key={show.id} show={show} />) : <p className="empty-state">No additional dates announced.</p>}
        </Reveal>
        <Reveal as="section" className="show-section archive" delay={2}>
          <div className="show-section-heading"><h2>Past shows</h2><span>{past.length}</span></div>
          {past.length ? past.map((show) => <ShowListing key={show.id} show={show} />) : <p className="empty-state">The live archive is quiet for now.</p>}
        </Reveal>
      </div>
    </>
  );
}
