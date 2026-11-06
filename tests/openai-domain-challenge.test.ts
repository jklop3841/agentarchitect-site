import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/.well-known/openai-apps-challenge/route";

afterEach(() => vi.unstubAllEnvs());

describe("OpenAI Plugin domain challenge", () => {
  it("is unavailable without the server-only token", async () => {
    vi.stubEnv("OPENAI_APPS_CHALLENGE_TOKEN", "");
    const response = await GET();
    expect(response.status).toBe(404);
  });

  it("returns exactly the authorized token as plaintext", async () => {
    vi.stubEnv("OPENAI_APPS_CHALLENGE_TOKEN", "verified-challenge-example");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toMatch(/text\/plain/);
    expect(await response.text()).toBe("verified-challenge-example");
  });

  it("rejects multiline token injection", async () => {
    vi.stubEnv("OPENAI_APPS_CHALLENGE_TOKEN", "first\nsecond");
    expect((await GET()).status).toBe(404);
  });
});
