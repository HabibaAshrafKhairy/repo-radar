import type { GitHubRepoSummary, RepoStats } from "../types";
import { GitHubApiError } from "./errors";
import { mapRepo, type RawGitHubRepo } from "./mappers";

const BASE_URL = "https://api.github.com";

let githubToken: string | undefined;

/** Configure an optional personal access token to raise the API rate limit. */
export function setGitHubToken(token: string | undefined): void {
  githubToken = token;
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }
  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...buildHeaders(), ...init?.headers },
  });

  if (!response.ok) {
    throw new GitHubApiError(`GitHub API request failed (${response.status})`, response.status, response.headers);
  }

  return (await response.json()) as T;
}

export interface SearchReposResult {
  totalCount: number;
  items: GitHubRepoSummary[];
}

export async function searchRepositories(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<SearchReposResult> {
  const params = new URLSearchParams({ q: query, per_page: "20", page: String(page) });
  const data = await request<{ total_count: number; items: RawGitHubRepo[] }>(
    `/search/repositories?${params.toString()}`,
    { signal },
  );
  return { totalCount: data.total_count, items: data.items.map(mapRepo) };
}

export async function getRepository(fullName: string, signal?: AbortSignal): Promise<GitHubRepoSummary> {
  const data = await request<RawGitHubRepo>(`/repos/${fullName}`, { signal });
  return mapRepo(data);
}

/** Returns the ISO date of the most recent commit on the repo's default branch. */
export async function getLatestCommitDate(fullName: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const commits = await request<Array<{ commit: { committer: { date: string } | null } }>>(
      `/repos/${fullName}/commits?per_page=1`,
      { signal },
    );
    return commits[0]?.commit.committer?.date ?? null;
  } catch (error) {
    // 409 = repository is empty (no commits yet); treat as "no commit" rather than an error.
    if (error instanceof GitHubApiError && error.status === 409) {
      return null;
    }
    throw error;
  }
}

/** Fetches the two data points needed for the dashboard in parallel. */
export async function fetchRepoStats(id: number, fullName: string, signal?: AbortSignal): Promise<RepoStats> {
  const [repo, lastCommitDate] = await Promise.all([
    getRepository(fullName, signal),
    getLatestCommitDate(fullName, signal),
  ]);
  return {
    id,
    stargazersCount: repo.stargazersCount,
    openIssuesCount: repo.openIssuesCount,
    lastCommitDate,
    fetchedAt: new Date().toISOString(),
  };
}
