import { useEffect, useId, useState } from "react";
import { photoEntrySchema } from "../../content/schemas";
import { AdminApiError, getCollection, postPhoto, type PhotoUpload } from "./api";
import { asText } from "./fields";

const MAX_BYTES = 6 * 1024 * 1024;
const FILE_NAME = /^[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)$/;
const ACCEPT = "image/jpeg,image/png,image/webp";

interface LoadedPhoto {
  file: string;
  alt: string;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

async function naturalSize(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    image.src = url;
  });
}

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function PhotoUploader() {
  const baseId = useId();
  const [photos, setPhotos] = useState<LoadedPhoto[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [slug, setSlug] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    let active = true;
    getCollection("photos")
      .then((data) => {
        if (!active) return;
        setPhotos(
          data.map((entry) => {
            const record = (entry ?? {}) as Record<string, unknown>;
            return { file: asText(record["file"]), alt: asText(record["alt"]) };
          }),
        );
        setLoadState("ready");
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setLoadError(cause instanceof Error ? cause.message : "Failed to load photos");
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResult("");
    setDimensions(null);
    const selected = event.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!selected) {
      setFile(null);
      setPreviewUrl("");
      return;
    }
    if (selected.size > MAX_BYTES) {
      setFile(null);
      setPreviewUrl("");
      setError("Image exceeds the 6 MB limit.");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    naturalSize(selected)
      .then(setDimensions)
      .catch(() => setError("Could not read image dimensions."));
  };

  const fileName = file ? `${slug}.${extensionOf(file.name)}` : "";

  const submit = () => {
    setError("");
    setResult("");
    if (!file) {
      setError("Choose an image to upload.");
      return;
    }
    if (!dimensions) {
      setError("Still reading image dimensions — try again in a moment.");
      return;
    }
    if (!FILE_NAME.test(fileName)) {
      setError("File name must be lowercase-kebab with a .jpg/.jpeg/.png/.webp extension.");
      return;
    }
    const candidate: Record<string, unknown> = {
      file: fileName,
      alt: alt.trim(),
      width: dimensions.width,
      height: dimensions.height,
    };
    if (caption.trim()) candidate["caption"] = caption.trim();
    if (credit.trim()) candidate["credit"] = credit.trim();
    const parsed = photoEntrySchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
      return;
    }
    setSubmitting(true);
    readBase64(file)
      .then((contentBase64) => {
        const payload: PhotoUpload = {
          fileName,
          contentBase64,
          width: dimensions.width,
          height: dimensions.height,
          alt: alt.trim(),
          ...(caption.trim() ? { caption: caption.trim() } : {}),
          ...(credit.trim() ? { credit: credit.trim() } : {}),
        };
        return postPhoto(payload);
      })
      .then((commitSha) => {
        setResult(commitSha);
        setPhotos((prev) => [...prev, { file: fileName, alt: alt.trim() }]);
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
        setDimensions(null);
        setSlug("");
        setAlt("");
        setCaption("");
        setCredit("");
      })
      .catch((cause: unknown) => {
        setError(cause instanceof AdminApiError || cause instanceof Error ? cause.message : "Upload failed");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="admin-editor">
      <section aria-labelledby={`${baseId}-current`}>
        <h3 id={`${baseId}-current`}>Current photos</h3>
        {loadState === "loading" ? <p className="admin-note">Loading photos…</p> : null}
        {loadState === "error" ? (
          <p className="admin-note admin-error" role="alert">
            Could not load photos: {loadError}
          </p>
        ) : null}
        {loadState === "ready" ? (
          photos.length ? (
            <ul className="admin-photo-list">
              {photos.map((photo) => (
                <li key={photo.file}>
                  <strong>{photo.file}</strong>
                  <span>{photo.alt}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-note">No photos yet.</p>
          )
        ) : null}
      </section>

      <section aria-labelledby={`${baseId}-upload`}>
        <h3 id={`${baseId}-upload`}>Upload a photo</h3>
        <div className="admin-grid">
          <div className="admin-field">
            <label htmlFor={`${baseId}-file`}>Image file (JPEG, PNG, or WebP; max 6 MB)</label>
            <input id={`${baseId}-file`} type="file" accept={ACCEPT} onChange={onFile} />
          </div>
          <div className="admin-field">
            <label htmlFor={`${baseId}-slug`}>File slug</label>
            <input
              id={`${baseId}-slug`}
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <span className="admin-hint">
              {fileName ? `Saved as ${fileName}` : "lowercase-kebab; extension comes from the file"}
            </span>
          </div>
          <div className="admin-field">
            <label htmlFor={`${baseId}-alt`}>
              Alt text<span aria-hidden="true"> *</span>
            </label>
            <input
              id={`${baseId}-alt`}
              type="text"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label htmlFor={`${baseId}-caption`}>Caption</label>
            <input
              id={`${baseId}-caption`}
              type="text"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label htmlFor={`${baseId}-credit`}>Credit</label>
            <input
              id={`${baseId}-credit`}
              type="text"
              value={credit}
              onChange={(event) => setCredit(event.target.value)}
            />
          </div>
        </div>

        {previewUrl ? (
          <div className="admin-preview">
            <img src={previewUrl} alt="Selected upload preview" />
            {dimensions ? (
              <span className="admin-hint">
                {dimensions.width} × {dimensions.height}px
              </span>
            ) : (
              <span className="admin-hint">Reading dimensions…</span>
            )}
          </div>
        ) : null}

        <div className="admin-save">
          <button type="button" className="admin-button" onClick={submit} disabled={submitting}>
            {submitting ? "Uploading…" : "Upload photo"}
          </button>
        </div>

        {error ? (
          <p className="admin-note admin-error" role="alert">
            {error}
          </p>
        ) : null}
        {result ? (
          <p className="admin-note admin-success" role="status">
            Uploaded as {result.slice(0, 7)}. Deploy in progress — live in ~3 minutes.
          </p>
        ) : null}
      </section>
    </div>
  );
}
