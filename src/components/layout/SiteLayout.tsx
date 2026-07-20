import { useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { routeMetadata } from "../../content/site";
import { useRouteFocus } from "../../hooks/useRouteFocus";
import { SkipLink } from "../ui/SkipLink";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RouteAnnouncer } from "./RouteAnnouncer";

export function SiteLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  useRouteFocus(mainRef);

  return (
    <div className="site-shell">
      {pathname === "/" && (
        <>
          <title>{routeMetadata.home.title}</title>
          <meta name="description" content={routeMetadata.home.description} />
          <link rel="canonical" href="https://joshh.io/" />
        </>
      )}
      <SkipLink />
      <Header />
      <RouteAnnouncer />
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
