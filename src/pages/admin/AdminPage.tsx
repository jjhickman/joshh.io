import { useEffect, useState } from "react";
import { CollectionEditor } from "../../features/admin/CollectionEditor";
import { PhotoUploader } from "../../features/admin/PhotoUploader";
import {
  buildAuthorizeUrl,
  clearPkce,
  codeChallenge,
  exchangeCode,
  generateVerifier,
  isAuthenticated,
  logout,
  readPkce,
  redirectUri,
  storePkce,
} from "../../features/admin/auth";
import { adminConfig, isConfigured } from "../../features/admin/config";
import { collectionDefs, editableCollections } from "../../features/admin/fields";
import type { CollectionName } from "../../content/schemas";

type Phase = "loading" | "anon" | "authed" | "error";

const tabs: readonly CollectionName[] = [...editableCollections, "photos"];

function cleanUrl(): void {
  window.history.replaceState({}, "", `${window.location.origin}/admin`);
}

function AdminMeta() {
  return (
    <>
      <title>Admin — joshh.io</title>
      <meta name="robots" content="noindex" />
    </>
  );
}

export default function AdminPage() {
  const configured = isConfigured();
  const [phase, setPhase] = useState<Phase>("loading");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<CollectionName>("shows");

  useEffect(() => {
    if (!configured) return;
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    const code = params.get("code");
    const returnedState = params.get("state");

    if (oauthError) {
      setAuthError(params.get("error_description") ?? oauthError);
      setPhase("error");
      clearPkce();
      cleanUrl();
      return;
    }

    if (code) {
      const { verifier, state } = readPkce();
      if (!verifier || !state || state !== returnedState) {
        setAuthError("Sign-in could not be verified. Please try again.");
        setPhase("error");
        clearPkce();
        cleanUrl();
        return;
      }
      const complete = async () => {
        try {
          await exchangeCode(adminConfig, { code, verifier, redirectUri: redirectUri() });
          clearPkce();
          cleanUrl();
          setPhase("authed");
        } catch (cause) {
          setAuthError(cause instanceof Error ? cause.message : "Sign-in failed.");
          setPhase("error");
          clearPkce();
          cleanUrl();
        }
      };
      void complete();
      return;
    }

    setPhase(isAuthenticated() ? "authed" : "anon");
  }, [configured]);

  if (!configured) {
    return (
      <div className="admin-page">
        <AdminMeta />
        <section className="admin-shell">
          <p className="eyebrow">Admin</p>
          <h1>Admin not configured yet</h1>
          <p className="admin-note">
            The admin endpoints have not been deployed. Once the Cognito and API values are written
            into admin-config.json, this page will enable sign-in.
          </p>
        </section>
      </div>
    );
  }

  if (phase === "authed") {
    return (
      <div className="admin-page">
        <AdminMeta />
        <section className="admin-shell admin-dashboard">
          <header className="admin-topbar">
            <div>
              <p className="eyebrow">Admin</p>
              <h1>Content</h1>
            </div>
            <button type="button" className="admin-button-quiet" onClick={() => logout(adminConfig)}>
              Sign out
            </button>
          </header>
          <nav className="admin-tabs" aria-label="Content collections">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className="admin-tab"
                aria-current={activeTab === tab ? "page" : undefined}
                onClick={() => setActiveTab(tab)}
              >
                {collectionDefs[tab].label}
              </button>
            ))}
          </nav>
          {activeTab === "photos" ? <PhotoUploader /> : <CollectionEditor collection={activeTab} />}
        </section>
      </div>
    );
  }

  const completingCallback = new URLSearchParams(window.location.search).has("code");

  return (
    <div className="admin-page">
      <AdminMeta />
      <section className="admin-shell">
        <p className="eyebrow">Admin</p>
        <h1>Sign in</h1>
        {completingCallback && phase === "loading" ? (
          <p className="admin-note">Completing sign-in…</p>
        ) : (
          <p className="admin-note">Authenticate with Cognito to manage site content.</p>
        )}
        <button type="button" className="admin-button" onClick={() => void startSignIn(setAuthError)}>
          Sign in with Cognito
        </button>
        {authError ? (
          <p className="admin-note admin-error" role="alert">
            {authError}
          </p>
        ) : null}
      </section>
    </div>
  );
}

async function startSignIn(onError: (message: string) => void): Promise<void> {
  try {
    const verifier = generateVerifier();
    const challenge = await codeChallenge(verifier);
    const state = generateVerifier(43);
    storePkce(verifier, state);
    window.location.assign(buildAuthorizeUrl(adminConfig, { state, challenge, redirectUri: redirectUri() }));
  } catch (cause) {
    onError(cause instanceof Error ? cause.message : "Could not start sign-in.");
  }
}
