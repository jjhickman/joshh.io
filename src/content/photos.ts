import gallery01 from "../assets/images/gallery/placeholder-gallery-01.svg";
import gallery02 from "../assets/images/gallery/placeholder-gallery-02.svg";
import gallery03 from "../assets/images/gallery/placeholder-gallery-03.svg";
import gallery04 from "../assets/images/gallery/placeholder-gallery-04.svg";
import gallery05 from "../assets/images/gallery/placeholder-gallery-05.svg";
import gallery06 from "../assets/images/gallery/placeholder-gallery-06.svg";
import gallery07 from "../assets/images/gallery/placeholder-gallery-07.svg";
import gallery08 from "../assets/images/gallery/placeholder-gallery-08.svg";
import type { ImageAsset } from "./types";

export const photos = [
  { src: gallery01, alt: "Guitarist silhouette emerging from teal stage light", width: 1400, height: 1000, caption: "The room before the final swell.", credit: "Placeholder studio" }, // PLACEHOLDER
  { src: gallery02, alt: "Tall silhouette beneath crossing beams", width: 1000, height: 1400, caption: "Between songs, Boston.", credit: "Placeholder studio" }, // PLACEHOLDER
  { src: gallery03, alt: "Wide stage washed in blue-black light", width: 1600, height: 900, caption: "A quiet opening becomes a wall of sound.", credit: "Placeholder studio" }, // PLACEHOLDER
  { src: gallery04, alt: "Abstract concentric rings in dark teal", width: 1200, height: 1200, caption: "Afterimage study I.", credit: "Placeholder studio" }, // PLACEHOLDER
  { src: gallery05, alt: "Vertical planes of violet and teal stage light", width: 1000, height: 1400, caption: "Side-stage light study.", credit: "Placeholder studio" }, // PLACEHOLDER
  { src: gallery06, alt: "Low wave of light across a dark performance space", width: 1400, height: 1000, caption: "The last note hanging in the air.", credit: "Placeholder studio" }, // PLACEHOLDER
  { src: gallery07, alt: "Dark stage form split by a narrow teal beam", width: 1600, height: 900, caption: "Soundcheck geometry.", credit: "Placeholder studio" }, // PLACEHOLDER
  { src: gallery08, alt: "Layered horizontal lines fading into blue-black", width: 1200, height: 1200, caption: "Afterimage study II.", credit: "Placeholder studio" }, // PLACEHOLDER
] satisfies ImageAsset[];
