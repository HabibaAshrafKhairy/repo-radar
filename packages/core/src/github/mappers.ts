import type { GitHubRepoSummary } from "../types";

/** Raw shape (partial) of a repository object returned by the GitHub REST API. */
export interface RawGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  html_url: string;
  stargazers_count: number;
  open_issues_count: number;
  language: string | null;
  pushed_at: string;
}

export function mapRepo(raw: RawGitHubRepo): GitHubRepoSummary {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    owner: { login: raw.owner.login, avatarUrl: raw.owner.avatar_url },
    description: raw.description,
    htmlUrl: raw.html_url,
    stargazersCount: raw.stargazers_count,
    openIssuesCount: raw.open_issues_count,
    language: raw.language,
    pushedAt: raw.pushed_at,
  };
}
