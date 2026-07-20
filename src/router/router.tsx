import { createBrowserRouter, type RouteObject } from "react-router";
import { SiteLayout } from "../components/layout/SiteLayout";
import RootErrorPage from "../pages/RootErrorPage";

export const routePaths = ["/", "/music", "/shows", "/video", "/photos", "/tech"] as const;

const routes: RouteObject[] = [
  {
    path: "/",
    Component: SiteLayout,
    errorElement: <RootErrorPage />,
    hydrateFallbackElement: <div className="route-loading" role="status">Loading page…</div>,
    children: [
      { index: true, lazy: async () => ({ Component: (await import("../pages/HomePage")).default }) },
      { path: "music", lazy: async () => ({ Component: (await import("../pages/MusicPage")).default }) },
      { path: "shows", lazy: async () => ({ Component: (await import("../pages/ShowsPage")).default }) },
      { path: "video", lazy: async () => ({ Component: (await import("../pages/VideoPage")).default }) },
      { path: "photos", lazy: async () => ({ Component: (await import("../pages/PhotosPage")).default }) },
      { path: "tech", lazy: async () => ({ Component: (await import("../pages/TechPage")).default }) },
      // Hidden authenticated admin — intentionally absent from routePaths, nav, and the sitemap.
      { path: "admin", lazy: async () => ({ Component: (await import("../pages/admin/AdminPage")).default }) },
      { path: "*", lazy: async () => ({ Component: (await import("../pages/NotFoundPage")).default }) },
    ],
  },
];

export const router = createBrowserRouter(routes);
export { routes };
