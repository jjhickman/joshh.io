import type { RouteMetadata } from "../../content/types";

export function RouteMeta({ title, description, canonicalPath }: RouteMetadata) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`https://joshh.io${canonicalPath}`} />
    </>
  );
}
