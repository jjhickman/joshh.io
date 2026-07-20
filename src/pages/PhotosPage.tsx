import { PhotoGallery } from "../components/media/PhotoGallery";
import { RouteMeta } from "../components/ui/RouteMeta";
import { photos } from "../content/photos";
import { routeMetadata, site } from "../content/site";

export default function PhotosPage() {
  return (
    <>
      <RouteMeta {...routeMetadata.photos} />
      <header className="page-header page-header-wide"><p className="eyebrow">VISUAL ARCHIVE</p><h1>Afterimages</h1><p className="page-intro">{site.copy.photosIntro}</p></header>
      <PhotoGallery images={photos} />
    </>
  );
}
