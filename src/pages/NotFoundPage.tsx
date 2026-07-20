import { Link, useLocation } from "react-router";
import heroImage from "../assets/images/hero/placeholder-hero.svg";
import { site } from "../content/site";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <section className="not-found">
      <title>Page not found — Josh Hickman</title>
      <meta name="description" content="This page has faded out. Return to the music of IN CASE OF EMERGENCY." />
      <link rel="canonical" href={`https://joshh.io${pathname}`} />
      <img alt="" height="1200" src={heroImage} width="1920" />
      <div><p className="eyebrow">404 · SIGNAL LOST</p><h1>The room went quiet.</h1><p>{site.copy.notFoundMessage}</p><div className="not-found-actions"><Link className="button-primary" to="/music">Return to Music</Link><Link className="text-link" to="/">Go home <span aria-hidden="true">→</span></Link></div></div>
    </section>
  );
}
