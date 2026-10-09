import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";

/**
 * Predict-then-reveal. The reader commits to an answer before the
 * explanation appears, which is what makes the rule stick. `resetKey`
 * re-arms the question when the scenario changes.
 */
export function Predict({
  question,
  options,
  answer,
  why,
  resetKey,
}: {
  question: L;
  options: { id: string; label: L }[];
  answer: string;
  why: ReactNode;
  resetKey?: string;
}) {
  const { t } = useLang();
  const result = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState<{ key?: string; id: string } | null>(null);
  const picked = pick && pick.key === resetKey ? pick.id : null;
  const right = picked === answer;
  return (
    <div className="panel p-4">
      <p className="font-bold">{t(question)}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const state =
            picked === null
              ? ""
              : o.id === answer
                ? "answer"
                : o.id === picked
                  ? "wrong"
                  : "";
          return (
            <button
              key={o.id}
              type="button"
              aria-disabled={picked !== null}
              aria-pressed={picked === o.id}
              onClick={() => {
                if (picked !== null) return;
                setPick({ key: resetKey, id: o.id });
                // Move focus to the explanation so keyboard and screen-reader
                // users land on the answer.
                requestAnimationFrame(() => result.current?.focus());
              }}
              className="min-h-10 rounded-lg border-2 px-3 py-1.5 text-sm font-bold aria-disabled:cursor-default"
              style={{
                borderColor:
                  state === "answer"
                    ? "var(--ok)"
                    : state === "wrong"
                      ? "var(--bad)"
                      : "var(--line)",
                background: state === "answer" ? "var(--ok)" : undefined,
                color: state === "answer" ? "var(--on-color)" : undefined,
              }}
            >
              {t(o.label)}
            </button>
          );
        })}
      </div>
      {/* The live region stays mounted; only its content changes. */}
      <div ref={result} tabIndex={-1} className="outline-none" aria-live="polite">
        {picked !== null && (
          <div className="mt-3">
            <p
              className="font-bold"
              style={{ color: right ? "var(--ok)" : "var(--bad)" }}
            >
              {right
                ? t({ en: "Right.", ja: "正解。" })
                : t({ en: "Not quite.", ja: "残念。" })}
            </p>
            <div className="mt-1">{why}</div>
            <button
              type="button"
              onClick={() => {
                setPick(null);
                requestAnimationFrame(() =>
                  result.current?.parentElement?.querySelector("button")?.focus(),
                );
              }}
              className="mt-2 text-sm font-semibold underline"
            >
              {t({ en: "Try again", ja: "もう一度" })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
