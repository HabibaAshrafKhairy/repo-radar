import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

/** Centered "nothing here yet" placeholder — reused for empty search, no results, and no tracked repos. */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 8, color: "text.secondary", textAlign: "center" }}>
      {icon}
      <Typography variant="subtitle1" color="text.primary" fontWeight={600}>
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
    </Stack>
  );
}
