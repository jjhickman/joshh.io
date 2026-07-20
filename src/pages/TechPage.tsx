import { RouteMeta } from "../components/ui/RouteMeta";
import { routeMetadata } from "../content/site";
import { tech } from "../content/tech";

export default function TechPage() {
  return (
    <>
      <RouteMeta {...routeMetadata.tech} />
      <article className="tech-page">
        <p className="eyebrow">Away from the stage</p>
        <h1>Software, quietly.</h1>
        <p className="tech-bio">{tech.biography}</p>
        <section aria-labelledby="practice-title"><h2 id="practice-title">Areas of practice</h2><ul>{tech.practices.map((practice) => <li key={practice}>{practice}</li>)}</ul></section>
      </article>
    </>
  );
}
