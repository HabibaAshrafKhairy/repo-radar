import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { githubApi } from "../store/githubApi";
import { useGitHubSearch } from "./useGitHubSearch";

function createWrapper() {
  const store = configureStore({
    reducer: { [githubApi.reducerPath]: githubApi.reducer },
    middleware: (getDefault) => getDefault().concat(githubApi.middleware),
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

function rawRepo(name: string) {
  return {
    id: name.length + 1,
    name,
    full_name: `owner/${name}`,
    owner: { login: "owner", avatar_url: "https://example.com/a.png" },
    description: null,
    html_url: `https://github.com/owner/${name}`,
    stargazers_count: 1,
    open_issues_count: 0,
    language: null,
    pushed_at: "2024-01-01T00:00:00Z",
  };
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("useGitHubSearch", () => {
  let resolveSecondSearch: (() => void) | undefined;

  beforeEach(() => {
    // Real timers here (not vi.useFakeTimers): the debounce delay just needs to actually elapse,
    // and mixing fake timers with the multi-hop microtask chain below (fetch -> json -> RTK
    // Query's own processing -> React re-render) is fragile to get exactly right.
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        const query = new URL(url).searchParams.get("q");
        if (query === "y") {
          return new Promise<Response>((resolve) => {
            resolveSecondSearch = () => resolve(jsonResponse({ total_count: 1, items: [rawRepo("y")] }));
          });
        }
        return Promise.resolve(jsonResponse({ total_count: 1, items: [rawRepo(String(query))] }));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resolveSecondSearch = undefined;
  });

  it("never shows a previous search term's results while a new term is still resolving", async () => {
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(({ query }) => useGitHubSearch(query, 50), {
      wrapper,
      initialProps: { query: "x" },
    });

    // Let "x"'s debounce settle and its (immediately-resolving) request complete.
    await waitFor(() => expect(result.current.results.map((repo) => repo.name)).toEqual(["x"]));

    // Start a new search for "y" — its request is deliberately left unresolved.
    rerender({ query: "y" });
    await new Promise((resolve) => setTimeout(resolve, 100));

    // "y"'s request is in flight but hasn't resolved yet — this must not still show "x"'s results
    // (the bug this test guards against), and should report itself as pending, not "no results".
    expect(result.current.results).toEqual([]);
    expect(result.current.isPending).toBe(true);

    act(() => resolveSecondSearch?.());

    await waitFor(() => expect(result.current.results.map((repo) => repo.name)).toEqual(["y"]));
    expect(result.current.isPending).toBe(false);
  });
});
