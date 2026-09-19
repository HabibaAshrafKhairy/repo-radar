import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { useMemo, useState } from "react";
import {
  track,
  untrack,
  selectTrackedRepos,
  useAppDispatch,
  useAppSelector,
  useGitHubSearch,
  type GitHubRepoSummary,
} from "@repo-radar/core";
import { EmptyState, RepoResultCard, SearchInput } from "@repo-radar/ui";

/** The "Search" tab: debounced GitHub search + track/untrack toggle on each result. */
export function SearchPage() {
  const [query, setQuery] = useState("");
  const { results, isLoading, isFetching, isError, error, isPending, hasMore, loadMore } = useGitHubSearch(query);

  const dispatch = useAppDispatch();
  const trackedRepos = useAppSelector(selectTrackedRepos);
  const trackedIds = useMemo(() => new Set(trackedRepos.map((repo) => repo.id)), [trackedRepos]);

  function handleToggleTrack(repo: GitHubRepoSummary) {
    if (trackedIds.has(repo.id)) {
      dispatch(untrack(repo.id));
    } else {
      dispatch(track(repo));
    }
  }

  const trimmedQuery = query.trim();

  return (
    <Stack spacing={2}>
      <SearchInput value={query} onChange={setQuery} />

      {(isLoading || isPending) && <CircularProgress size={28} sx={{ alignSelf: "center" }} />}

      {isError && <Alert severity="error">{error}</Alert>}

      {trimmedQuery.length === 0 && (
        <EmptyState
          icon={<TravelExploreRoundedIcon sx={{ fontSize: 48 }} />}
          title="Search GitHub repositories"
          description="Try a project or username, e.g. “react” or “facebook/react”."
        />
      )}

      {!isLoading && !isPending && trimmedQuery.length > 0 && results.length === 0 && (
        <EmptyState
          icon={<SearchOffRoundedIcon sx={{ fontSize: 48 }} />}
          title="No repositories found"
          description="Try a different search term."
        />
      )}

      <Stack spacing={1.5}>
        {results.map((repo) => (
          <RepoResultCard
            key={repo.id}
            repo={repo}
            isTracked={trackedIds.has(repo.id)}
            onToggleTrack={handleToggleTrack}
          />
        ))}
      </Stack>

      {hasMore && (
        <Button onClick={loadMore} disabled={isFetching} sx={{ alignSelf: "center" }}>
          {isFetching ? "Loading…" : "Load more"}
        </Button>
      )}
    </Stack>
  );
}
