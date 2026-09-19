import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GitHubRepoSummary, TrackedRepo } from "../types";

export const TRACKED_REPOS_STORAGE_KEY = "repo-radar-tracked-repos";

export interface TrackedReposState {
  trackedRepos: TrackedRepo[];
}

function loadInitialState(): TrackedReposState {
  if (typeof localStorage === "undefined") return { trackedRepos: [] };
  try {
    const raw = localStorage.getItem(TRACKED_REPOS_STORAGE_KEY);
    if (!raw) return { trackedRepos: [] };
    const parsed = JSON.parse(raw) as { trackedRepos?: TrackedRepo[] };
    return { trackedRepos: parsed.trackedRepos ?? [] };
  } catch {
    return { trackedRepos: [] };
  }
}

const trackedReposSlice = createSlice({
  name: "trackedRepos",
  initialState: loadInitialState(),
  reducers: {
    track: (state, action: PayloadAction<GitHubRepoSummary>) => {
      const repo = action.payload;
      if (state.trackedRepos.some((tracked) => tracked.id === repo.id)) return;
      state.trackedRepos.push({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        owner: repo.owner,
        htmlUrl: repo.htmlUrl,
        addedAt: new Date().toISOString(),
      });
    },
    untrack: (state, action: PayloadAction<number>) => {
      state.trackedRepos = state.trackedRepos.filter((repo) => repo.id !== action.payload);
    },
  },
});

export const { track, untrack } = trackedReposSlice.actions;

export const selectTrackedRepos = (state: { trackedRepos: TrackedReposState }): TrackedRepo[] =>
  state.trackedRepos.trackedRepos;

export const selectIsTracked =
  (id: number) =>
  (state: { trackedRepos: TrackedReposState }): boolean =>
    state.trackedRepos.trackedRepos.some((repo) => repo.id === id);

export default trackedReposSlice.reducer;
