import { useId, useState } from "react";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { Segmented } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";
import { ROUTE } from "@/data/routes";
import {
  PARTIES,
  SCENARIO,
  SCENARIOS,
  type Hop,
  type Kind,
  type ScenarioId,
} from "./flows";

const STROKE: Record<Kind, string> = {
  query: "var(--ink)",
  local: "var(--ink)",
  answer: ROUTE.dns.color,
  fail: "var(--bad)",
};

/**
 * A DNS lookup drawn as a sequence diagram (participants across the top,
 * messages down the page) on wide screens, and as a vertical strip of
 * stations on phones. Walked one message at a time.
 */
export function DnsLab({ initial = "endpoint" }: { initial?: ScenarioId }) {
  const { t, lang } = useLang();
  const narrow = useNarrow();
  const uid = useId();
  const [id, setId] = useState<ScenarioId>(initial);
  const [step, setStep] = useState(0);
  const s = SCENARIO[id];
  const last = s.hops.length - 1;
  const done = step === last;
  const color = ROUTE.dns.color;

  const pick = (next: ScenarioId) => {
    setId(next);
    setStep(0);
  };

  const marker = (k: Kind) => `url(#${uid}-${k})`;
  const markers = (
    <defs>
      {(Object.keys(STROKE) as Kind[]).map((k) => (
        <marker
          key={k}
          id={`${uid}-${k}`}
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={7}
          markerHeight={7}
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={STROKE[k]} />
        </marker>
      ))}
    </defs>
  );

  const answerText = s.answer
    ? `${t({ en: "Answer", ja: "答え" })}: ${typeof s.answer === "string" ? s.answer : t(s.answer)}`
    : t({ en: "No answer: SERVFAIL", ja: "答えなし: SERVFAIL" });
  const answerColor = s.ok ? color : "var(--bad)";

  let diagram;
  if (!narrow) {
    const n = s.parties.length;
    const W = 900;
    const colW = W / n;
    const x = (i: number) => colW * i + colW / 2;
    const col = (p: string) => s.parties.indexOf(p as never);
    const top = 112;
    const rowH = 40;
    const H = top + s.hops.length * rowH + 76;
    const boxW = Math.min(colW - 16, 176);

    // Background zones: which side of the link each participant lives on.
    const zones: { side: string; from: number; to: number }[] = [];
    s.parties.forEach((p, i) => {
      const side = PARTIES[p].side;
      const z = zones.at(-1);
      if (z && z.side === side) z.to = i;
      else zones.push({ side, from: i, to: i });
    });
    const zoneLabel = {
      onprem: { en: "Your network", ja: "社内" },
      aws: { en: "AWS (VPC)", ja: "AWS (VPC)" },
      internet: { en: "Internet", ja: "インターネット" },
    } as const;

    const arrow = (h: Hop, i: number) => {
      const y = top + i * rowH + 20;
      const a = x(col(h.from));
      const b = x(col(h.to));
      const on = i === step;
      // Future messages are faint ghosts with no label, so the whole shape of
      // the lookup is visible before you step through it.
      const ghost = i > step;
      const op = ghost ? 0.14 : i < step ? 0.35 : 1;
      const dash = h.kind === "answer" ? "7 5" : h.kind === "fail" ? "3 5" : undefined;
      if (a === b) {
        return (
          <g key={i} opacity={op}>
            <path
              d={`M${a} ${y - 10} h40 v20 h-36`}
              fill="none"
              stroke={STROKE[h.kind]}
              strokeWidth={on ? 3 : 2}
              markerEnd={marker(h.kind)}
            />
            {!ghost && (
              <text x={a + 48} y={y + 5} fontSize={13} fill="var(--ink)">
                {t(h.label)}
              </text>
            )}
          </g>
        );
      }
      const dir = b > a ? 1 : -1;
      return (
        <g key={i} opacity={op}>
          <line
            x1={a + dir * 4}
            y1={y}
            x2={b - dir * 6}
            y2={y}
            stroke={STROKE[h.kind]}
            strokeWidth={on ? 3 : 2}
            strokeDasharray={dash}
            markerEnd={marker(h.kind)}
          />
          {!ghost && (
            <text
              x={(a + b) / 2}
              y={y - 7}
              textAnchor="middle"
              fontSize={13}
              fill={h.kind === "fail" ? "var(--bad)" : "var(--ink)"}
              className={h.kind === "answer" ? "mono" : undefined}
              // A halo keeps labels legible where they cross a zone border.
              stroke="var(--paper-2)"
              strokeWidth={5}
              paintOrder="stroke"
            >
              {t(h.label)}
            </text>
          )}
        </g>
      );
    };

    diagram = (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="diagram block h-auto w-full"
        role="img"
        aria-label={t(s.label)}
      >
        {markers}
        {zones.map((z, i) => (
          <g key={i}>
            <rect
              x={colW * z.from + 4}
              y={4}
              width={colW * (z.to - z.from + 1) - 8}
              height={H - 8}
              rx={12}
              fill="var(--paper-2)"
              stroke={z.side === "aws" ? "var(--hub)" : "none"}
              strokeDasharray="6 5"
            />
            <text
              x={colW * z.from + 16}
              y={24}
              fontSize={13}
              fill={z.side === "aws" ? "var(--ink)" : "var(--muted)"}
            >
              {t(zoneLabel[z.side as keyof typeof zoneLabel])}
            </text>
          </g>
        ))}
        {s.parties.map((p, i) => {
          const info = PARTIES[p];
          const involved = s.hops[step].from === p || s.hops[step].to === p;
          return (
            <g key={p}>
              <line
                x1={x(i)}
                y1={90}
                x2={x(i)}
                y2={H - 64}
                stroke="var(--asphalt-2)"
                strokeWidth={1.5}
                strokeDasharray="3 5"
              />
              <rect
                x={x(i) - boxW / 2}
                y={34}
                width={boxW}
                height={56}
                rx={8}
                fill="var(--paper)"
                stroke={involved ? color : "var(--line)"}
                strokeWidth={involved ? 3 : 1.5}
              />
              <text
                x={x(i)}
                y={info.addr ? 58 : 67}
                textAnchor="middle"
                fontSize={15}
                fill="var(--ink)"
              >
                {t(info.name)}
              </text>
              {info.addr && (
                <text
                  x={x(i)}
                  y={78}
                  textAnchor="middle"
                  fontSize={13}
                  fill="var(--muted)"
                  className="mono"
                >
                  {info.addr}
                </text>
              )}
            </g>
          );
        })}
        {s.hops.map(arrow)}
        {done && (
          <g>
            <rect
              x={W / 2 - 230}
              y={H - 58}
              width={460}
              height={40}
              rx={8}
              fill={answerColor}
            />
            <text
              x={W / 2}
              y={H - 32}
              textAnchor="middle"
              fontSize={16}
              fill="var(--on-color)"
              className="mono"
            >
              {answerText}
            </text>
          </g>
        )}
      </svg>
    );
  } else {
    // Phone: a vertical strip of stations; only the current message is drawn.
    const W = 360;
    const rowH = 66;
    const top = 16;
    const H = top + s.parties.length * rowH + 70;
    const y = (i: number) => top + i * rowH + 23;
    const h = s.hops[step];
    const a = s.parties.indexOf(h.from);
    const b = s.parties.indexOf(h.to);
    diagram = (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="diagram block h-auto w-full"
        role="img"
        aria-label={t(s.label)}
      >
        {markers}
        <line
          x1={200}
          y1={y(0)}
          x2={200}
          y2={y(s.parties.length - 1)}
          stroke="var(--asphalt-2)"
          strokeWidth={4}
        />
        {s.parties.map((p, i) => {
          const info = PARTIES[p];
          const involved = i === a || i === b;
          return (
            <g key={p}>
              <rect
                x={80}
                y={y(i) - 23}
                width={260}
                height={46}
                rx={8}
                fill="var(--paper)"
                stroke={involved ? color : "var(--line)"}
                strokeWidth={involved ? 3 : 1.5}
              />
              <text
                x={210}
                y={info.addr ? y(i) - 3 : y(i) + 5}
                textAnchor="middle"
                fontSize={15}
                fill="var(--ink)"
              >
                {t(info.name)}
              </text>
              {info.addr && (
                <text
                  x={210}
                  y={y(i) + 15}
                  textAnchor="middle"
                  fontSize={13}
                  fill="var(--muted)"
                  className="mono"
                >
                  {info.addr}
                </text>
              )}
            </g>
          );
        })}
        {a === b ? (
          <path
            d={`M80 ${y(a) - 10} h-30 v20 h26`}
            fill="none"
            stroke={STROKE[h.kind]}
            strokeWidth={3}
            markerEnd={marker(h.kind)}
          />
        ) : (
          <path
            d={`M80 ${y(a)} C20 ${y(a)} 20 ${y(b)} 74 ${y(b)}`}
            fill="none"
            stroke={STROKE[h.kind]}
            strokeWidth={3}
            strokeDasharray={
              h.kind === "answer" ? "7 5" : h.kind === "fail" ? "3 5" : undefined
            }
            markerEnd={marker(h.kind)}
          />
        )}
        {done && (
          <g>
            <rect x={20} y={H - 58} width={320} height={40} rx={8} fill={answerColor} />
            <text
              x={180}
              y={H - 32}
              textAnchor="middle"
              fontSize={14}
              fill="var(--on-color)"
              className="mono"
            >
              {answerText}
            </text>
          </g>
        )}
      </svg>
    );
  }

  return (
    <div className="panel p-4 sm:p-5">
      <Segmented
        label={{ en: "Lookup", ja: "名前解決のシナリオ" }}
        options={SCENARIOS.map((x) => ({ id: x.id, label: x.label }))}
        value={id}
        onChange={pick}
        color={color}
      />
      <p className="mt-4 text-sm">
        <span className="font-semibold text-[var(--muted)]">
          {t({ en: "Question", ja: "問い合わせ" })}:{" "}
        </span>
        <code className="rounded bg-[var(--paper-2)] px-1.5 py-0.5 font-mono break-all">
          A? {s.question}
        </code>
      </p>
      <div className="mt-3">
        <Stepper
          steps={s.hops.map((h) => h.caption)}
          index={step}
          onChange={setStep}
          color={color}
        >
          {diagram}
        </Stepper>
      </div>
      {/* Always mounted, so screen readers announce the outcome when it appears. */}
      <div aria-live="polite">
        {done && (
          <p
            className="mt-2 border-l-4 pl-3 text-[0.95rem]"
            style={{ borderColor: answerColor }}
          >
            {t(s.outcome)}
          </p>
        )}
      </div>
      {lang === "ja" && (
        <p className="mt-2 text-xs text-[var(--muted)]">
          図中の「EP」は Route 53 VPC Resolver のエンドポイント (インバウンド /
          アウトバウンド) のことです。
        </p>
      )}
    </div>
  );
}
