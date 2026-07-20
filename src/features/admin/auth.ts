import type { AdminConfig } from "./config";

// Cognito hosted-UI authorization-code flow with PKCE, implemented against the
// Web Crypto and Fetch APIs only — no Amplify/Cognito SDK dependency. Tokens
// and the in-flight PKCE material live in sessionStorage so a reload survives
// the redirect round-trip but a closed tab does not.

const UNRESERVED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const SCOPE = "openid email";

const STORAGE = {
  idToken: "admin.idToken",
  accessToken: "admin.accessToken",
  expiresAt: "admin.expiresAt",
  verifier: "admin.pkce.verifier",
  state: "admin.pkce.state",
} as const;

export interface AuthorizeParams {
  state: string;
  challenge: string;
  redirectUri: string;
}

export interface ExchangeParams {
  code: string;
  verifier: string;
  redirectUri: string;
}

interface TokenResponse {
  id_token: string;
  access_token: string;
  expires_in: number;
  token_type: string;
}

/** The redirect URI is always this exact origin-relative admin path. */
export function redirectUri(): string {
  return `${window.location.origin}/admin`;
}

/**
 * RFC 7636 code verifier: an unbiased random string of `length` characters
 * (43–128) drawn from the unreserved alphabet, using rejection sampling over
 * crypto.getRandomValues so no character is over-represented.
 */
export function generateVerifier(length = 64): string {
  if (length < 43 || length > 128) {
    throw new RangeError("PKCE verifier length must be between 43 and 128 characters");
  }
  const ceiling = 256 - (256 % UNRESERVED.length);
  const out: string[] = [];
  while (out.length < length) {
    const bytes = new Uint8Array(length - out.length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= ceiling) continue; // reject to avoid modulo bias
      out.push(UNRESERVED[byte % UNRESERVED.length]!);
      if (out.length === length) break;
    }
  }
  return out.join("");
}

function base64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** SHA-256 the verifier and base64url-encode it (no padding) → S256 challenge. */
export async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(digest);
}

export function buildAuthorizeUrl(config: AdminConfig, params: AuthorizeParams): string {
  const url = new URL("/oauth2/authorize", config.hostedUiDomain);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: params.redirectUri,
    scope: SCOPE,
    state: params.state,
    code_challenge: params.challenge,
    code_challenge_method: "S256",
  }).toString();
  return url.toString();
}

export async function exchangeCode(config: AdminConfig, params: ExchangeParams): Promise<void> {
  const response = await fetch(`${config.hostedUiDomain}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.verifier,
    }).toString(),
  });
  if (!response.ok) {
    throw new Error(`Token exchange failed (${String(response.status)})`);
  }
  const token = (await response.json()) as TokenResponse;
  storeTokens(token.id_token, token.access_token, token.expires_in);
}

function storeTokens(idToken: string, accessToken: string, expiresIn: number): void {
  const expiresAt = Date.now() + expiresIn * 1000;
  sessionStorage.setItem(STORAGE.idToken, idToken);
  sessionStorage.setItem(STORAGE.accessToken, accessToken);
  sessionStorage.setItem(STORAGE.expiresAt, String(expiresAt));
}

export function getIdToken(): string | null {
  return sessionStorage.getItem(STORAGE.idToken);
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(STORAGE.accessToken);
}

export function isAuthenticated(): boolean {
  const idToken = getIdToken();
  const expiresAt = Number(sessionStorage.getItem(STORAGE.expiresAt) ?? 0);
  return Boolean(idToken) && Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

/** Stash the in-flight PKCE verifier + CSRF state before redirecting out. */
export function storePkce(verifier: string, state: string): void {
  sessionStorage.setItem(STORAGE.verifier, verifier);
  sessionStorage.setItem(STORAGE.state, state);
}

export function readPkce(): { verifier: string | null; state: string | null } {
  return {
    verifier: sessionStorage.getItem(STORAGE.verifier),
    state: sessionStorage.getItem(STORAGE.state),
  };
}

export function clearPkce(): void {
  sessionStorage.removeItem(STORAGE.verifier);
  sessionStorage.removeItem(STORAGE.state);
}

export function clearTokens(): void {
  sessionStorage.removeItem(STORAGE.idToken);
  sessionStorage.removeItem(STORAGE.accessToken);
  sessionStorage.removeItem(STORAGE.expiresAt);
}

export function logout(config: AdminConfig): void {
  clearTokens();
  clearPkce();
  const url = new URL("/logout", config.hostedUiDomain);
  url.search = new URLSearchParams({
    client_id: config.clientId,
    logout_uri: redirectUri(),
  }).toString();
  window.location.assign(url.toString());
}
