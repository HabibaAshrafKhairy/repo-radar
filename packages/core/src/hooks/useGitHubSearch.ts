import { useState } from "react";
import type { GitHubRepoSummary } from "../types";
import { useSearchRepositoriesQuery } from "../store/githubApi";
import { useDebouncedValue } from "./useDebouncedValue";

export interface UseGitHubSearchResult {
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

export function useGitHubSearch(
  rawQuery: string,
  debounceMs = 400,
): UseGitHubSearchResult {
  const trimmedQuery = rawQuery.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, debounceMs);

  const [page, setPage] = useState(1);
  const [committedQuery, setCommittedQuery] = useState(debouncedQuery);

  if (debouncedQuery !== committedQuery) {
    setCommittedQuery(debouncedQuery);
    setPage(1);
  }

  const { currentData, isFetching, isError, error } =
    useSearchRepositoriesQuery(
      { query: committedQuery, page },
      { skip: committedQuery.length === 0 },
    );

  // The debounce timer is still running for the latest keystroke — a request *will* fire, just hasn't yet.
  // There is a non-empty query, and it is different from the currently committed query.
  const isDebouncing =
    trimmedQuery.length > 0 && trimmedQuery !== committedQuery;

  // There is a real query, but RTK Query has not supplied data for it yet.
  const isWaitingForResult =
    committedQuery.length > 0 && currentData === undefined;

  //Combines both debounce waiting + request data waiting.
  const isPending = isDebouncing || isWaitingForResult;

  const results =
    committedQuery.length > 0 && !isPending ? (currentData?.items ?? []) : [];
  const hasMore =
    !isPending && currentData ? results.length < currentData.totalCount : false;

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

