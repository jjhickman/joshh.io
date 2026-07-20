import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnnouncement(document.title));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
