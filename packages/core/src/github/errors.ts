/** Thrown for any non-2xx response from the GitHub REST API. */
export class GitHubApiError extends Error {
  readonly status: number;
  readonly rateLimitRemaining: number | null;
  readonly rateLimitResetAt: Date | null;

  constructor(message: string, status: number, headers?: Headers) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;

    const remaining = headers?.get("x-ratelimit-remaining");
    const reset = headers?.get("x-ratelimit-reset");
    this.rateLimitRemaining = remaining !== null && remaining !== undefined ? Number(remaining) : null;
    this.rateLimitResetAt = reset ? new Date(Number(reset) * 1000) : null;
  }

  get isRateLimited(): boolean {
    return this.status === 403 && this.rateLimitRemaining === 0;
  }
}

/** Maps any thrown value to a user-friendly message. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof GitHubApiError) {
    if (error.isRateLimited) {
      const resetTime = error.rateLimitResetAt?.toLocaleTimeString() ?? "soon";
      return `GitHub API rate limit exceeded. Resets at ${resetTime}.`;
    }
    if (error.status === 404) {
      return "Repository not found.";
    }
    if (error.status === 422) {
      return "Invalid search query.";
    }
    return error.message || "GitHub API request failed.";
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Request was cancelled.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
}
