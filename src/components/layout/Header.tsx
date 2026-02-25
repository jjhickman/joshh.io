import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/constants";
import { useTheme } from "@/hooks/useTheme";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-content items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-text-light dark:text-amber-soft hover:text-accent dark:hover:text-amber-strong transition-colors"
        >
          joshh.io
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "text-accent bg-accent/10 dark:text-amber-soft dark:bg-amber-soft/10"
                  : "text-text-light-muted dark:text-text-dark-muted hover:text-text-light dark:hover:text-amber-soft hover:bg-neutral-100 dark:hover:bg-neutral-800",
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="ml-2 rounded-lg p-2 text-text-light-muted dark:text-amber-soft hover:text-text-light dark:hover:text-amber-strong hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-amber-strong" />
            ) : (
              <Moon size={18} className="text-neutral-800" />
            )}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-text-light-muted dark:text-amber-soft hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-amber-strong" />
            ) : (
              <Moon size={18} className="text-neutral-800" />
            )}
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="rounded-lg p-2 text-text-light-muted dark:text-amber-soft hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "text-accent bg-accent/10 dark:text-amber-soft dark:bg-amber-soft/10"
                  : "text-text-light-muted dark:text-text-dark-muted hover:text-text-light dark:hover:text-amber-soft",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
