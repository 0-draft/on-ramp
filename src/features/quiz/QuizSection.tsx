import { useRef, useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { NAV } from "@/data/nav";
import { Section, Sources } from "@/components/ui";
import { CARDS, type QuizCard } from "./cards";
import { tally, type Answers } from "./score";

const OPTIONS: { id: "myth" | "fact"; label: L }[] = [
  { id: "myth", label: { en: "Myth", ja: "誤解" } },
  { id: "fact", label: { en: "Fact", ja: "事実" } },
];

export function QuizSection() {
  const { t } = useLang();
  const [answers, setAnswers] = useState<Answers>({});
  const { answered, right } = tally(CARDS, answers);

  return (
    <Section
      id="quiz"
      title={{ en: "Myth or fact?", ja: "誤解か、事実か" }}
      lead={{
        en: `${CARDS.length} things people say in design reviews. Commit to an answer before you read why; guessing first is what makes it stick.`,
        ja: `設計レビューでよく聞く ${CARDS.length} の発言。理由を読む前に答えを決めてください。先に予想することで記憶に残ります。`,
      }}
    >
      {/* A running score that stays in view while you work down the cards. */}
      <p
        className="num sticky top-14 z-10 mb-4 w-fit rounded-lg border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 text-sm font-bold shadow-sm"
        aria-live="polite"
      >
        {t({
          en: `${answered} / ${CARDS.length} answered · ${right} right`,
          ja: `${CARDS.length} 問中 ${answered} 問回答 · ${right} 問正解`,
        })}
      </p>
      <ol className="grid gap-3 md:grid-cols-2">
        {CARDS.map((c, i) => (
          <li key={i}>
            <Card
              n={i + 1}
              card={c}
              pick={answers[i]}
              onPick={(p) => setAnswers((a) => ({ ...a, [i]: p }))}
              onReset={() =>
                setAnswers((a) => {
                  const next = { ...a };
                  delete next[i];
                  return next;
                })
              }
            />
          </li>
        ))}
      </ol>
      <Sources
        doc="14-why-hybrid-is-hard.md"
        links={[
          {
            label: "Transit Gateway route evaluation order",
            url: "https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html",
          },
          {
            label: "Site-to-Site VPN quotas",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-limits.html",
          },
          {
            label: "Gateway endpoints for S3",
            url: "https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html",
          },
        ]}
      />
    </Section>
  );
}

function Card({
  n,
  card,
  pick,
  onPick,
  onReset,
}: {
  n: number;
  card: QuizCard;
  pick?: "myth" | "fact";
  onPick: (p: "myth" | "fact") => void;
  onReset: () => void;
}) {
  const { t } = useLang();
  const result = useRef<HTMLDivElement>(null);
  const answer = card.fact ? "fact" : "myth";
  const exit = NAV.findIndex((x) => x.id === card.to) + 1;
  return (
    <div className="panel flex h-full flex-col p-4">
      <p className="font-bold">
        <span className="num mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--ink)] px-1.5 text-xs text-[var(--paper)]">
          {n}
        </span>
        {t(card.claim)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((o) => {
          const state =
            pick === undefined
              ? ""
              : o.id === answer
                ? "answer"
                : o.id === pick
                  ? "wrong"
                  : "";
          return (
            <button
              key={o.id}
              type="button"
              aria-disabled={pick !== undefined}
              aria-pressed={pick === o.id}
              onClick={() => {
                if (pick !== undefined) return;
                onPick(o.id);
                requestAnimationFrame(() => result.current?.focus());
              }}
              className="min-h-10 rounded-lg border-2 px-4 py-1.5 text-sm font-bold aria-disabled:cursor-default"
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
      <div ref={result} tabIndex={-1} className="outline-none" aria-live="polite">
        {pick !== undefined && (
          <div className="mt-3 text-sm">
            <p
              className="font-bold"
              style={{ color: pick === answer ? "var(--ok)" : "var(--bad)" }}
            >
              {pick === answer
                ? t({ en: "Right.", ja: "正解。" })
                : t({ en: "Not quite.", ja: "残念。" })}
            </p>
            <p className="mt-1">{t(card.why)}</p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <a href={`#${card.to}`} className="font-semibold underline">
                {t({ en: `More at exit ${exit}`, ja: `出口 ${exit} で詳しく` })}
              </a>
              {card.deeper && (
                <a href={card.deeper} className="font-semibold underline">
                  {t({ en: "Cross Connect: myths", ja: "Cross Connect: よくある誤解" })}
                </a>
              )}
              <button type="button" onClick={onReset} className="font-semibold underline">
                {t({ en: "Try again", ja: "もう一度" })}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
