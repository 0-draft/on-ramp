import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/useLang";
import { NAV } from "@/data/nav";

type Theme = "system" | "light" | "dark";
const THEME_KEY = "on-ramp:theme";

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

/**
 * Which exit you are at, and how far down the road you are. A section counts
 * as current once its top passes 35% of the viewport; above the first exit
 * (the hero map) nothing is current.
 */
function usePosition(): { active: string; progress: number } {
  const [pos, setPos] = useState({ active: "", progress: 0 });
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let active = "";
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= line) active = n.id;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setPos((p) =>
        p.active === active && Math.abs(p.progress - progress) < 0.002
          ? p
          : { active, progress },
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return pos;
}

/** Sun, moon, or half-and-half for "follow the system", drawn at 20px. */
function ThemeIcon({ theme }: { theme: Theme }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    "aria-hidden": true,
  };
  if (theme === "light")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </svg>
    );
  if (theme === "dark")
    return (
      <svg {...common}>
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" />
    </svg>
  );
}

/**
 * The gantry over the road: the site mark, every exit, the language and theme
 * switches, and a progress stripe in the yellow lane line. On phones the exit
 * strip becomes a "you are here" button that opens the full list.
 */
export function Header() {
  const { lang, setLang, t } = useLang();
  const [theme, setTheme] = useState<Theme>(readTheme);
  const { active, progress } = usePosition();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  // Fade only the edge that has more exits beyond it.
  const [fade, setFade] = useState({ left: false, right: true });
  const updateFade = () => {
    const nav = navRef.current;
    if (!nav) return;
    const left = nav.scrollLeft > 2;
    const right = nav.scrollLeft < nav.scrollWidth - nav.clientWidth - 2;
    setFade((f) => (f.left === left && f.right === right ? f : { left, right }));
  };
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      if (theme === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage blocked: the switch still works for this visit.
    }
  }, [theme]);

  // Keep the current exit centred in the strip. scrollTo on the strip only,
  // because scrollIntoView would also move the page.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav?.scrollTo) return;
    const link = nav.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
    nav.scrollTo({
      left: link ? link.offsetLeft - nav.clientWidth / 2 + link.offsetWidth / 2 : 0,
      behavior: "smooth",
    });
    const id = window.setTimeout(updateFade, 400);
    return () => window.clearTimeout(id);
  }, [active]);

  // Close the phone menu on Escape or a click outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !menuButton.current?.contains(target))
        setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const nextTheme: Record<Theme, Theme> = {
    system: "dark",
    dark: "light",
    light: "system",
  };
  const themeLabel = {
    system: { en: "Theme: auto", ja: "テーマ: 自動" },
    dark: { en: "Theme: night", ja: "テーマ: 夜" },
    light: { en: "Theme: day", ja: "テーマ: 昼" },
  }[theme];

  const idx = NAV.findIndex((n) => n.id === active);
  const current = idx >= 0 ? NAV[idx] : null;

  return (
    <header className="sticky top-0 z-40 bg-[var(--sign)] text-[var(--sign-ink)] shadow-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-1.5 sm:gap-3 sm:px-6">
        <a
          href="#top"
          className="flex min-h-10 shrink-0 items-center gap-1.5 font-black tracking-tight"
          aria-label="On-ramp"
        >
          <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
            <path
              d="M14 56 C14 36 24 28 40 28 H52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M42 16 L54 28 L42 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">On-ramp</span>
        </a>

        {/* Wide screens: every exit, current one centred, edges faded. */}
        <nav
          ref={navRef}
          aria-label={t({ en: "Exits", ja: "出口" })}
          onScroll={updateFade}
          className="hidden min-w-0 flex-1 snap-x overflow-x-auto scroll-px-2 [scrollbar-width:none] sm:block"
          style={{
            maskImage: `linear-gradient(to right, ${fade.left ? "transparent" : "#000"}, #000 3.5rem, #000 calc(100% - 3.5rem), ${fade.right ? "transparent" : "#000"})`,
          }}
        >
          <ol className="flex gap-1 whitespace-nowrap">
            {NAV.map((n, i) => (
              <li key={n.id} className="snap-start">
                <a
                  href={`#${n.id}`}
                  aria-current={active === n.id ? "location" : undefined}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold hover:bg-[var(--sign-2)] aria-[current=location]:bg-[var(--sign-ink)] aria-[current=location]:text-[var(--sign)]"
                >
                  <span className="text-xs">{i + 1}</span>
                  {t(n.label)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Phones: where you are, and a sheet with every exit. */}
        <div className="relative min-w-0 flex-1 sm:hidden">
          <button
            ref={menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="exit-menu"
            onClick={() => setOpen((o) => !o)}
            className="flex min-h-10 w-full min-w-0 items-center gap-2 rounded-md bg-[var(--sign-2)] px-2 text-left text-sm font-bold"
          >
            {current ? (
              <>
                <span className="shrink-0 rounded bg-[var(--sign-ink)] px-1.5 text-xs text-[var(--sign)]">
                  <span className="sr-only">{t({ en: "Exit", ja: "出口" })} </span>
                  {idx + 1}
                </span>
                <span className="truncate">{t(current.label)}</span>
              </>
            ) : (
              <span className="truncate">{t({ en: "All exits", ja: "出口一覧" })}</span>
            )}
            <span aria-hidden="true" className="ml-auto">
              ▾
            </span>
          </button>
          {open && (
            <div
              ref={menuRef}
              id="exit-menu"
              className="fixed inset-x-3 top-14 max-h-[70vh] overflow-y-auto rounded-xl border-2 border-[var(--sign-ink)] bg-[var(--sign)] p-2 shadow-xl"
            >
              <nav aria-label={t({ en: "All exits", ja: "出口一覧" })}>
                <ol className="grid grid-cols-1 gap-1">
                  {NAV.map((n, i) => (
                    <li key={n.id}>
                      <a
                        href={`#${n.id}`}
                        onClick={() => setOpen(false)}
                        aria-current={active === n.id ? "location" : undefined}
                        className="flex min-h-11 items-center gap-3 rounded-md px-2 font-semibold hover:bg-[var(--sign-2)] aria-[current=location]:bg-[var(--sign-ink)] aria-[current=location]:text-[var(--sign)]"
                      >
                        <span className="w-6 text-right text-xs">{i + 1}</span>
                        {t(n.label)}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setTheme(nextTheme[theme])}
          className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md px-2 text-base hover:bg-[var(--sign-2)]"
          aria-label={t(themeLabel)}
          title={t(themeLabel)}
        >
          <ThemeIcon theme={theme} />
        </button>
        <div
          role="group"
          aria-label={t({ en: "Language", ja: "言語" })}
          className="flex shrink-0 rounded-md bg-[var(--sign-2)] p-0.5 text-sm font-bold"
        >
          {(["en", "ja"] as const).map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className="min-h-9 rounded px-2.5 aria-pressed:bg-[var(--sign-ink)] aria-pressed:text-[var(--sign)]"
            >
              {l === "en" ? "EN" : "日本語"}
            </button>
          ))}
        </div>
      </div>
      {/* The yellow lane line doubles as a progress bar. */}
      <div className="h-1 bg-[var(--sign-2)]" aria-hidden="true">
        <div
          className="h-full origin-left bg-[var(--lane)]"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </header>
  );
}
