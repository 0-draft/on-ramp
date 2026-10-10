import { useMemo, useState } from "react";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";
import { Shield, Toggle } from "@/components/ui";
import { Slider } from "@/components/ui/Slider";
import { OPTIONS, SLIDER, avgMbps, bills, gbAt, tooSmall } from "./cost";

const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PRESETS = [100, 1_024, 10_240, 102_400];

function sizeLabel(gb: number) {
  return gb >= 1024
    ? `${(gb / 1024).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB`
    : `${gb.toLocaleString("en-US")} GB`;
}

const PART = {
  hourly: {
    label: {
      en: "Hours (port, connection, gateway)",
      ja: "時間課金 (ポート・接続・ゲートウェイ)",
    },
    style: {
      background:
        "repeating-linear-gradient(135deg, var(--asphalt-2) 0 6px, var(--asphalt) 6px 9px)",
    },
  },
  transfer: {
    label: { en: "Data transfer out", ja: "データ転送 (OUT)" },
    style: {},
  },
  processing: {
    label: { en: "Gateway processing per GB", ja: "ゲートウェイの GB 処理料" },
    style: {
      background:
        "repeating-linear-gradient(90deg, var(--lane) 0 5px, color-mix(in srgb, var(--lane) 55%, transparent) 5px 8px)",
    },
  },
};

export function CostLab() {
  const { t } = useLang();
  // The slider keeps its own position: deriving it from the rounded volume
  // made arrow-key steps round straight back to where they started.
  const [pos, setPos] = useState(Math.log10(10_240));
  const [gb, setGb] = useState(10_240);
  const [viaTgw, setViaTgw] = useState(false);
  const [freeTier, setFreeTier] = useState(false);
  const rows = useMemo(() => bills({ gb, viaTgw, freeTier }), [gb, viaTgw, freeTier]);
  const max = Math.max(...rows.map((r) => r.total), 1);
  // Only options that can carry the volume compete for "cheapest".
  const cheapest = Math.min(
    ...rows.filter((r) => !tooSmall(r.id, gb)).map((r) => r.total),
  );

  return (
    <div className="panel p-4 sm:p-5">
      <Slider
        label={{
          en: "Sent from Tokyo to your DC per month",
          ja: "東京リージョンから自社 DC へ送る量 (月)",
        }}
        min={SLIDER.min}
        max={SLIDER.max}
        step={SLIDER.step}
        value={pos}
        onChange={(v) => {
          setPos(v);
          setGb(gbAt(v));
        }}
        // Show the volume itself, not the log-scale position.
        format={() => sizeLabel(gb)}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setGb(p);
              setPos(Math.log10(p));
            }}
            aria-pressed={gb === p}
            className="num min-h-9 rounded-md border border-[var(--line)] px-3 py-1 text-sm aria-pressed:border-[var(--ink)] aria-pressed:font-bold"
          >
            {sizeLabel(p)}
          </button>
        ))}
        <span className="text-sm text-[var(--muted)]">
          {t({ en: "average", ja: "平均" })}{" "}
          <span className="num font-bold text-[var(--ink)]">
            {avgMbps(gb).toLocaleString("en-US", {
              maximumFractionDigits: avgMbps(gb) < 10 ? 1 : 0,
            })}{" "}
            Mbps
          </span>
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        <Toggle
          label={{ en: "Lands on a Transit Gateway", ja: "Transit Gateway 経由" }}
          checked={viaTgw}
          onChange={setViaTgw}
        />
        <Toggle
          label={{ en: "Use the 100 GB free tier", ja: "無料枠 100 GB を使う" }}
          checked={freeTier}
          onChange={setFreeTier}
        />
      </div>

      {/* Toll booths: one stacked bar per road. */}
      <ul
        className="mt-5 flex flex-col gap-3"
        aria-label={t({ en: "Monthly AWS bill per path", ja: "経路ごとの月額 AWS 料金" })}
      >
        {rows.map((r) => {
          const opt = OPTIONS.find((o) => o.id === r.id)!;
          const route = ROUTE[opt.route];
          const small = tooSmall(r.id, gb);
          const best = !small && r.total === cheapest;
          return (
            <li
              key={r.id}
              // Phones: name and price on one line, the bar full width below.
              className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[15rem_1fr_6.5rem] ${small ? "opacity-55" : ""}`}
            >
              <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-bold">
                <Shield label={route.shield} color={route.color} size="sm" />
                <span className="min-w-0">{t(opt.name)}</span>
                {best && (
                  <span className="rounded bg-[var(--ok)] px-1.5 py-0.5 text-xs text-[var(--on-color)]">
                    {t({ en: "cheapest", ja: "最安" })}
                  </span>
                )}
                {small && (
                  <span className="rounded border border-[var(--bad)] px-1.5 py-0.5 text-xs text-[var(--bad)]">
                    {t({
                      en: "✕ too small for this volume",
                      ja: "✕ この量には帯域不足",
                    })}
                  </span>
                )}
              </span>
              <span className="num text-right text-sm font-bold sm:order-last">
                {usd(r.total)}
                <span className="sr-only">
                  {` (${t(PART.hourly.label)} ${usd(r.hourly)}, ${t(PART.transfer.label)} ${usd(r.transfer)}, ${t(PART.processing.label)} ${usd(r.processing)})`}
                </span>
              </span>
              <div
                className="col-span-2 flex h-7 overflow-hidden rounded-md bg-[var(--paper-2)] sm:col-span-1"
                aria-hidden="true"
              >
                {(["hourly", "transfer", "processing"] as const).map((k) =>
                  r[k] > 0 ? (
                    <span
                      key={k}
                      title={`${t(PART[k].label)}: ${usd(r[k])}`}
                      style={{
                        width: `${(r[k] / max) * 100}%`,
                        background: route.color,
                        ...PART[k].style,
                      }}
                    />
                  ) : null,
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-[var(--muted)]">
        {(["hourly", "transfer", "processing"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            {k === "transfer" ? (
              // Transfer is drawn in each road's own colour, so show three.
              <span className="inline-flex h-3 w-6 overflow-hidden rounded-sm">
                <span className="flex-1" style={{ background: "var(--r-internet)" }} />
                <span className="flex-1" style={{ background: "var(--r-vpn)" }} />
                <span className="flex-1" style={{ background: "var(--r-dx)" }} />
              </span>
            ) : (
              <span className="inline-block h-3 w-6 rounded-sm" style={PART[k].style} />
            )}
            {t(PART[k].label)}
            {k === "transfer" && t({ en: " (road colour)", ja: " (道の色)" })}
          </span>
        ))}
      </div>
    </div>
  );
}
