import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { z } from "zod";
// The shared content schemas live in the frontend package; esbuild bundles them
// across the package boundary at build time, and zod is already an infra
// dependency, so the admin API validates edits against the exact same rules the
// site and admin UI use.
import { collectionSchemas, photosSchema, type PhotoEntry } from "../../../src/content/schemas.js";
import { commitFiles, getRawFile, GithubApiError, type GithubContext } from "./github.js";
import { logger } from "./logger.js";

const COLLECTIONS = ["shows", "photos", "videos", "releases"] as const;
type Collection = (typeof COLLECTIONS)[number];

const DATA_PATH = "src/content/data";
const GALLERY_PATH = "src/assets/images/gallery";
const COMMIT_AUTHOR = { name: "joshh.io admin", email: "admin@joshh.io" } as const;
// Decoded image ceiling; oversized uploads are rejected before any GitHub call.
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

// Validated once at cold start; a missing value fails the container fast rather
// than surfacing an opaque runtime error on the first request.
const env = z
  .object({
    GITHUB_REPO: z.string().min(1),
    GITHUB_BRANCH: z.string().min(1),
    GITHUB_TOKEN_PARAM: z.string().min(1),
  })
  .parse(process.env);

const ctx: GithubContext = {
  repo: env.GITHUB_REPO,
  branch: env.GITHUB_BRANCH,
  tokenParam: env.GITHUB_TOKEN_PARAM,
};

// Client-facing failures with an explicit status; the message is always one we
// authored, never upstream text.
class HttpError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const photoRequestSchema = z.object({
  fileName: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]*\.(?:jpe?g|png|webp)$/, "must be a jpg, png, or webp file name"),
  contentBase64: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(1),
  caption: z.string().optional(),
  credit: z.string().optional(),
});

function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function isCollection(value: string | undefined): value is Collection {
  return value !== undefined && (COLLECTIONS as readonly string[]).includes(value);
}

// Single-argument view over the discriminated schema map, so callers get one
// callable `safeParse` instead of the union of four.
function schemaFor(collection: Collection): z.ZodType<unknown> {
  return collectionSchemas[collection];
}

function summarizeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
}

function readJsonBody(event: APIGatewayProxyEventV2): unknown {
  if (event.body === undefined || event.body.length === 0) {
    throw new HttpError(400, "request body is required");
  }
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf-8")
    : event.body;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new HttpError(400, "request body must be valid JSON");
  }
}

function requireCollection(event: APIGatewayProxyEventV2): Collection {
  const collection = event.pathParameters?.collection;
  if (!isCollection(collection)) {
    throw new HttpError(404, "unknown collection");
  }
  return collection;
}

async function getContent(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const collection = requireCollection(event);
  const raw = await getRawFile(ctx, `${DATA_PATH}/${collection}.json`);
  const data: unknown = JSON.parse(raw);
  return json(200, { ok: true, data });
}

async function putContent(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const collection = requireCollection(event);
  const body = readJsonBody(event) as { data?: unknown; message?: unknown };
  const result = schemaFor(collection).safeParse(body.data);
  if (!result.success) {
    throw new HttpError(400, summarizeIssues(result.error));
  }
  const message =
    typeof body.message === "string" && body.message.trim().length > 0
      ? body.message
      : `Update ${collection} via admin`;
  const serialized = `${JSON.stringify(result.data, null, 2)}\n`;
  const commitSha = await commitFiles(ctx, {
    message,
    author: COMMIT_AUTHOR,
    files: [{ path: `${DATA_PATH}/${collection}.json`, content: serialized, encoding: "utf-8" }],
  });
  return json(200, { ok: true, commitSha });
}

async function postPhoto(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
  const parsed = photoRequestSchema.safeParse(readJsonBody(event));
  if (!parsed.success) {
    throw new HttpError(400, summarizeIssues(parsed.error));
  }
  const { fileName, contentBase64, width, height, alt, caption, credit } = parsed.data;

  const decoded = Buffer.from(contentBase64, "base64");
  if (decoded.byteLength > MAX_PHOTO_BYTES) {
    throw new HttpError(413, "image exceeds the 8 MB limit");
  }

  const currentRaw = await getRawFile(ctx, `${DATA_PATH}/photos.json`);
  const current = photosSchema.safeParse(JSON.parse(currentRaw));
  if (!current.success) {
    logger.error("photos.json failed validation", { issues: summarizeIssues(current.error) });
    throw new GithubApiError("photos.json is not valid", 500, "invalid repository state");
  }
  if (current.data.some((entry) => entry.file === fileName)) {
    throw new HttpError(409, "a photo with that file name already exists");
  }

  const entry: PhotoEntry = { file: fileName, alt, width, height };
  if (caption !== undefined) {
    entry.caption = caption;
  }
  if (credit !== undefined) {
    entry.credit = credit;
  }

  const next = photosSchema.safeParse([...current.data, entry]);
  if (!next.success) {
    throw new HttpError(400, summarizeIssues(next.error));
  }

  const commitSha = await commitFiles(ctx, {
    message: `Add ${fileName} to photos via admin`,
    author: COMMIT_AUTHOR,
    files: [
      { path: `${GALLERY_PATH}/${fileName}`, content: contentBase64, encoding: "base64" },
      {
        path: `${DATA_PATH}/photos.json`,
        content: `${JSON.stringify(next.data, null, 2)}\n`,
        encoding: "utf-8",
      },
    ],
  });
  return json(200, { ok: true, commitSha });
}

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    switch (event.routeKey) {
      case "GET /content/{collection}":
        return await getContent(event);
      case "PUT /content/{collection}":
        return await putContent(event);
      case "POST /photos":
        return await postPhoto(event);
      default:
        return json(404, { ok: false, error: "not found" });
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return json(error.statusCode, { ok: false, error: error.message });
    }
    if (error instanceof GithubApiError) {
      logger.error("github operation failed", { status: error.status });
      return json(502, { ok: false, error: "git operation failed" });
    }
    logger.error("unhandled error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return json(500, { ok: false, error: "internal error" });
  }
};
