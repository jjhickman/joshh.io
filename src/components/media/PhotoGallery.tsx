import type { ImageAsset } from "../../content/types";

export function PhotoGallery({ images }: { images: readonly ImageAsset[] }) {
  return (
    <div className="photo-gallery">
      {images.map((image, index) => (
        <figure className={`gallery-item gallery-item-${(index % 4) + 1}`} key={image.src}>
          <img
            alt={image.alt}
            height={image.height}
            loading="lazy"
            src={image.src}
            width={image.width}
          />
          {(image.caption || image.credit) && (
            <figcaption>
              {image.caption && <span>{image.caption}</span>}
              {image.credit && <small>Photo: {image.credit}</small>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
