import type { CollectionName } from "../../content/schemas";
import { getIdToken } from "./auth";
import { adminConfig } from "./config";

// Typed wrapper over the git-backed admin API. Every call carries the Cognito
// ID token as a bearer credential; callers must ensure the user is
// authenticated before invoking these (the UI only mounts editors post-login).

export class AdminApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export interface PhotoUpload {
  fileName: string;
  contentBase64: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  credit?: string;
}

interface OkEnvelope<T> {
  ok: true;
  data?: T;
  commitSha?: string;
}

interface ErrEnvelope {
  ok: false;
  error: string;
}

type Envelope<T> = OkEnvelope<T> | ErrEnvelope;

async function request<T>(path: string, init: RequestInit): Promise<OkEnvelope<T>> {
  const idToken = getIdToken();
  if (!idToken) {
    throw new AdminApiError("Not authenticated", 401);
  }
  let response: Response;
  try {
    response = await fetch(`${adminConfig.apiBase}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        ...init.headers,
      },
    });
  } catch (cause) {
    throw new AdminApiError(
      cause instanceof Error ? cause.message : "Network request failed",
      0,
    );
  }
  let body: Envelope<T> | null = null;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    body = null;
  }
  if (!response.ok || !body || body.ok === false) {
    const message =
      body && body.ok === false ? body.error : `Request failed (${String(response.status)})`;
    throw new AdminApiError(message, response.status);
  }
  return body;
}

export async function getCollection(collection: CollectionName): Promise<unknown[]> {
  const body = await request<unknown[]>(`/content/${collection}`, { method: "GET" });
  return Array.isArray(body.data) ? body.data : [];
}

export async function putCollection(
  collection: CollectionName,
  data: unknown[],
  message?: string,
): Promise<string> {
  const body = await request<never>(`/content/${collection}`, {
    method: "PUT",
    body: JSON.stringify(message ? { data, message } : { data }),
  });
  return body.commitSha ?? "";
}

export async function postPhoto(payload: PhotoUpload): Promise<string> {
  const body = await request<never>("/photos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return body.commitSha ?? "";
}
