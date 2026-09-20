import RefreshIcon from "@mui/icons-material/Refresh";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useMemo, useState } from "react";
import {
  invalidateRepoStats,
  selectTrackedRepos,
  untrack,
  useAppDispatch,
  useAppSelector,
  type RepoStats,
} from "@repo-radar/core";
import { EmptyState, TrackedRepoCard } from "@repo-radar/ui";
import { StarsBarChart } from "@repo-radar/charts";

const CHART_MAX_ITEMS = 10;

/** The "Tracked Repos" tab: per-repo cards + a bar chart of stars across all of them. */
export function TrackedReposPage() {
  const dispatch = useAppDispatch();
  const trackedRepos = useAppSelector(selectTrackedRepos);

  // Filled in as each TrackedRepoCard reports its own fetched stats — see onStatsChange below.
  const [statsById, setStatsById] = useState<Record<number, RepoStats | undefined>>({});

  const handleStatsChange = useCallback((id: number, stats: RepoStats | undefined) => {
    setStatsById((prev) => (prev[id] === stats ? prev : { ...prev, [id]: stats }));
  }, []);

  const handleUntrack = useCallback((id: number) => dispatch(untrack(id)), [dispatch]);
  const handleRefreshAll = () => dispatch(invalidateRepoStats(trackedRepos.map((repo) => repo.id)));

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

      <Stack spacing={2}>
        {trackedRepos.map((repo) => (
          <TrackedRepoCard
            key={repo.id}
            repo={repo}
            onUntrack={handleUntrack}
            onStatsChange={handleStatsChange}
          />
        ))}
      </Stack>
    </Stack>
  );
}
