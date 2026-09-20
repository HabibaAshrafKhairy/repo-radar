import { describe, expect, it } from "vitest";
import { GitHubApiError, toErrorMessage } from "./errors";

describe("GitHubApiError.isRateLimited", () => {
  it("is true only for a 403 with zero requests remaining", () => {
    const headers = new Headers({ "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1700000000" });
    const error = new GitHubApiError("forbidden", 403, headers);
    expect(error.isRateLimited).toBe(true);
    expect(error.rateLimitResetAt).toEqual(new Date(1700000000 * 1000));
  });

  it("is false when requests remain, even on a 403", () => {
    const headers = new Headers({ "x-ratelimit-remaining": "10" });
    expect(new GitHubApiError("forbidden", 403, headers).isRateLimited).toBe(false);
  });

  it("is false for a non-403 status", () => {
    const headers = new Headers({ "x-ratelimit-remaining": "0" });
    expect(new GitHubApiError("not found", 404, headers).isRateLimited).toBe(false);
  });
});

describe("toErrorMessage", () => {
  it("gives a friendly, reset-time-aware message when rate limited", () => {
    const headers = new Headers({ "x-ratelimit-remaining": "0", "x-ratelimit-reset": "0" });
    expect(toErrorMessage(new GitHubApiError("forbidden", 403, headers))).toMatch(/rate limit/i);
  });

  it("gives a friendly message for a 404", () => {
    expect(toErrorMessage(new GitHubApiError("not found", 404))).toBe("Repository not found.");
  });

  it("gives a friendly message for a 422", () => {
    expect(toErrorMessage(new GitHubApiError("unprocessable", 422))).toBe("Invalid search query.");
  });

  it("falls back to the raw message for other GitHubApiError statuses", () => {
    expect(toErrorMessage(new GitHubApiError("server error", 500))).toBe("server error");
  });

  it("treats a cancelled request (AbortError) as its own friendly message", () => {
    expect(toErrorMessage(new DOMException("aborted", "AbortError"))).toBe("Request was cancelled.");
  });

  it("uses a plain Error's own message", () => {
    expect(toErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("falls back to a generic message for a non-Error value", () => {
    expect(toErrorMessage("just a string")).toBe("Something went wrong.");
  });
});
