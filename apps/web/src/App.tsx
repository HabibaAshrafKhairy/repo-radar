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
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { store } from "@repo-radar/core";
import { AppShell, getTheme } from "@repo-radar/ui";
import { ErrorBoundary } from "./ErrorBoundary";
import { SearchPage } from "./pages/SearchPage";

// Lazy-loaded: this page pulls in @repo-radar/charts (MUI X Charts), the heaviest dependency in
// the app, so keeping it out of the initial bundle means the Search route — what most sessions
// start on — loads without paying for a chart library it doesn't use yet.
const TrackedReposPage = lazy(() =>
  import("./pages/TrackedReposPage").then((module) => ({ default: module.TrackedReposPage })),
);

const THEME_MODE_STORAGE_KEY = "repo-radar-theme-mode";

function loadStoredThemeMode(): PaletteMode {
  if (typeof localStorage === "undefined") return "light";
  return localStorage.getItem(THEME_MODE_STORAGE_KEY) === "dark" ? "dark" : "light";
}

/** Tabs backed by real routes (rather than local state), so each view is a shareable, bookmarkable URL. */
function NavTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.startsWith("/tracked") ? "/tracked" : "/search";

  return (
    <Tabs value={currentTab} onChange={(_event, next: string) => navigate(next)} textColor="primary" indicatorColor="primary">
      <Tab value="/search" label="Search" sx={{ fontWeight: 600 }} />
      <Tab value="/tracked" label="Tracked Repos" sx={{ fontWeight: 600 }} />
    </Tabs>
  );
}

function AppContent({ mode, onToggleMode }: { mode: PaletteMode; onToggleMode: () => void }) {
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
      tabs={<NavTabs />}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/tracked"
          element={
            <Suspense fallback={<CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />}>
              <TrackedReposPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/search" replace />} />
      </Routes>
    </AppShell>
  );
}

/** Top-level providers: Redux store, router, the shared MUI theme, then a render-error safety net. */
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
          <BrowserRouter>
            <AppContent mode={mode} onToggleMode={handleToggleMode} />
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeProvider>

    </Provider>
  );
}
