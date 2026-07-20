import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import RootErrorPage from "../pages/RootErrorPage";
import { navigation } from "../content/site";
import { routePaths, routes } from "../router/router";

const renderRoute = (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
};

describe("routing and shell", () => {
  it("keeps the six public routes synchronized", () => {
    expect(routePaths).toEqual(["/", "/music", "/shows", "/video", "/photos", "/tech"]);
    expect(navigation.map(({ to }) => to)).toEqual(routePaths.slice(1));
    const sitemap = readFileSync(join(process.cwd(), "public/sitemap.xml"), "utf8");
    for (const path of routePaths) expect(sitemap).toContain(`<loc>https://joshh.io${path}</loc>`);
    expect(sitemap.match(/<url>/g)).toHaveLength(routePaths.length);
  });

  it("renders navigation state and updates route title", async () => {
    const router = renderRoute("/music");
    expect(await screen.findByRole("heading", { name: "Music", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Music" })).toHaveAttribute("aria-current", "page");
    await waitFor(() => expect(document.title).toBe("Music — IN CASE OF EMERGENCY"));
    await router.navigate("/shows");
    expect(await screen.findByRole("heading", { name: "Shows", level: 1 })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe("Shows — IN CASE OF EMERGENCY"));
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://joshh.io/shows");
  });

  it("renders an intentional not-found route", async () => {
    renderRoute("/missing-signal");
    expect(await screen.findByRole("heading", { name: /room went quiet/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to music/i })).toHaveAttribute("href", "/music");
    await waitFor(() => expect(document.title).toBe("Page not found — Josh Hickman"));
  });

  it("restores route focus to main", async () => {
    const router = renderRoute("/");
    await screen.findByRole("heading", { name: /in case of emergency/i });
    await router.navigate("/photos");
    await screen.findByRole("heading", { name: "Afterimages" });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("main")));
  });

  it("contains keyboard focus in the mobile disclosure and restores it on Escape", async () => {
    const user = userEvent.setup();
    renderRoute("/");
    const menuButton = await screen.findByRole("button", { name: "Open menu" });
    await user.click(menuButton);
    const mobileNav = screen.getByRole("navigation", { name: "Mobile primary" });
    const firstLink = mobileNav.querySelector("a");
    expect(firstLink).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(within(screen.getByRole("dialog", { name: "Site menu" })).getByRole("button", { name: "Close menu" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "Mobile primary" })).not.toBeInTheDocument();
    await waitFor(() => expect(menuButton).toHaveFocus());
  });

  it("renders the root error treatment", async () => {
    const router = createMemoryRouter([
      { path: "/", Component: () => null, hydrateFallbackElement: <div>Loading</div>, loader: () => { throw new Error("test failure"); }, ErrorBoundary: RootErrorPage },
    ]);
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole("heading", { name: /something went quiet/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
  });
});
