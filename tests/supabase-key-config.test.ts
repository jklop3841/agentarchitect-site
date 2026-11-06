import { afterEach, describe, expect, it, vi } from "vitest";
import { getServiceConfig } from "@/lib/agents/store";

afterEach(() => vi.unstubAllEnvs());

describe("Supabase backend key compatibility", () => {
  it("prefers the new secret key over a legacy service role key", () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co/");
    vi.stubEnv("SUPABASE_SECRET_KEY", "sb_secret_test_only");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy_test_only");
    expect(getServiceConfig()).toEqual({
      url: "https://example.supabase.co",
      key: "sb_secret_test_only",
    });
  });

  it("retains support for legacy service role deployments", () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy_test_only");
    expect(getServiceConfig()?.key).toBe("legacy_test_only");
  });

  it("fails closed if no backend secret exists", () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(getServiceConfig()).toBeNull();
  });
});
