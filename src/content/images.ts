// Content JSON refers to images by file name; Vite owns the hashed URLs.
// Each resolver throws at module load if an entry points at a file that is
// not in the repo, so a bad admin commit fails the build, never the visitor.
const galleryModules = import.meta.glob<string>("../assets/images/gallery/*", {
  eager: true,
  import: "default",
});
const videoModules = import.meta.glob<string>("../assets/images/videos/*", {
  eager: true,
  import: "default",
});
const releaseModules = import.meta.glob<string>("../assets/images/releases/*", {
  eager: true,
  import: "default",
});

function resolver(modules: Record<string, string>, directory: string) {
  return (file: string): string => {
    const url = modules[`../assets/images/${directory}/${file}`];
    if (!url) {
      throw new Error(`content references missing image ${directory}/${file}`);
    }
    return url;
  };
}

export const galleryImage = resolver(galleryModules, "gallery");
export const videoImage = resolver(videoModules, "videos");
export const releaseImage = resolver(releaseModules, "releases");
