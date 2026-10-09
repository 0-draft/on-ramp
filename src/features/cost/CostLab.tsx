import { useMemo, useState } from "react";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";
import { Shield, Toggle } from "@/components/ui";
import { HOURS, OPTIONS, bills } from "./cost";

const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The slider is logarithmic: 10 GB to 500 TB in one sweep.
const MIN = Math.log10(10);
const MAX = Math.log10(512_000);
const toGb = (v: number) => {
  const g = 10 ** v;
  const mag = 10 ** Math.max(0, Math.floor(Math.log10(g)) - 1);
  return Math.round(g / mag) * mag;
};
const PRESETS = [100, 1_024, 10_240, 102_400];

function sizeLabel(gb: number) {
  return gb >= 1024
    ? `${(gb / 1024).toLocaleString("en-US", { maximumFractionDigits: 1 })} TB`
    : `${gb.toLocaleString("en-US")} GB`;
}

/** Average bit rate of a monthly volume, in Mbps (GB = 10^9 bytes). */
function avgMbps(gb: number) {
  return (gb * 8e9) / (HOURS * 3600) / 1e6;
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
  const [gb, setGb] = useState(10_240);
  const [viaTgw, setViaTgw] = useState(false);
  const [freeTier, setFreeTier] = useState(false);
  const rows = useMemo(() => bills({ gb, viaTgw, freeTier }), [gb, viaTgw, freeTier]);
  const max = Math.max(...rows.map((r) => r.total), 1);
  const cheapest = Math.min(...rows.map((r) => r.total));

  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="cost-gb" className="font-bold">
          {t({
            en: "Sent from Tokyo to your DC per month",
            ja: "東京リージョンから自社 DC へ送る量 (月)",
          })}
        </label>
        <input
          id="cost-gb"
          type="range"
          min={MIN}
          max={MAX}
          step={0.01}
          value={Math.log10(gb)}
          onChange={(e) => setGb(toGb(Number(e.target.value)))}
          aria-valuetext={sizeLabel(gb)}
          className="min-w-0 flex-1 accent-[var(--sign)]"
        />
        <span className="w-24 text-right font-mono text-lg font-bold">
          {sizeLabel(gb)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setGb(p)}
            aria-pressed={gb === p}
            className="rounded-md border border-[var(--line)] px-2 py-0.5 font-mono text-sm aria-pressed:border-[var(--ink)] aria-pressed:font-bold"
          >
            {sizeLabel(p)}
          </button>
        ))}
        <span className="text-sm text-[var(--muted)]">
          {t({ en: "average", ja: "平均" })}{" "}
          <span className="font-mono font-bold text-[var(--ink)]">
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
          const best = r.total === cheapest;
          return (
            <li
              key={r.id}
              className="grid grid-cols-[minmax(0,11rem)_1fr] items-center gap-x-3 gap-y-1 sm:grid-cols-[14rem_1fr_7rem]"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <Shield label={route.shield} color={route.color} size="sm" />
                <span className="min-w-0">{t(opt.name)}</span>
              </span>
              <div
                className="flex h-7 overflow-hidden rounded-md bg-[var(--paper-2)]"
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
              <span className="col-span-2 text-right font-mono text-sm font-bold sm:col-span-1">
                {best && (
                  <span className="mr-2 rounded bg-[var(--ok)] px-1.5 py-0.5 font-sans text-xs text-[var(--on-color)]">
                    {t({ en: "cheapest", ja: "最安" })}
                  </span>
                )}
                {usd(r.total)}
                <span className="sr-only">
                  {` (${t(PART.hourly.label)} ${usd(r.hourly)}, ${t(PART.transfer.label)} ${usd(r.transfer)}, ${t(PART.processing.label)} ${usd(r.processing)})`}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-[var(--muted)]">
        {(["hourly", "transfer", "processing"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-6 rounded-sm"
              style={{ background: "var(--r-dx)", ...PART[k].style }}
            />
            {t(PART[k].label)}
          </span>
        ))}
      </div>
    </div>
  );
}
