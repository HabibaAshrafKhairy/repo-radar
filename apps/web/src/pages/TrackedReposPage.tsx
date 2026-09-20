import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  invalidateRepoStats,
  selectTrackedRepos,
  untrack,
  useAppDispatch,
  useAppSelector,
  type RepoStats,
  type TrackedRepo,
} from "@repo-radar/core";
import { EmptyState, TrackedRepoCard } from "@repo-radar/ui";
import { StarsBarChart } from "@repo-radar/charts";

const CHART_MAX_ITEMS = 10;

type SortKey = "added" | "stars" | "issues" | "lastCommit";
type SortOrder = "asc" | "desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "added", label: "Date added" },
  { value: "stars", label: "Stars" },
  { value: "issues", label: "Open issues" },
  { value: "lastCommit", label: "Last commit" },
];

function sortValue(repo: TrackedRepo, sort: SortKey, statsById: Record<number, RepoStats | undefined>): number {
  const stats = statsById[repo.id];
  switch (sort) {
    case "stars":
      return stats?.stargazersCount ?? Number.NaN;
    case "issues":
      return stats?.openIssuesCount ?? Number.NaN;
    case "lastCommit":
      return stats?.lastCommitDate ? new Date(stats.lastCommitDate).getTime() : Number.NaN;
    case "added":
      return new Date(repo.addedAt).getTime();
  }
}

/** Sorts by the requested key; repos whose stats haven't loaded yet (NaN) always sink to the bottom. */
function sortRepos(
  repos: TrackedRepo[],
  sort: SortKey,
  order: SortOrder,
  statsById: Record<number, RepoStats | undefined>,
) {
  return [...repos].sort((a, b) => {
    const aValue = sortValue(a, sort, statsById);
    const bValue = sortValue(b, sort, statsById);
    if (Number.isNaN(aValue) && Number.isNaN(bValue)) return 0;
    if (Number.isNaN(aValue)) return 1;
    if (Number.isNaN(bValue)) return -1;
    return order === "asc" ? aValue - bValue : bValue - aValue;
  });
}

/** The "Tracked Repos" tab: filter/sort (synced to the URL) + per-repo cards + a bar chart of stars. */
export function TrackedReposPage() {
  const dispatch = useAppDispatch();
  const trackedRepos = useAppSelector(selectTrackedRepos);
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = searchParams.get("filter") ?? "";
  const sort = (searchParams.get("sort") as SortKey | null) ?? "added";
  const order = (searchParams.get("order") as SortOrder | null) ?? "asc";

  function updateParam(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  }

  // Filled in as each TrackedRepoCard reports its own fetched stats — see onStatsChange below.
  const [statsById, setStatsById] = useState<Record<number, RepoStats | undefined>>({});

  const handleStatsChange = useCallback((id: number, stats: RepoStats | undefined) => {
    setStatsById((prev) => (prev[id] === stats ? prev : { ...prev, [id]: stats }));
  }, []);

  const handleUntrack = useCallback((id: number) => dispatch(untrack(id)), [dispatch]);
  const handleRefreshAll = () => dispatch(invalidateRepoStats(trackedRepos.map((repo) => repo.id)));

  const visibleRepos = useMemo(() => {
    const filtered = filter
      ? trackedRepos.filter((repo) => repo.fullName.toLowerCase().includes(filter.toLowerCase()))
      : trackedRepos;
    return sortRepos(filtered, sort, order, statsById);
  }, [trackedRepos, filter, sort, order, statsById]);

  const chartData = useMemo(
    () =>
      trackedRepos
        .filter((repo) => statsById[repo.id])
        .map((repo) => ({ label: repo.fullName, value: statsById[repo.id]!.stargazersCount })),
    [trackedRepos, statsById],
  );

  if (trackedRepos.length === 0) {
    return (
      <EmptyState
        icon={<BookmarkBorderRoundedIcon sx={{ fontSize: 48 }} />}
        title="No tracked repos yet"
        description='Search for a repository and hit "Track" to start monitoring it here.'
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Tracked repositories ({trackedRepos.length})</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefreshAll}>
          Refresh all
        </Button>
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="subtitle2" color="text.secondary">
          Stars per tracked repository (hover for the exact count
          {chartData.length > CHART_MAX_ITEMS ? `, top ${CHART_MAX_ITEMS} shown` : ""})
        </Typography>
        <StarsBarChart
          data={chartData}
          maxItems={CHART_MAX_ITEMS}
          emptyFallback={<Typography color="text.secondary">Loading stats…</Typography>}
        />
      </Stack>

      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        <TextField
          size="small"
          label="Filter by name"
          value={filter}
          onChange={(event) => updateParam("filter", event.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          size="small"
          select
          label="Sort by"
          value={sort}
          onChange={(event) => updateParam("sort", event.target.value)}
          sx={{ minWidth: 160 }}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Tooltip title={order === "asc" ? "Ascending" : "Descending"}>
          <IconButton
            onClick={() => updateParam("order", order === "asc" ? "desc" : "asc")}
            aria-label="Toggle sort direction"
          >
            {order === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          </IconButton>
        </Tooltip>
      </Stack>

      {visibleRepos.length === 0 ? (
        <EmptyState
          icon={<SearchOffRoundedIcon sx={{ fontSize: 48 }} />}
          title="No matches"
          description="No tracked repos match that filter."
        />
      ) : (
        <Stack spacing={2}>
          {visibleRepos.map((repo) => (
            <TrackedRepoCard key={repo.id} repo={repo} onUntrack={handleUntrack} onStatsChange={handleStatsChange} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
