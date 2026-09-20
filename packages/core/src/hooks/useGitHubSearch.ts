import { useState } from "react";
import type { GitHubRepoSummary } from "../types";
import { useSearchRepositoriesQuery } from "../store/githubApi";
import { useDebouncedValue } from "./useDebouncedValue";

export interface UseGitHubSearchResult {
  /** Never stale: empty until the current search term's own results have actually arrived. */
  results: GitHubRepoSummary[];
  /**
   * True whenever `results` can't be trusted yet — either the debounce timer is still running
   * for the latest keystroke, or a request is in flight and hasn't resolved. Use this (not
   * RTK Query's `isLoading`) to decide when to show a spinner instead of an empty state — see
   * the comment above `isWaitingForResult` below for why.
   */
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  error: string | undefined;
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

  const { currentData, isFetching, isError, error } = useSearchRepositoriesQuery(
    { query: committedQuery, page },
    { skip: committedQuery.length === 0 },
  );

  // The debounce timer is still running for the latest keystroke — a request *will* fire, just hasn't yet.
  const isDebouncing = trimmedQuery.length > 0 && trimmedQuery !== committedQuery;

  // RTK Query's `currentData` (unlike its plain `data`) is only ever set for the exact arguments
  // just requested above, so "no currentData yet" is, on its own, the correct signal that this
  // arg's result — even a genuinely empty one — hasn't arrived. This also covers a narrower gap
  // than `isDebouncing`: right after the committed term changes, there's one render where RTK
  // Query hasn't dispatched the new request yet, so `isLoading` is still `false` — checking
  // `isLoading` alone (as an earlier version of this hook did) let a "No repositories found"
  // empty state flash during that gap. RTK Query's own docs recommend exactly this check
  // (`isFetching && !currentData`) for this reason; `currentData === undefined` covers it too.
  const isWaitingForResult = committedQuery.length > 0 && currentData === undefined;
  const isPending = isDebouncing || isWaitingForResult;

  const results = committedQuery.length > 0 && !isPending ? (currentData?.items ?? []) : [];
  const hasMore = !isPending && currentData ? results.length < currentData.totalCount : false;

  return {
    results,
    isPending,
    isFetching,
    isError,
    error: typeof error === "string" ? error : error?.message,
    hasMore,
    loadMore: () => setPage((prev) => prev + 1),
  };
}

