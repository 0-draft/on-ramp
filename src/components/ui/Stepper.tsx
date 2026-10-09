import type { KeyboardEvent, ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";

/**
 * Step-through control for any flow (a packet's hops, a DNS lookup). Discrete
 * steps with a caption beat a smooth animation for learning, so every flow on
 * the site is walked with Back / Next (or the arrow keys) instead of autoplay.
 */
export function Stepper({
  steps,
  index,
  onChange,
  color = "var(--ink)",
  children,
}: {
  steps: L[];
  index: number;
  onChange: (i: number) => void;
  color?: string;
  children?: ReactNode;
}) {
  const { t } = useLang();
  const last = steps.length - 1;
  const go = (i: number) => onChange(Math.max(0, Math.min(last, i)));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };
  return (
    <div onKeyDown={onKey}>
      {children}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-bold disabled:opacity-40"
        >
          {t({ en: "Back", ja: "戻る" })}
        </button>
        <button
          type="button"
          onClick={() => go(index === last ? 0 : index + 1)}
          className="rounded-lg px-3 py-1.5 text-sm font-bold text-[var(--on-color)]"
          style={{ background: color }}
        >
          {index === last
            ? t({ en: "Start over", ja: "最初から" })
            : t({ en: "Next", ja: "次へ" })}
        </button>
        <span className="text-sm font-semibold text-[var(--muted)]">
          {index + 1} / {steps.length}
        </span>
      </div>
      <p className="mt-2 min-h-[3em] font-semibold" aria-live="polite">
        <span
          className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-black text-[var(--on-color)]"
          style={{ background: color }}
        >
          {index + 1}
        </span>
        {t(steps[index])}
      </p>
    </div>
  );
}
