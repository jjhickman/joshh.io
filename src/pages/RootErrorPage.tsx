import { Link, useRouteError } from "react-router";

export default function RootErrorPage() {
  const error = useRouteError();
  return (
    <main className="not-found error-page" id="main-content" tabIndex={-1}>
      <title>Something went quiet — Josh Hickman</title>
      <meta name="description" content="The page could not be loaded. Return to the joshh.io home page." />
      <link rel="canonical" href="https://joshh.io/" />
      <div><p className="eyebrow">SIGNAL INTERRUPTED</p><h1>Something went quiet.</h1><p>The page could not be loaded. Try returning to the beginning.</p>{import.meta.env.DEV && <p className="error-detail">{error instanceof Error ? error.message : "Unknown route error"}</p>}<Link className="button-primary" to="/">Go home</Link></div>
    </main>
  );
}
