import CssBaseline from "@mui/material/CssBaseline";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "@repo-radar/core";
import { AppShell, theme } from "@repo-radar/ui";
import { ErrorBoundary } from "./ErrorBoundary";
import { SearchPage } from "./pages/SearchPage";
import { TrackedReposPage } from "./pages/TrackedReposPage";

type View = "search" | "tracked";

function AppContent() {
  const [view, setView] = useState<View>("search");

  return (
    <AppShell
      title="Repo Radar"
      subtitle="Search GitHub repositories, track your favorites, and watch their stats live."
      tabs={
        <Tabs value={view} onChange={(_event, next: View) => setView(next)} textColor="primary" indicatorColor="primary">
          <Tab value="search" label="Search" sx={{ fontWeight: 600 }} />
          <Tab value="tracked" label="Tracked Repos" sx={{ fontWeight: 600 }} />
        </Tabs>
      }
    >
      {view === "search" ? <SearchPage /> : <TrackedReposPage />}
    </AppShell>
  );
}

/** Top-level providers: Redux store, then the shared MUI theme, then a render-error safety net. */
export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}
