import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchRepoStats, searchRepositories, type SearchReposResult } from "../github/api";
import { toErrorMessage } from "../github/errors";
import type { RepoStats, TrackedRepo } from "../types";

export type TrackedRepoRef = Pick<TrackedRepo, "id" | "fullName">;

export interface SearchRepositoriesArgs {
  query: string;
  page: number;
}

/**
 * The GitHub data layer, built with RTK Query.
 *
 * Each `builder.query` below becomes an auto-generated React hook (see the exports at the
 * bottom) that gives components `{ data, isLoading, isFetching, isError, error, refetch }`
 * for free — no manual `useState`/`useEffect`, no manual AbortController plumbing (RTK Query
 * passes us `signal` and aborts it automatically when the component unmounts or the argument
 * changes), and results are cached per-argument, so e.g. two tracked repos have fully
 * independent loading/error state.
 *
 * We don't use `fetchBaseQuery` (the usual "just hit this REST endpoint" helper) because
 * `github/api.ts` already has typed request/mapping/error logic we want to reuse as-is —
 * `queryFn` lets each endpoint just call that code directly.
 */
export const githubApi = createApi({
  reducerPath: "githubApi",
  baseQuery: fakeBaseQuery<string>(),
  tagTypes: ["RepoStats"],
  endpoints: (builder) => ({
    searchRepositories: builder.query<SearchReposResult, SearchRepositoriesArgs>({
      queryFn: async ({ query, page }, { signal }) => {
        try {
          const result = await searchRepositories(query, page, signal);
          return { data: result };
        } catch (error) {
          return { error: toErrorMessage(error) };
        }
      },
      // Cache one entry per search *query* (page is left out of the cache key) and merge each
      // page's items into it — RTK Query's built-in pattern for "load more"/infinite lists.
      serializeQueryArgs: ({ queryArgs }) => queryArgs.query,
      merge: (currentCache, newData, { arg }) => {
        if (arg.page === 1) {
          return newData;
        }
        currentCache.items.push(...newData.items);
        currentCache.totalCount = newData.totalCount;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),

    getRepoStats: builder.query<RepoStats, TrackedRepoRef>({
      queryFn: async ({ id, fullName }, { signal }) => {
        try {
          const stats = await fetchRepoStats(id, fullName, signal);
          return { data: stats };
        } catch (error) {
          return { error: toErrorMessage(error) };
        }
      },
      // Tags let us invalidate one repo's cached stats (or all of them, for "refresh all")
      // from outside the component that originally fetched them.
      providesTags: (_result, _error, repo) => [{ type: "RepoStats", id: repo.id }],
    }),
  }),
});

export const { useSearchRepositoriesQuery, useGetRepoStatsQuery } = githubApi;

/** Dispatch this to force-refetch stats for one or more tracked repos (e.g. a "Refresh all" button). */
export function invalidateRepoStats(repoIds: number[]) {

  return githubApi.util.invalidateTags(repoIds.map((id) => ({ type: "RepoStats" as const, id })));
}
