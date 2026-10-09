import { useEffect, useState } from "react";
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
 * The gantry over the road: the site mark, every exit, and the language and
 * theme switches. Exits scroll sideways on narrow screens instead of wrapping.
 */
export function Header() {
  const { lang, setLang, t } = useLang();
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [active, setActive] = useState<string>("");

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

  // Highlight the exit whose section is on screen.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const n of NAV) {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  const nextTheme: Record<Theme, Theme> = {
    system: "dark",
    dark: "light",
    light: "system",
  };
  const themeLabel = {
    system: { en: "Theme: system", ja: "テーマ: 自動" },
    dark: { en: "Theme: night", ja: "テーマ: 夜" },
    light: { en: "Theme: day", ja: "テーマ: 昼" },
  }[theme];

  return (
    <div className="sticky top-0 z-40 border-b-4 border-[var(--lane)] bg-[var(--sign)] text-[var(--sign-ink)] shadow-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
        <a href="#top" className="shrink-0 font-black tracking-tight">
          On-ramp
        </a>
        <nav
          aria-label={t({ en: "Exits", ja: "出口" })}
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]"
        >
          <ol className="flex gap-1 whitespace-nowrap">
            {NAV.map((n, i) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  aria-current={active === n.id ? "location" : undefined}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold hover:bg-[var(--sign-2)] aria-[current=location]:bg-[var(--sign-ink)] aria-[current=location]:text-[var(--sign)]"
                >
                  <span className="text-xs opacity-75">{i + 1}</span>
                  {t(n.label)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <button
          type="button"
          onClick={() => setTheme(nextTheme[theme])}
          className="shrink-0 rounded-md px-2 py-1 text-sm hover:bg-[var(--sign-2)]"
          aria-label={t(themeLabel)}
          title={t(themeLabel)}
        >
          <span aria-hidden="true">
            {theme === "dark" ? "☾" : theme === "light" ? "☀" : "◐"}
          </span>
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
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className="rounded px-2 py-0.5 aria-pressed:bg-[var(--sign-ink)] aria-pressed:text-[var(--sign)]"
            >
              {l === "en" ? "EN" : "日本語"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
