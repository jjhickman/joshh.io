import { useEffect, useId, useState } from "react";
import { collectionSchemas, type CollectionName } from "../../content/schemas";
import { AdminApiError, getCollection, putCollection } from "./api";
import {
  asText,
  buildEntry,
  collectionDefs,
  getPath,
  setPath,
  type FieldDef,
} from "./fields";

type Draft = Record<string, unknown>;

interface SaveResult {
  commitSha: string;
}

function displayValue(field: FieldDef, raw: unknown): string {
  if (field.kind === "billing") {
    return Array.isArray(raw) ? (raw as unknown[]).map(asText).join(", ") : asText(raw);
  }
  return asText(raw);
}

export function CollectionEditor({ collection }: { collection: CollectionName }) {
  const def = collectionDefs[collection];
  const baseId = useId();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string>("");
  const [message, setMessage] = useState<string>(`Update ${collection} via admin`);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  useEffect(() => {
    let active = true;
    setLoadState("loading");
    getCollection(collection)
      .then((data) => {
        if (!active) return;
        setDrafts(data.map((entry) => (entry && typeof entry === "object" ? { ...(entry as Draft) } : {})));
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load");
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, [collection]);

  const updateField = (index: number, path: string, value: unknown) => {
    setSaveResult(null);
    setDrafts((prev) => prev.map((draft, i) => (i === index ? setPath(draft, path, value) : draft)));
  };

  const addEntry = () => {
    setSaveResult(null);
    setDrafts((prev) => [...prev, def.blank()]);
  };

  const removeEntry = (index: number) => {
    setSaveResult(null);
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const save = () => {
    setFormError("");
    setFieldErrors({});
    setSaveResult(null);
    const entries = drafts.map((draft) => buildEntry(def, draft));
    const parsed = collectionSchemas[collection].safeParse(entries);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const [index, ...rest] = issue.path;
        if (typeof index === "number" && rest.length) {
          nextErrors[`${String(index)}:${rest.join(".")}`] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setFormError(`${String(parsed.error.issues.length)} field(s) need attention before saving.`);
      return;
    }
    setSaving(true);
    putCollection(collection, parsed.data as unknown[], message.trim() || undefined)
      .then((commitSha) => setSaveResult({ commitSha }))
      .catch((error: unknown) => {
        setFormError(
          error instanceof AdminApiError || error instanceof Error ? error.message : "Save failed",
        );
      })
      .finally(() => setSaving(false));
  };

  if (loadState === "loading") {
    return <p className="admin-note">Loading {collection}…</p>;
  }
  if (loadState === "error") {
    return (
      <p className="admin-note admin-error" role="alert">
        Could not load {collection}: {loadError}
      </p>
    );
  }

  return (
    <div className="admin-editor">
      {drafts.length === 0 ? (
        <p className="admin-note">No {collection} yet. Add the first {def.singular}.</p>
      ) : (
        <ol className="admin-entries">
          {drafts.map((draft, index) => (
            <li key={index} className="admin-entry">
              <fieldset>
                <legend>{def.title(draft, index)}</legend>
                <div className="admin-grid">
                  {def.fields.map((field) => {
                    const fieldId = `${baseId}-${String(index)}-${field.path}`;
                    const errorKey = `${String(index)}:${field.path}`;
                    const error = fieldErrors[errorKey];
                    const raw = getPath(draft, field.path);
                    const describedBy = [field.hint ? `${fieldId}-hint` : "", error ? `${fieldId}-error` : ""]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <div key={field.path} className="admin-field">
                        {field.kind === "checkbox" ? (
                          <label className="admin-check" htmlFor={fieldId}>
                            <input
                              id={fieldId}
                              type="checkbox"
                              checked={raw === true}
                              onChange={(event) => updateField(index, field.path, event.target.checked)}
                            />
                            <span>{field.label}</span>
                          </label>
                        ) : (
                          <>
                            <label htmlFor={fieldId}>
                              {field.label}
                              {field.required ? <span aria-hidden="true"> *</span> : null}
                            </label>
                            {field.kind === "select" ? (
                              <select
                                id={fieldId}
                                value={displayValue(field, raw)}
                                aria-invalid={error ? true : undefined}
                                aria-describedby={describedBy || undefined}
                                onChange={(event) => updateField(index, field.path, event.target.value)}
                              >
                                {(field.options ?? []).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                id={fieldId}
                                type={field.kind === "number" ? "number" : "text"}
                                inputMode={field.kind === "number" ? "numeric" : undefined}
                                value={displayValue(field, raw)}
                                aria-invalid={error ? true : undefined}
                                aria-describedby={describedBy || undefined}
                                onChange={(event) => updateField(index, field.path, event.target.value)}
                              />
                            )}
                          </>
                        )}
                        {field.hint ? (
                          <span className="admin-hint" id={`${fieldId}-hint`}>
                            {field.hint}
                          </span>
                        ) : null}
                        {error ? (
                          <span className="admin-error" id={`${fieldId}-error`} role="alert">
                            {error}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <button type="button" className="admin-button-quiet" onClick={() => removeEntry(index)}>
                  Delete {def.singular}
                </button>
              </fieldset>
            </li>
          ))}
        </ol>
      )}

      <div className="admin-actions">
        <button type="button" className="admin-button-quiet" onClick={addEntry}>
          Add {def.singular}
        </button>
      </div>

      <div className="admin-save">
        <label htmlFor={`${baseId}-message`}>Commit message</label>
        <input
          id={`${baseId}-message`}
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="button" className="admin-button" onClick={save} disabled={saving}>
          {saving ? "Saving…" : `Save ${collection}`}
        </button>
      </div>

      {formError ? (
        <p className="admin-note admin-error" role="alert">
          {formError}
        </p>
      ) : null}
      {saveResult ? (
        <p className="admin-note admin-success" role="status">
          Saved as {saveResult.commitSha.slice(0, 7)}. Deploy in progress — live in ~3 minutes.
        </p>
      ) : null}
    </div>
  );
}
