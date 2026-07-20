import { Link } from "react-router";
import { releases, spotifyAlbumUrl } from "../../content/releases";
import { socialLinks } from "../../content/site";
import { ExternalLink } from "../ui/ExternalLink";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-band">IN CASE OF EMERGENCY</p>
        <p className="footer-genres">Boston · post-rock · dream pop · indie · prog</p>
      </div>
      <div className="footer-links" aria-label="Music and social links">
        {releases.map((release) => (
          <ExternalLink href={spotifyAlbumUrl(release.spotifyAlbumId)} key={release.slug}>{release.title}</ExternalLink>
        ))}
        {socialLinks.map((link) => (
          <ExternalLink href={link.href} key={link.label}>{link.label}</ExternalLink>
        ))}
      </div>
      <div className="footer-base">
        <p>© {new Date().getFullYear()} Josh Hickman</p>
        <p>Josh also builds software. <Link to="/tech">A quiet note on tech</Link>.</p>
      </div>
    </footer>
  );
}
