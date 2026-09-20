import { describe, expect, it } from "vitest";
import { mapRepo, type RawGitHubRepo } from "./mappers";

describe("mapRepo", () => {
  it("maps GitHub's snake_case fields to the app's camelCase shape", () => {
    const raw: RawGitHubRepo = {
      id: 1,
      name: "react",
      full_name: "facebook/react",
      owner: { login: "facebook", avatar_url: "https://example.com/avatar.png" },
      description: "A JS library",
      html_url: "https://github.com/facebook/react",
      stargazers_count: 200000,
      open_issues_count: 500,
      language: "JavaScript",
      pushed_at: "2024-01-01T00:00:00Z",
    };

    expect(mapRepo(raw)).toEqual({
      id: 1,
      name: "react",
      fullName: "facebook/react",
      owner: { login: "facebook", avatarUrl: "https://example.com/avatar.png" },
      description: "A JS library",
      htmlUrl: "https://github.com/facebook/react",
      stargazersCount: 200000,
      openIssuesCount: 500,
      language: "JavaScript",
      pushedAt: "2024-01-01T00:00:00Z",
    });
  });

  it("preserves null description/language instead of coercing them", () => {
    const raw: RawGitHubRepo = {
      id: 2,
      name: "repo",
      full_name: "owner/repo",
      owner: { login: "owner", avatar_url: "https://example.com/a.png" },
      description: null,
      html_url: "https://github.com/owner/repo",
      stargazers_count: 0,
      open_issues_count: 0,
      language: null,
      pushed_at: "2024-01-01T00:00:00Z",
    };

    const mapped = mapRepo(raw);
    expect(mapped.description).toBeNull();
    expect(mapped.language).toBeNull();
  });
});
