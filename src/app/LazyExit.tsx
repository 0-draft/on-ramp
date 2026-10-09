import { Suspense, lazy, useEffect } from "react";
import type { ComponentType } from "react";
import { NAV } from "@/data/nav";
import { useLang } from "@/i18n/useLang";

type Loader = () => Promise<{ default: ComponentType }>;

/**
 * The data-heavy exits at the end of the drive (quiz, timeline, glossary) load
 * after the page is up. Until then a placeholder keeps the section's id and
 * sign in place, so "#glossary" links and the header still find it.
 */
export function lazyExit(id: string, load: Loader) {
  const Component = lazy(load);
  function LazyExit() {
    const { t } = useLang();
    const label = NAV.find((n) => n.id === id)?.label;
    return (
      <Suspense
        fallback={
          <section id={id} aria-busy="true" className="min-h-[60vh] pt-12 sm:pt-16">
            <h2 className="sign inline-block px-5 py-3 text-xl font-extrabold">
              {label ? t(label) : id}
            </h2>
          </section>
        }
      >
        <Component />
      </Suspense>
    );
  }
  return { Component: LazyExit, preload: load };
}

/** Start fetching the lazy exits once the browser is idle. */
export function usePreload(loaders: Loader[]) {
  useEffect(() => {
    const run = () => loaders.forEach((l) => void l());
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run);
    else setTimeout(run, 1500);
  }, [loaders]);
}
