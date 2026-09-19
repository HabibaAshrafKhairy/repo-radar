import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/StarBorderRounded";
import BugReportIcon from "@mui/icons-material/BugReportOutlined";
import CommitIcon from "@mui/icons-material/HistoryToggleOffRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { useGetRepoStatsQuery, type RepoStats, type TrackedRepo } from "@repo-radar/core";

export interface TrackedRepoCardProps {
  repo: TrackedRepo;
  onUntrack: (id: number) => void;
  /** Reports this repo's latest fetched stats up to a parent (e.g. to feed the stars bar chart). */
  onStatsChange?: (id: number, stats: RepoStats | undefined) => void;
}

/**
 * A tracked repo's card. Calls `useGetRepoStatsQuery` itself (rather than receiving stats as a
 * prop) so every card has fully independent loading/error/refresh state, straight from RTK
 * Query's per-argument cache — exactly what the task asks for.
 */
export function TrackedRepoCard({ repo, onUntrack, onStatsChange }: TrackedRepoCardProps) {
  const { data: stats, isLoading, isFetching, isError, error, refetch } = useGetRepoStatsQuery({
    id: repo.id,
    fullName: repo.fullName,
  });

  useEffect(() => {
    onStatsChange?.(repo.id, stats);
  }, [repo.id, stats, onStatsChange]);

  return (
    <Card id={`tracked-repo-${repo.id}`}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.5} minWidth={0}>
            <Typography variant="subtitle1" component="a" href={repo.htmlUrl} target="_blank" rel="noreferrer">
              {repo.fullName}
            </Typography>
            {isLoading && <Skeleton width={180} />}
            {isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={() => refetch()}>
                    Retry
                  </Button>
                }
              >
                {typeof error === "string" ? error : (error?.message ?? "Something went wrong.")}
              </Alert>
            )}
            {stats && (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip size="small" icon={<StarIcon />} label={`${stats.stargazersCount.toLocaleString()} stars`} />
                <Chip
                  size="small"
                  icon={<BugReportIcon />}
                  label={`${stats.openIssuesCount.toLocaleString()} open issues`}
                />
                <Chip
                  size="small"
                  icon={<CommitIcon />}
                  label={
                    stats.lastCommitDate
                      ? `Last commit ${new Date(stats.lastCommitDate).toLocaleDateString()}`
                      : "No commits yet"
                  }
                />
              </Stack>
            )}
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  onClick={() => refetch()}
                  disabled={isFetching}
                  size="small"
                  aria-label={`Refresh stats for ${repo.fullName}`}
                >
                  {isFetching ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
            <Button
              size="small"
              color="inherit"
              onClick={() => onUntrack(repo.id)}
              aria-label={`Untrack ${repo.fullName}`}
            >
              Untrack
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
