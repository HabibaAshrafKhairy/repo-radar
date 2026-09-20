# Repo Radar

A dashboard for searching GitHub repositories, tracking favorites, and monitoring their live stats — built as a pnpm monorepo with React 19, TypeScript, Redux Toolkit (+ RTK Query), and MUI.

## Live demo

- App: https://repo-radar-khairy.vercel.app
- Repo: https://github.com/HabibaAshrafKhairy/repo-radar

## Features

- Debounced GitHub repository search (via the public `api.github.com` REST API), with "Load more" pagination
- Track / untrack repositories, persisted to `localStorage`
- Tracked Repos view showing stars, open issues, and last commit date per repo
- Filter tracked repos by name, and sort by stars / open issues / last commit / date added — synced to the URL (`?filter=...&sort=...&order=...`), so a filtered/sorted view is shareable and survives a refresh
- Refresh an individual repo's stats, or all of them at once
- Independent loading/error state per repo
- Bar chart of stars per tracked repository (capped to the top 10 by star count for readability)
- Real routes (`/search`, `/tracked`) via React Router — each view is a bookmarkable URL with working browser back/forward, not just in-memory tab state
- Light/dark mode toggle, persisted to `localStorage`
- Top-level error boundary so a render error doesn't blank the whole app

## Tech stack

- **React 19 + TypeScript**
- **Redux Toolkit** for app state, **RTK Query** for all GitHub data-fetching (search + per-repo stats) — auto-generated hooks, per-argument caching, cancellation, and cache invalidation, in place of hand-rolled `useEffect`/`fetch` calls
- **React Router** for routing, with sort/filter state synced to the URL via `useSearchParams`
- **MUI (Material UI)** for components/theming, **MUI X Charts** for the bar chart
- **Vite** for the app build/dev server
- **pnpm workspaces** monorepo (no build orchestrator like Turborepo — kept intentionally simple for a project this size; `pnpm -r`/`pnpm --filter` already handle dependency-aware recursive commands)
- **Vercel** for deployment

## Monorepo structure

```
apps/
  web/                # The deployed app (Vite + React). Composes pages from the packages below.
packages/
  core/                # Framework-agnostic domain layer: GitHub API client, types, Redux store,
                        # RTK Query API slice, Redux slices, hooks. No UI/MUI dependency.
  ui/                   # Shared, reusable MUI components (SearchInput, RepoResultCard,
                        # TrackedRepoCard, AppShell, EmptyState) + the shared theme.
  charts/               # The stars bar chart, isolated in its own package. Deliberately has
                        # zero dependency on `core` — it only knows about generic
                        # `{ id, label, value }` data, so it's reusable outside this domain too.
```

Each package is consumed by `apps/web` directly from TypeScript source (via `workspace:*` dependencies) — there's no separate build step per package; Vite compiles everything together when building the app.

## Getting started

Prerequisites: Node 20+, pnpm (`corepack enable` will pick up the version pinned in `package.json`).

```bash
pnpm install

# optional: raise the GitHub API rate limit from 60/hour to 5,000/hour
cp apps/web/.env.example apps/web/.env
# then edit apps/web/.env and set VITE_GITHUB_TOKEN to a GitHub personal access token
# (no scopes/permissions needed — it's only used for read-only public data)

pnpm dev       # starts the Vite dev server (apps/web) at http://localhost:5173
```

Other scripts (run from the repo root):

```bash
pnpm build       # production build of apps/web
pnpm typecheck   # tsc --noEmit across every package
pnpm lint        # eslint across every package
pnpm test        # vitest across every package that has tests
pnpm format      # prettier --write
```

## Testing

`packages/core` has a Vitest suite (`pnpm --filter @repo-radar/core run test`, or `pnpm test` from the root) covering the state/data layer directly — the part of the codebase most of the real bugs during development turned up in:

- `github/mappers.test.ts`, `github/errors.test.ts` — pure-function tests for GitHub response mapping and error-message formatting.
- `store/trackedReposSlice.test.ts` — the track/untrack reducer, including the dedupe-on-track behavior.
- `hooks/useDebouncedValue.test.tsx` — confirms the timer actually resets per keystroke instead of firing once per change.
- `hooks/useGitHubSearch.test.tsx` — a regression test (with a real Redux store + a controllable fake `fetch`) for the exact bug hit during development: a new search term's results must never show the *previous* term's data while its own request is still in flight.

`packages/ui`, `packages/charts`, and `apps/web` don't have tests yet — a reasonable next step, not covered here.

