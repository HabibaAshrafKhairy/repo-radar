import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setGitHubToken } from "@repo-radar/core";
import { App } from "./App";

// Optional: raises the GitHub REST API rate limit from 60/hour to 5,000/hour.
// Copy apps/web/.env.example to apps/web/.env and set VITE_GITHUB_TOKEN to enable it.
setGitHubToken(import.meta.env.VITE_GITHUB_TOKEN);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
