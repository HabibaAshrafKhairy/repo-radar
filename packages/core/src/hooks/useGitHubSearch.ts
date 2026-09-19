import { useState } from "react";
import type { GitHubRepoSummary } from "../types";
import { useSearchRepositoriesQuery } from "../store/githubApi";
import { useDebouncedValue } from "./useDebouncedValue";

export interface UseGitHubSearchResult {
  /** Never stale: empty while the debounce is pending or the box is empty, never a previous term's results. */
  results: GitHubRepoSummary[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: string | undefined;
  /** The debounce timer is still running for the latest keystroke — a search *will* fire, just hasn't yet. */
  isPending: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Debounced, paginated GitHub repository search.
 *
 * Wraps the auto-generated `useSearchRepositoriesQuery` hook (from `store/githubApi.ts`), and
 * owns every piece of state that has to change *together* when the search term changes:
 * the committed (debounced) term, the current page, and whether results are safe to show yet.
 *
 * This all lives in one hook (rather than split between a debounce hook and page-level state)
 * because keeping it split previously caused a real bug: resetting `page` back to 1 in a
 * `useEffect` keyed on the debounced term runs one render *after* that term changes, so the
 * very first request for a brand-new search term could still go out with a leftover page
 * number from the previous search (e.g. after "Load more" was clicked). Here, the reset happens
 * synchronously *during* render — React's documented pattern for "resetting state when a value
 * changes" — so `page` can never be inconsistent with the term it's paired with.
 */
export function useGitHubSearch(rawQuery: string, debounceMs = 400): UseGitHubSearchResult {
  const trimmedQuery = rawQuery.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, debounceMs);

  const [page, setPage] = useState(1);
  const [committedQuery, setCommittedQuery] = useState(debouncedQuery);

  if (debouncedQuery !== committedQuery) {
    setCommittedQuery(debouncedQuery);
    setPage(1);
  }

  const { data, isLoading, isFetching, isError, error } = useSearchRepositoriesQuery(
    { query: committedQuery, page },
    { skip: committedQuery.length === 0 },
  );

  // While the debounce timer is still running for the latest keystroke, `committedQuery` (and
  // therefore `data`) still belongs to the *previous* search term — this is what previously let
  // that term's results flash on screen while typing a new one.
  const isPending = trimmedQuery.length > 0 && trimmedQuery !== committedQuery;

  // `data` (and its `totalCount`) can still be RTK Query's cache from a *previous* search even
  // once `committedQuery` is empty or a new one is pending (`skip` stops fetching, it doesn't
  // clear the cache) — so every derived value must share this same gate, not repeat it, to avoid
  // exactly the kind of mismatch that let a stale "Load more" button linger with an empty query.
  const canShowData = committedQuery.length > 0 && !isPending;
  const results = canShowData ? (data?.items ?? []) : [];
  const hasMore = canShowData && data ? results.length < data.totalCount : false;

  return {
    results,
    isLoading,
    isFetching,
    isError,
    error: typeof error === "string" ? error : error?.message,
    isPending,
    hasMore,
    loadMore: () => setPage((prev) => prev + 1),
  };
}
