import raw from "../../content/admin-config.json";

// Cognito hosted-UI + admin API configuration. Real values are written into
// src/content/admin-config.json after the auth/api stacks deploy; until then
// every field reads PENDING_DEPLOY and the admin renders a not-configured state.
export interface AdminConfig {
  /** Cognito hosted-UI origin, e.g. https://joshh-admin.auth.us-east-1.amazoncognito.com */
  hostedUiDomain: string;
  /** Cognito app client id (public SPA client, no secret). */
  clientId: string;
  /** Admin API origin, e.g. https://api.joshh.io */
  apiBase: string;
}

export const PENDING = "PENDING_DEPLOY";

export const adminConfig: AdminConfig = raw;

export function isConfigured(config: AdminConfig = adminConfig): boolean {
  return [config.hostedUiDomain, config.clientId, config.apiBase].every(
    (value) => typeof value === "string" && value.length > 0 && value !== PENDING,
  );
}
