/**
 * Domain types shared across the whole app. Field names are normalized
 * (camelCase) from GitHub's REST API responses in `github/mappers.ts`.
 */

export interface RepoOwner {
  login: string;
  avatarUrl: string;
}

/** A repository as returned by the GitHub search endpoint. */
export interface GitHubRepoSummary {
  id: number;
  name: string;
  fullName: string;
  owner: RepoOwner;
  description: string | null;
  htmlUrl: string;
  stargazersCount: number;
  openIssuesCount: number;
  language: string | null;
  pushedAt: string;
}

/** The subset of a repo the user has chosen to track, persisted to localStorage. */
export interface TrackedRepo {
  id: number;
  name: string;
  fullName: string;
  owner: RepoOwner;
  htmlUrl: string;
  addedAt: string;
}

/** Latest fetched stats for a tracked repo (never persisted, always live). */
export interface RepoStats {
  id: number;
  stargazersCount: number;
  openIssuesCount: number;
  lastCommitDate: string | null;
  fetchedAt: string;
}
