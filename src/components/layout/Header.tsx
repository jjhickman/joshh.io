import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { navigation } from "../../content/site";

function NavigationLinks({ onNavigate, mobile = false }: { onNavigate?: () => void; mobile?: boolean }) {
  return navigation.map((item) => (
    <NavLink
      className={({ isActive }) => `${"quiet" in item && item.quiet ? "nav-quiet " : ""}${isActive ? "nav-active" : ""}`}
      key={item.to}
      onClick={onNavigate}
      to={item.to}
      viewTransition
    >
      {item.label}
      {mobile && <span aria-hidden="true">—</span>}
    </NavLink>
  ));
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = priorOverflow;
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    window.requestAnimationFrame(() => menuButton.current?.focus());
  }

  function trapKeyboard(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(panel.current?.querySelectorAll<HTMLElement>('a, button:not([disabled])') ?? []);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <header className="site-header" data-menu-open={open || undefined} data-scrolled={scrolled || undefined}>
      <Link aria-label="Josh Hickman home" className="wordmark" to="/" viewTransition>JH</Link>
      <nav aria-label="Primary" className="desktop-nav"><NavigationLinks /></nav>
      <button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="menu-button"
        onClick={() => setOpen((value) => !value)}
        ref={menuButton}
        type="button"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {open && (
        <dialog aria-label="Site menu" className="mobile-menu" id="mobile-navigation" onKeyDown={trapKeyboard} open ref={panel}>
          <nav aria-label="Mobile primary"><NavigationLinks mobile onNavigate={closeMenu} /></nav>
          <button className="mobile-close" onClick={closeMenu} type="button">Close menu</button>
        </dialog>
      )}
    </header>
  );
}
