import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";

/**
 * Predict-then-reveal. The reader commits to an answer before the
 * explanation appears, which is what makes the rule stick. `resetKey`
 * re-arms the question when the scenario changes.
 *
 * Pass the lab as `children` and it sits directly under the question, dimmed
 * and inert until the reader answers or chooses to skip, so the lab can never
 * give the answer away first.
 */
export function Predict({
  question,
  options,
  answer,
  why,
  resetKey,
  onPick,
  children,
}: {
  question: L;
  options: { id: string; label: L }[];
  answer: string;
  why: ReactNode;
  resetKey?: string;
  onPick?: (id: string, right: boolean) => void;
  children?: ReactNode;
}) {
  const { t } = useLang();
  const result = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState<{ key?: string; id: string } | null>(null);
  const [skipped, setSkipped] = useState(false);
  const picked = pick && pick.key === resetKey ? pick.id : null;
  const right = picked === answer;
  const locked = children !== undefined && picked === null && !skipped;
  return (
    <div className="flex flex-col gap-4">
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
                  onPick?.(o.id, o.id === answer);
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
      {children !== undefined && (
        <div className="relative">
          <div
            // inert keeps the hidden lab out of the tab order and away from
            // screen readers until it is unlocked.
            inert={locked}
            aria-hidden={locked || undefined}
            className={
              locked ? "pointer-events-none opacity-25 blur-[2px] select-none" : ""
            }
          >
            {children}
          </div>
          {locked && (
            <div className="absolute inset-x-0 top-6 flex justify-center">
              <div className="panel flex flex-wrap items-center gap-3 px-4 py-3 shadow-lg">
                <span className="font-bold">
                  {t({
                    en: "Answer the question first",
                    ja: "先に上の質問に答えてください",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => setSkipped(true)}
                  className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm font-bold"
                >
                  {t({ en: "Skip and show the lab", ja: "スキップしてラボを見る" })}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
