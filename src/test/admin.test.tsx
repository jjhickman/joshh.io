import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { codeChallenge, generateVerifier } from "../features/admin/auth";
import * as adminConfig from "../features/admin/config";
import AdminPage from "../pages/admin/AdminPage";

const UNRESERVED = /^[A-Za-z0-9\-._~]+$/;

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("admin PKCE helpers", () => {
  it("generates RFC 7636-compliant verifiers across many generations", () => {
    for (let i = 0; i < 1000; i += 1) {
      const verifier = generateVerifier();
      expect(verifier.length).toBeGreaterThanOrEqual(43);
      expect(verifier.length).toBeLessThanOrEqual(128);
      expect(verifier).toMatch(UNRESERVED);
    }
    expect(generateVerifier(43)).toHaveLength(43);
    expect(generateVerifier(128)).toHaveLength(128);
    expect(() => generateVerifier(42)).toThrow(RangeError);
    expect(() => generateVerifier(129)).toThrow(RangeError);
  });

  it("derives the RFC 7636 appendix B S256 challenge", async () => {
    await expect(codeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).resolves.toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });
});

describe("admin page states", () => {
  it("renders the not-configured state and performs zero fetches with placeholder config", async () => {
    // The committed config now carries real deployment values, so the
    // placeholder scenario is simulated rather than read from disk.
    vi.spyOn(adminConfig, "isConfigured").mockReturnValue(false);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AdminPage />);
    expect(
      await screen.findByRole("heading", { name: /admin not configured yet/i }),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders a sign-in control when configured but unauthenticated, with zero fetches", async () => {
    vi.spyOn(adminConfig, "isConfigured").mockReturnValue(true);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AdminPage />);
    expect(
      await screen.findByRole("button", { name: /sign in with cognito/i }),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
