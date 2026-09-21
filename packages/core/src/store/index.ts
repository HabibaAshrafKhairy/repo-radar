import { configureStore } from "@reduxjs/toolkit";
import { githubApi } from "./githubApi";
import trackedReposReducer, { TRACKED_REPOS_STORAGE_KEY } from "./trackedReposSlice";

export const store = configureStore({
  reducer: {
    trackedRepos: trackedReposReducer,
    [githubApi.reducerPath]: githubApi.reducer,
  },
  // RTK Query's middleware powers caching, and refetch-on-focus/reconnect.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(githubApi.middleware),
});

if (typeof localStorage !== "undefined") {
  store.subscribe(() => {
    const { trackedRepos } = store.getState().trackedRepos;
    try {
      localStorage.setItem(TRACKED_REPOS_STORAGE_KEY, JSON.stringify({ trackedRepos }));
    } catch {
      // localStorage may be unavailable (e.g. private browsing quota) — persistence is best-effort.
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
