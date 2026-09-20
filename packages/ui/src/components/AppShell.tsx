import RadarRoundedIcon from "@mui/icons-material/RadarRounded";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
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

/** Shared page frame: top app bar (with room for nav tabs) + centered, responsive content container. */
export function AppShell({ title, subtitle, tabs, actions, children }: AppShellProps) {
  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Toolbar sx={{ flexDirection: "column", alignItems: "stretch", gap: 1.5, py: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.12 : 0.2),
                color: "primary.main",
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
              }}
            >
              <RadarRoundedIcon />
            </Avatar>
            <Stack spacing={0} flex={1} minWidth={0}>
              <Typography variant="h6" fontWeight={700} color="text.primary" lineHeight={1.2} noWrap>
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {subtitle}
                </Typography>
              )}
            </Stack>
            <Box flexShrink={0}>{actions}</Box>
          </Stack>
          {tabs}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </>
  );
}

