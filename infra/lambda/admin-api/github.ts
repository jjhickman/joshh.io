import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { logger } from "./logger.js";

// Every edit becomes an atomic commit through the GitHub Git Data API: blob →
// tree (on the current base tree) → commit (parented on the current tip) →
// non-force ref update. A concurrent push therefore fails the PATCH rather than
// being silently overwritten.
const GITHUB_API = "https://api.github.com";

export interface GithubContext {
  readonly repo: string;
  readonly branch: string;
  readonly tokenParam: string;
}

export interface CommitFile {
  readonly path: string;
  readonly content: string;
  readonly encoding: "utf-8" | "base64";
}

export interface CommitAuthor {
  readonly name: string;
  readonly email: string;
}

export interface CommitRequest {
  readonly message: string;
  readonly author: CommitAuthor;
  readonly files: readonly CommitFile[];
}

// Carries the upstream status and body for server-side logging only; the
// handler maps this to a generic 502 so GitHub responses never reach clients.
export class GithubApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(message);
    this.name = "GithubApiError";
  }
}

// The token is a decrypted SecureString read once per container and held in
// module scope. It is never logged, and never included in any response.
const ssm = new SSMClient({});
let cachedToken: string | undefined;

async function getToken(parameterName: string): Promise<string> {
  if (cachedToken !== undefined) {
    return cachedToken;
  }
  const response = await ssm.send(
    new GetParameterCommand({ Name: parameterName, WithDecryption: true }),
  );
  const value = response.Parameter?.Value;
  if (value === undefined || value.length === 0) {
    throw new GithubApiError("github token parameter is empty", 500, "missing token");
  }
  cachedToken = value;
  return value;
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

interface GhFetchOptions {
  readonly method?: string;
  readonly body?: string;
  readonly accept?: string;
  readonly contentType?: string;
}

async function ghFetch(
  ctx: GithubContext,
  path: string,
  options: GhFetchOptions = {},
): Promise<Response> {
  const token = await getToken(ctx.tokenParam);
  const headers: Record<string, string> = {
    accept: options.accept ?? "application/vnd.github+json",
    authorization: `Bearer ${token}`,
    "user-agent": "joshh-io-admin",
    "x-github-api-version": "2022-11-28",
  };
  if (options.contentType !== undefined) {
    headers["content-type"] = options.contentType;
  }
  return fetch(`${GITHUB_API}${path}`, {
    method: options.method,
    body: options.body,
    headers,
  });
}

async function ghJson<T>(
  ctx: GithubContext,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await ghFetch(ctx, path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    contentType: body === undefined ? undefined : "application/json",
  });
  if (!response.ok) {
    const detail = await safeText(response);
    logger.error("github request failed", { method, path, status: response.status });
    throw new GithubApiError(`github ${method} ${path} failed`, response.status, detail);
  }
  return (await response.json()) as T;
}

export async function getRawFile(ctx: GithubContext, path: string): Promise<string> {
  const response = await ghFetch(
    ctx,
    `/repos/${ctx.repo}/contents/${path}?ref=${encodeURIComponent(ctx.branch)}`,
    { accept: "application/vnd.github.raw+json" },
  );
  if (!response.ok) {
    const detail = await safeText(response);
    logger.error("github raw fetch failed", { path, status: response.status });
    throw new GithubApiError(`github raw fetch ${path} failed`, response.status, detail);
  }
  return response.text();
}

interface RefResponse {
  readonly object: { readonly sha: string };
}
interface CommitLookupResponse {
  readonly tree: { readonly sha: string };
}
interface ShaResponse {
  readonly sha: string;
}

export async function commitFiles(ctx: GithubContext, request: CommitRequest): Promise<string> {
  const ref = await ghJson<RefResponse>(
    ctx,
    "GET",
    `/repos/${ctx.repo}/git/ref/heads/${ctx.branch}`,
  );
  const baseSha = ref.object.sha;
  const baseCommit = await ghJson<CommitLookupResponse>(
    ctx,
    "GET",
    `/repos/${ctx.repo}/git/commits/${baseSha}`,
  );

  const tree: { path: string; mode: "100644"; type: "blob"; sha: string }[] = [];
  for (const file of request.files) {
    const blob = await ghJson<ShaResponse>(ctx, "POST", `/repos/${ctx.repo}/git/blobs`, {
      content: file.content,
      encoding: file.encoding,
    });
    tree.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const newTree = await ghJson<ShaResponse>(ctx, "POST", `/repos/${ctx.repo}/git/trees`, {
    base_tree: baseCommit.tree.sha,
    tree,
  });
  const commit = await ghJson<ShaResponse>(ctx, "POST", `/repos/${ctx.repo}/git/commits`, {
    message: request.message,
    tree: newTree.sha,
    parents: [baseSha],
    author: request.author,
  });
  await ghJson<ShaResponse>(ctx, "PATCH", `/repos/${ctx.repo}/git/refs/heads/${ctx.branch}`, {
    sha: commit.sha,
    force: false,
  });
  return commit.sha;
}
