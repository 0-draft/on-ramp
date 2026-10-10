import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";

/**
 * Predict-then-reveal. The reader commits to an answer before the
 * explanation appears, which is what makes the rule stick. A wrong pick only
 * says "not quite" and lets the reader try another (or ask for the answer);
 * the explanation appears once the right answer is found or revealed.
 * `resetKey` re-arms the question when the scenario changes.
 *
 * Pass the lab as `children` and it sits directly under the question. It is
 * not rendered until the question is solved or skipped, so it can never give
 * the answer away, and once open it stays open. `after` is copy that would
 * spoil the answer (a takeaway); it appears only once the lab is open.
 */
export function Predict({
  question,
  options,
  answer,
  why,
  resetKey,
  onPick,
  children,
  after,
}: {
  question: L;
  options: { id: string; label: L }[];
  answer: string;
  why: ReactNode;
  resetKey?: string;
  onPick?: (id: string, right: boolean) => void;
  children?: ReactNode;
  after?: ReactNode;
}) {
  const { t } = useLang();
  const result = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState<{
    key?: string;
    wrong: string[];
    solved: boolean;
    firstTry: boolean;
  }>({ key: resetKey, wrong: [], solved: false, firstTry: true });
  // Once the lab is open it stays open: changing the scenario re-arms the
  // question, but never hides the lab the reader is exploring.
  const [opened, setOpened] = useState(false);
  const r =
    round.key === resetKey
      ? round
      : { key: resetKey, wrong: [] as string[], solved: false, firstTry: true };
  const locked = children !== undefined && !opened;

  const solve = (firstTry: boolean) => {
    setRound({ ...r, solved: true, firstTry });
    setOpened(true);
    // Move focus to the explanation so keyboard and screen-reader users land
    // on it.
    requestAnimationFrame(() => result.current?.focus());
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="panel p-4">
        <p className="font-bold">{t(question)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((o) => {
            const isWrong = r.wrong.includes(o.id);
            const isAnswer = r.solved && o.id === answer;
            const done = r.solved || isWrong;
            return (
              <button
                key={o.id}
                type="button"
                aria-disabled={done}
                aria-pressed={isWrong || isAnswer}
                onClick={() => {
                  if (done) return;
                  const right = o.id === answer;
                  onPick?.(o.id, right);
                  if (right) solve(r.wrong.length === 0);
                  else setRound({ ...r, wrong: [...r.wrong, o.id] });
                }}
                className="min-h-10 rounded-lg border-2 px-3 py-1.5 text-sm font-bold aria-disabled:cursor-default"
                style={{
                  borderColor: isAnswer
                    ? "var(--ok)"
                    : isWrong
                      ? "var(--bad)"
                      : "var(--line)",
                  background: isAnswer ? "var(--ok)" : undefined,
                  color: isAnswer
                    ? "var(--on-color)"
                    : isWrong
                      ? "var(--bad)"
                      : undefined,
                  textDecoration: isWrong ? "line-through" : undefined,
                }}
              >
                {t(o.label)}
              </button>
            );
          })}
        </div>
        {/* The live region stays mounted; only its content changes. */}
        <div ref={result} tabIndex={-1} className="outline-none" aria-live="polite">
          {r.solved ? (
            <div className="mt-3">
              <p
                className="font-bold"
                style={{ color: r.firstTry ? "var(--ok)" : "var(--ink)" }}
              >
                {r.firstTry
                  ? t({ en: "Right.", ja: "正解。" })
                  : t({ en: "Here's why:", ja: "理由はこちら:" })}
              </p>
              <div className="mt-1">{why}</div>
            </div>
          ) : (
            r.wrong.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="font-bold text-[var(--bad)]">
                  {t({ en: "Not quite. Try another.", ja: "残念。別の答えをどうぞ。" })}
                </p>
                <button
                  type="button"
                  onClick={() => solve(false)}
                  className="text-sm font-semibold underline"
                >
                  {t({ en: "Show the answer", ja: "答えを見る" })}
                </button>
              </div>
            )
          )}
        </div>
      </div>
      {children !== undefined &&
        (locked ? (
          // The lab is not rendered at all until it is opened, so nothing in it
          // can give the answer away.
          <div className="panel flex min-h-36 flex-col items-center justify-center gap-3 border-dashed px-4 py-8 text-center">
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <p className="font-bold">
              {t({
                en: "Answer the question above to open the lab.",
                ja: "上の質問に答えるとラボが開きます。",
              })}
            </p>
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="min-h-10 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 text-sm font-bold"
            >
              {t({ en: "Skip and open the lab", ja: "スキップしてラボを開く" })}
            </button>
          </div>
        ) : (
          children
        ))}
      {after !== undefined && opened && after}
    </div>
  );
}
