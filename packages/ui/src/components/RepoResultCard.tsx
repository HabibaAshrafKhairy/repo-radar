import StarIcon from "@mui/icons-material/StarBorderRounded";
import BugReportIcon from "@mui/icons-material/BugReportOutlined";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
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
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
          alignItems={{ xs: "stretch", sm: "flex-start" }}
        >
          <Stack direction="row" spacing={2} flex={1} minWidth={0}>
            <Avatar src={repo.owner.avatarUrl} alt={repo.owner.login} sx={{ width: 44, height: 44 }} />
            <Stack flex={1} spacing={0.5} minWidth={0}>
              <Link
                href={repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                variant="subtitle1"
                color="text.primary"
                fontWeight={600}
                sx={{ "&:hover": { color: "primary.main" } }}
              >
                {repo.fullName}
              </Link>
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
          </Stack>
          <Button
            variant={isTracked ? "outlined" : "contained"}
            color={isTracked ? "inherit" : "primary"}
            onClick={() => onToggleTrack(repo)}
            sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "flex-start" } }}
          >
            {isTracked ? "Untrack" : "Track"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
