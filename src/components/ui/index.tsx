import { useId, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";

/** Renders a bilingual string in the current language. */
export function T({ c }: { c: L }) {
  const { t } = useLang();
  return <>{t(c)}</>;
}

/**
 * One exit on the road through the page. The heading is a green highway sign
 * whose exit number is the section's place in the sequence: the page really
 * is a drive, from your building to the AWS service at the far end.
 */
export function Section({
  id,
  exit,
  title,
  lead,
  children,
}: {
  id: string;
  exit: string;
  title: L;
  lead: L;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-14 sm:py-20">
      <div className="sign inline-flex max-w-full items-stretch overflow-hidden">
        <span className="flex items-center bg-[var(--sign-ink)] px-3 py-2 text-sm font-black text-[var(--sign)] [border-radius:7px_0_0_7px] m-[5px] mr-0 sm:px-4 sm:text-base">
          <span className="sr-only">{t({ en: "Exit", ja: "出口" })} </span>
          <span aria-hidden="true">{t({ en: "EXIT", ja: "出口" })}&nbsp;</span>
          {exit}
        </span>
        <h2
          id={`${id}-title`}
          className="px-4 py-3 text-2xl font-extrabold tracking-tight sm:px-5 sm:text-3xl"
        >
          {t(title)}
        </h2>
      </div>
      <p className="mt-5 max-w-3xl text-lg text-[var(--muted)]">{t(lead)}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export type Tone = "info" | "warn" | "bad" | "ok";
const TONE: Record<Tone, string> = {
  info: "var(--r-vpn)",
  warn: "var(--lane)",
  bad: "var(--bad)",
  ok: "var(--ok)",
};

/** A roadside notice. Yellow-and-black for traps, like a real warning sign. */
export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title?: L;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <div
      className="panel border-l-[6px] px-4 py-3 text-[0.95rem]"
      style={{ borderLeftColor: TONE[tone] }}
    >
      {title && <p className="mb-1 font-bold">{t(title)}</p>}
      <div className="text-[var(--ink)]">{children}</div>
    </div>
  );
}

/** A route shield: the badge each path wears on the map and in every section. */
export function Shield({
  label,
  color,
  size = "md",
}: {
  label: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const s = {
    sm: "h-6 min-w-6 px-1.5 text-[0.7rem]",
    md: "h-8 min-w-8 px-2 text-sm",
    lg: "h-12 min-w-12 px-3 text-lg",
  }[size];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md border-2 border-[var(--paper)] font-black leading-none text-white outline-2 ${s}`}
      style={{ background: color, outlineColor: color, outlineStyle: "solid" }}
    >
      {label}
    </span>
  );
}

export interface SegOption<K extends string> {
  id: K;
  label: L;
}

/**
 * A segmented control with radio semantics and arrow-key movement, used by
 * every lab to switch scenarios.
 */
export function Segmented<K extends string>({
  label,
  options,
  value,
  onChange,
  color = "var(--sign)",
}: {
  label: L;
  options: SegOption<K>[];
  value: K;
  onChange: (k: K) => void;
  color?: string;
}) {
  const { t } = useLang();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    onChange(options[n].id);
    refs.current[n]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={t(label)}
      className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-[var(--line)] bg-[var(--paper-2)] p-1"
    >
      {options.map((o, i) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.id)}
            onKeyDown={(e) => onKey(e, i)}
            className="rounded-lg px-3 py-1.5 text-sm font-bold transition-colors"
            style={on ? { background: color, color: "#fff" } : { color: "var(--muted)" }}
          >
            {t(o.label)}
          </button>
        );
      })}
    </div>
  );
}

/** A labelled on/off switch. */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: L;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useLang();
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold"
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: checked ? "var(--sign)" : "var(--asphalt-2)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(20px)" : "none" }}
        />
      </button>
      {t(label)}
    </label>
  );
}

/** Links to the research note behind a section, plus the primary sources. */
export function Sources({
  doc,
  links,
}: {
  doc: string;
  links: { label: string; url: string }[];
}) {
  const { t } = useLang();
  return (
    <details className="mt-8 text-sm text-[var(--muted)]">
      <summary className="cursor-pointer font-semibold">
        {t({ en: "Sources and research notes", ja: "出典と調査メモ" })}
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          <a
            className="underline"
            href={`https://github.com/0-draft/on-ramp/blob/main/docs/${doc}`}
          >
            docs/{doc}
          </a>
        </li>
        {links.map((l) => (
          <li key={l.url}>
            <a className="underline" href={l.url}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** A small key/value fact with a big value, for spec strips. */
export function Spec({ k, v, color }: { k: L; v: L; color?: string }) {
  const { t } = useLang();
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-[var(--muted)]">{t(k)}</dt>
      <dd className="mt-0.5 font-bold" style={color ? { color } : undefined}>
        {t(v)}
      </dd>
    </div>
  );
}
