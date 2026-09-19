import StarIcon from "@mui/icons-material/StarBorderRounded";
import BugReportIcon from "@mui/icons-material/BugReportOutlined";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { GitHubRepoSummary } from "@repo-radar/core";

export interface RepoResultCardProps {
  repo: GitHubRepoSummary;
  isTracked: boolean;
  onToggleTrack: (repo: GitHubRepoSummary) => void;
}

/** A single search result row: repo summary + a Track/Untrack toggle. Purely presentational. */
export function RepoResultCard({ repo, isTracked, onToggleTrack }: RepoResultCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar src={repo.owner.avatarUrl} alt={repo.owner.login} sx={{ width: 44, height: 44 }} />
          <Stack flex={1} spacing={0.5} minWidth={0}>
            <Typography variant="subtitle1" component="a" href={repo.htmlUrl} target="_blank" rel="noreferrer">
              {repo.fullName}
            </Typography>
            {repo.description && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {repo.description}
              </Typography>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip size="small" icon={<StarIcon />} label={`${repo.stargazersCount.toLocaleString()} stars`} />
              <Chip size="small" icon={<BugReportIcon />} label={`${repo.openIssuesCount.toLocaleString()} issues`} />
              {repo.language && <Chip size="small" label={repo.language} variant="outlined" />}
            </Stack>
          </Stack>
          <Button
            variant={isTracked ? "outlined" : "contained"}
            color={isTracked ? "inherit" : "primary"}
            onClick={() => onToggleTrack(repo)}
          >
            {isTracked ? "Untrack" : "Track"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
