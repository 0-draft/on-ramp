import { useRef, useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import {
  nextQuestion,
  recommend,
  type Answers,
  type Product,
  type Question,
} from "./chooser";
import { C, QUESTION, ROWS } from "./data";

const YES: L = { en: "Yes", ja: "はい" };
const NO: L = { en: "No", ja: "いいえ" };

/**
 * Three yes/no questions from docs/07 that pick a door, with the comparison
 * table right under it: the matching rows light up and the rest dim, so the
 * answer and the reasons sit in one place.
 */
export function DoorChooser() {
  const { t } = useLang();
  const [a, setA] = useState<Answers>({});
  const result = useRef<HTMLParagraphElement>(null);
  const firstAnswer = useRef<HTMLButtonElement>(null);
  const q = nextQuestion(a);
  const rec = recommend(a);
  const asked = (["manyNetworks", "adminToServer", "dataMayLeave"] as Question[]).filter(
    (k) => a[k] !== undefined,
  );

  const answer = (v: boolean) => {
    if (!q) return;
    const next = { ...a, [q]: v };
    setA(next);
    // When the last answer decides, the buttons go away: move focus to the
    // result. Otherwise the same buttons stay mounted for the next question.
    if (nextQuestion(next) === null) requestAnimationFrame(() => result.current?.focus());
  };

  return (
    <div className="panel p-4 sm:p-5">
      <p className="font-bold">{t({ en: "Which door fits?", ja: "どの入口が合う?" })}</p>
      <ol className="mt-3 space-y-2">
        {asked.map((k) => (
          <li
            key={k}
            className="flex flex-wrap items-baseline gap-2 text-sm text-[var(--muted)]"
          >
            <span>{t(QUESTION[k])}</span>
            <b className="text-[var(--ink)]">{a[k] ? t(YES) : t(NO)}</b>
          </li>
        ))}
      </ol>
      {q && (
        <div className="mt-3" role="group" aria-labelledby="people-q">
          <p id="people-q" className="font-semibold">
            {t(QUESTION[q])}
          </p>
          <div className="mt-2 flex gap-2">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                ref={v ? firstAnswer : undefined}
                type="button"
                onClick={() => answer(v)}
                className="min-h-10 rounded-lg border-2 px-5 py-1.5 text-sm font-bold"
                style={{ borderColor: C }}
              >
                {v ? t(YES) : t(NO)}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Always mounted so the recommendation is announced when it appears. */}
      <div aria-live="polite">
        {rec && (
          <div className="mt-3">
            <p
              ref={result}
              tabIndex={-1}
              className="text-lg font-extrabold outline-none"
              style={{ color: C }}
            >
              {rec
                .map((p) => ROWS.find((r) => r.id === p)!.name)
                .join(t({ en: " or ", ja: " または " }))}
            </p>
            {rec.includes("eice") && (
              <p className="text-sm">
                {t({
                  en: "Session Manager by default; EC2 Instance Connect Endpoint when you want native SSH or RDP clients.",
                  ja: "基本は Session Manager。手元の SSH / RDP クライアントをそのまま使いたいなら EC2 Instance Connect Endpoint。",
                })}
              </p>
            )}
          </div>
        )}
      </div>
      {asked.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setA({});
            requestAnimationFrame(() => firstAnswer.current?.focus());
          }}
          className="mt-3 min-h-10 text-sm font-semibold underline"
        >
          {t({ en: "Start over", ja: "最初から" })}
        </button>
      )}
      <Compare highlight={rec} />
    </div>
  );
}

const HEAD: L[] = [
  { en: "Door", ja: "入口" },
  { en: "Who connects", ja: "誰が" },
  { en: "On the wire", ja: "通信" },
  { en: "What's reachable", ja: "届く範囲" },
  { en: "Inbound port on targets?", ja: "宛先の受信ポート" },
  { en: "Cost (Tokyo)", ja: "料金 (東京)" },
];

/** The comparison, as a table on wide screens and stacked cards on phones. */
function Compare({ highlight }: { highlight: Product[] | null }) {
  const { t } = useLang();
  const state = (id: Product) =>
    highlight === null ? "plain" : highlight.includes(id) ? "on" : "off";
  const rowStyle = (id: Product) =>
    state(id) === "on"
      ? { background: "var(--paper-2)" }
      : state(id) === "off"
        ? { opacity: 0.45 }
        : undefined;
  const mark = (id: Product) =>
    state(id) === "on" ? (
      <span className="sr-only">{t({ en: "Recommended: ", ja: "おすすめ: " })}</span>
    ) : null;
  const cells = (r: (typeof ROWS)[number]) => [r.who, r.wire, r.reach, r.inbound, r.cost];

  return (
    <>
      <div className="mt-5 hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--line)] bg-[var(--paper-2)]">
              {HEAD.map((h, i) => (
                <th key={i} scope="col" className="px-2 py-2 font-bold">
                  {t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[var(--line)] align-top transition-opacity"
                style={rowStyle(r.id)}
              >
                <th
                  scope="row"
                  className="px-2 py-2 font-bold whitespace-nowrap"
                  // A left accent marks a match; adjacent matches don't double up.
                  style={{
                    boxShadow: state(r.id) === "on" ? `inset 4px 0 0 ${C}` : undefined,
                  }}
                >
                  {mark(r.id)}
                  {r.name}
                </th>
                {cells(r).map((c, i) => (
                  <td key={i} className="px-2 py-2">
                    {t(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-5 flex flex-col gap-2 sm:hidden">
        {ROWS.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-[var(--line)] p-3 text-sm transition-opacity"
            style={rowStyle(r.id)}
          >
            <p className="font-bold">
              {mark(r.id)}
              {r.name}
            </p>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {cells(r).map((c, i) => (
                <div key={i} className="contents">
                  <dt className="text-xs font-semibold text-[var(--muted)]">
                    {t(HEAD[i + 1])}
                  </dt>
                  <dd>{t(c)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
