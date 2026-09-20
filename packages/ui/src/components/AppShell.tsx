import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export interface AppShellProps {
  title: string;
  subtitle?: string;
  tabs?: ReactNode;
  /** Rendered top-right of the header, e.g. a dark-mode toggle. */
  actions?: ReactNode;
  children: ReactNode;
}

/** Shared page frame: top app bar (with room for nav tabs) + centered content container. */
export function AppShell({ title, subtitle, tabs, actions, children }: AppShellProps) {
  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Toolbar sx={{ flexDirection: "column", alignItems: "stretch", gap: 1.5, py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>🔭</Avatar>
            <Stack spacing={0} flex={1}>
              <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.2}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Stack>
            {actions}
          </Stack>
          {tabs}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {children}
      </Container>
    </>
  );
}