## Architecture & technical decisions

**State/data layer.** `packages/core` holds all state: a `trackedRepos` Redux slice (plain `createSlice`, persisted to `localStorage` via a `store.subscribe` listener) for the user's tracked list, and an RTK Query API slice (`githubApi`) for everything that comes from the network (search results, per-repo stats). RTK Query was chosen over hand-written thunks because it's part of Redux Toolkit itself (no extra dependency, satisfies "Redux Toolkit" as the state library) while giving React-Query-style ergonomics: auto-generated hooks, automatic request cancellation, and — critically for this task — **per-argument caching**, which is what makes "independent loading/error state per tracked repo" and "refresh individual repo vs. refresh all" both fall out of the library instead of needing custom bookkeeping.

- Search pagination uses RTK Query's documented `serializeQueryArgs` + `merge` pattern: the cache key is the search term only (page is excluded), and each additional page's results are merged into that one cache entry — this is what powers the "Load more" button.
- "Refresh all" dispatches `githubApi.util.invalidateTags(...)` for every tracked repo's `RepoStats` tag; every currently-mounted card refetches itself in response — no manual loop over components needed.

**Separation of concerns.** `packages/core` has no MUI/React-component dependency — it's pure state/data/types, importable by any UI. `packages/ui` has no knowledge of Redux — its components take data and callbacks as props (`RepoResultCard`, `AppShell`, `EmptyState`) or call `core`'s hooks directly where that's the more natural pattern (`TrackedRepoCard` calls `useGetRepoStatsQuery` itself, since "fetch and display this repo's stats" is really one concern, not two). `packages/charts` doesn't know what a "repo" is at all — it takes generic `{ id, label, value }` rows, so it isn't coupled to this domain.

**Chart.** `@mui/x-charts` (MUI's own charting library) was used to match the "MUI" requirement. It's a horizontal bar chart (not vertical) specifically so long repository names get a full-width row instead of being rotated/clipped. Star counts across a user's tracked repos can vary by orders of magnitude, so exact values are shown via hover tooltip rather than printed on every bar (in-bar labels collide once bars get very short relative to the largest one). The chart caps to the top 10 repos by stars for readability once a lot of repos are tracked; all tracked repos remain visible as cards below regardless. The left margin is measured from the actual rendered tick-label width (`getBBox()`) rather than estimated from character count, so long repo names never render partially off-canvas.

**Routing & URL-synced state.** `/search` and `/tracked` are real routes (React Router's `BrowserRouter`/`Routes`), not just in-memory tab state — each is bookmarkable and browser back/forward works. On the Tracked Repos page, the filter text and sort key/direction live in the URL (via `useSearchParams`) instead of local component state, so a specific filtered/sorted view can be shared as a link or survive a refresh. `vercel.json`'s catch-all rewrite to `index.html` is what makes deep-linking directly to `/tracked?...` work in production.

**Code-splitting.** The Tracked Repos route (and therefore `@mui/x-charts`, the heaviest dependency) is lazy-loaded via `React.lazy`/`Suspense`, so the Search route — what most sessions start on — doesn't pay for the chart library until it's actually needed.

**Theming.** `packages/ui`'s theme is a `getTheme(mode)` function rather than a fixed object, so light and dark variants share the same design tokens (colors, shape, typography) and only differ in palette/background. The toggle in the header persists the choice to `localStorage`.

**Deployment.** `vercel.json` builds only `apps/web` (`pnpm --filter web run build`) and serves `apps/web/dist`, with a catch-all rewrite to `index.html` for client-side routing.

## Assumptions & limitations

- No authentication/user accounts — tracked repos are stored per-browser in `localStorage`, not synced across devices.
- Unauthenticated GitHub API access is capped at 60 requests/hour; each tracked repo needs 2 requests (repo info + latest commit), so tracking more than ~25–30 repos without a `VITE_GITHUB_TOKEN` configured will hit that limit. Setting a token (see Getting Started) raises this to 5,000/hour.
- The stars chart shows at most the top 10 tracked repos by star count; this is a deliberate readability trade-off, not a bug — all tracked repos are still visible as cards.
- Search results are capped by the same 60/hour (or 5,000/hour with a token) API budget; GitHub's search endpoint itself also caps at 1,000 results per query regardless of pagination.
- The Tracked Repos filter matches on name only (not language/description) — extending it would mean persisting more of each repo's metadata at track-time.
- Test coverage is limited to `packages/core`'s state/data layer (see Testing above); `ui`, `charts`, and `apps/web` don't have tests yet.
