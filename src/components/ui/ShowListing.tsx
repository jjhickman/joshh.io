import type { Show } from "../../content/types";
import { ExternalLink } from "./ExternalLink";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/New_York",
});

export function ShowListing({ show, prominent = false }: { show: Show; prominent?: boolean }) {
  const detailUrl = show.ticketUrl ?? show.venueUrl;
  return (
    <article className={prominent ? "show-listing show-listing-prominent" : "show-listing"}>
      <time dateTime={show.startAt}>{dateFormatter.format(new Date(show.startAt))}</time>
      <div>
        <h3>{show.venue}</h3>
        <p>{show.city}, {show.region}</p>
        {show.billing && <p className="billing">with {show.billing.filter((act) => act !== "IN CASE OF EMERGENCY").join(", ")}</p>}
      </div>
      <div className="show-action">
        {show.status !== "scheduled" && <span className="show-status">{show.status.replace("-", " ")}</span>}
        {detailUrl && <ExternalLink href={detailUrl}>{show.ticketUrl ? "Tickets" : "Venue details"}</ExternalLink>}
      </div>
    </article>
  );
}
