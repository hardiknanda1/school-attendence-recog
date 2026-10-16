"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * The current year. The server renders `fallback` (computed in a cached
 * server function); the browser then shows its own current year, so the
 * copyright stays correct even if the static page was built earlier.
 */
export function CurrentYear({ fallback }: { fallback: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => fallback,
  );
  return <>{year}</>;
}
