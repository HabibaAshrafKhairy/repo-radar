import { describe, expect, it } from "vitest";
import type { GitHubRepoSummary } from "../types";
import reducer, { selectIsTracked, selectTrackedRepos, track, untrack, type TrackedReposState } from "./trackedReposSlice";

function makeRepo(overrides: Partial<GitHubRepoSummary> = {}): GitHubRepoSummary {
  return {
    id: 1,
    name: "react",
    fullName: "facebook/react",
    owner: { login: "facebook", avatarUrl: "https://example.com/a.png" },
    description: null,
    htmlUrl: "https://github.com/facebook/react",
    stargazersCount: 100,
    openIssuesCount: 5,
    language: "JavaScript",
    pushedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("trackedReposSlice", () => {
  it("adds a repo when tracked", () => {
    const state = reducer({ trackedRepos: [] }, track(makeRepo()));
    expect(state.trackedRepos).toHaveLength(1);
    expect(state.trackedRepos[0]).toMatchObject({ id: 1, fullName: "facebook/react" });
  });

  it("does not add a duplicate when the same repo is tracked twice", () => {
    const once = reducer({ trackedRepos: [] }, track(makeRepo()));
    const twice = reducer(once, track(makeRepo()));
    expect(twice.trackedRepos).toHaveLength(1);
  });

  it("removes a repo when untracked", () => {
    const tracked = reducer({ trackedRepos: [] }, track(makeRepo()));
    const untracked = reducer(tracked, untrack(1));
    expect(untracked.trackedRepos).toHaveLength(0);
  });

  it("untracking an id that isn't tracked is a no-op", () => {
    const state: TrackedReposState = { trackedRepos: [] };
    expect(reducer(state, untrack(999)).trackedRepos).toHaveLength(0);
  });

  it("selectTrackedRepos/selectIsTracked read from the trackedRepos slice", () => {
    const state = { trackedRepos: reducer({ trackedRepos: [] }, track(makeRepo())) };
    expect(selectTrackedRepos(state)).toHaveLength(1);
    expect(selectIsTracked(1)(state)).toBe(true);
    expect(selectIsTracked(2)(state)).toBe(false);
  });
});
