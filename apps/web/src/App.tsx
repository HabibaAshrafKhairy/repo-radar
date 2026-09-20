import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import { ThemeProvider, type PaletteMode } from "@mui/material/styles";
import { Suspense, lazy, useMemo, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@repo-radar/core";
import { AppShell, getTheme } from "@repo-radar/ui";
import { ErrorBoundary } from "./ErrorBoundary";
import { SearchPage } from "./pages/SearchPage";

// Lazy-loaded: this page pulls in @repo-radar/charts (MUI X Charts), the heaviest dependency in
// the app, so keeping it out of the initial bundle means the Search tab — what most sessions
// start on — loads without paying for a chart library it doesn't use yet.
const TrackedReposPage = lazy(() =>
  import("./pages/TrackedReposPage").then((module) => ({ default: module.TrackedReposPage })),
);

type View = "search" | "tracked";

const THEME_MODE_STORAGE_KEY = "repo-radar-theme-mode";

function loadStoredThemeMode(): PaletteMode {
  if (typeof localStorage === "undefined") return "light";
  return localStorage.getItem(THEME_MODE_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function AppContent({ mode, onToggleMode }: { mode: PaletteMode; onToggleMode: () => void }) {
  const [view, setView] = useState<View>("search");

  return (
    <AppShell
      title="Repo Radar"
      subtitle="Search GitHub repositories, track your favorites, and watch their stats live."
      actions={
        <Tooltip title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
          <IconButton onClick={onToggleMode} aria-label="Toggle dark mode">
            {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Tooltip>
      }
      tabs={
        <Tabs value={view} onChange={(_event, next: View) => setView(next)} textColor="primary" indicatorColor="primary">
          <Tab value="search" label="Search" sx={{ fontWeight: 600 }} />
          <Tab value="tracked" label="Tracked Repos" sx={{ fontWeight: 600 }} />
        </Tabs>
      }
    >
      {view === "search" ? (
        <SearchPage />
      ) : (
        <Suspense fallback={<CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />}>
          <TrackedReposPage />
        </Suspense>
      )}
    </AppShell>
  );
}

/** Top-level providers: Redux store, then the shared MUI theme, then a render-error safety net. */
export function App() {
  const [mode, setMode] = useState<PaletteMode>(loadStoredThemeMode);
  const theme = useMemo(() => getTheme(mode), [mode]);

  function handleToggleMode() {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_MODE_STORAGE_KEY, next);
      return next;
    });
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AppContent mode={mode} onToggleMode={handleToggleMode} />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}
