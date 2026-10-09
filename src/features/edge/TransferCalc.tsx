import { useId, useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { humanDuration, transferSeconds } from "./transfer";

const SPEEDS: { gbps: number; label: L }[] = [
  {
    gbps: 1.25,
    label: { en: "1 VPN tunnel (1.25 Gbps)", ja: "VPN 1 トンネル (1.25 Gbps)" },
  },
  {
    gbps: 5,
    label: {
      en: "1 Large Bandwidth VPN tunnel (5 Gbps)",
      ja: "VPN 広帯域幅トンネル 1 本 (5 Gbps)",
    },
  },
  {
    gbps: 10,
    label: {
      en: "10 Gbps DX (one DataSync task can fill it)",
      ja: "10 Gbps DX (DataSync 1 タスクで使い切れる)",
    },
  },
  { gbps: 100, label: { en: "100 Gbps DX", ja: "100 Gbps DX" } },
];

export function TransferCalc() {
  const { t } = useLang();
  const tbId = useId();
  const utilId = useId();
  const [tb, setTb] = useState(100);
  const [util, setUtil] = useState(80);
  const unit: Record<string, L> = {
    min: { en: "min", ja: "分" },
    h: { en: "hours", ja: "時間" },
    d: { en: "days", ja: "日" },
  };
  const rows = SPEEDS.map((s) => ({
    ...s,
    dur: humanDuration(transferSeconds(tb, s.gbps, util / 100)),
  }));
  const maxS = transferSeconds(tb, SPEEDS[0].gbps, util / 100);
  return (
    <div className="panel p-4 sm:p-5">
      <p className="font-bold">
        {t({
          en: "How long to move it online?",
          ja: "オンラインで運ぶとどれくらいかかる?",
        })}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={tbId} className="flex justify-between text-sm font-semibold">
            {t({ en: "Data", ja: "データ量" })}
            <span className="num">{tb} TB</span>
          </label>
          <input
            id={tbId}
            type="range"
            min={1}
            max={1000}
            value={tb}
            aria-valuetext={`${tb} TB`}
            onChange={(e) => setTb(Number(e.target.value))}
            className="block w-full"
          />
        </div>
        <div>
          <label htmlFor={utilId} className="flex justify-between text-sm font-semibold">
            {t({ en: "Link utilization", ja: "回線の利用率" })}
            <span className="num">{util}%</span>
          </label>
          <input
            id={utilId}
            type="range"
            min={10}
            max={100}
            step={5}
            value={util}
            aria-valuetext={`${util}%`}
            onChange={(e) => setUtil(Number(e.target.value))}
            className="block w-full"
          />
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li
            key={r.gbps}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[minmax(0,14rem)_1fr_auto]"
          >
            <span className="col-span-2 font-semibold sm:col-span-1">{t(r.label)}</span>
            <span className="h-4 rounded bg-[var(--paper-2)]">
              <span
                className="block h-4 rounded"
                style={{
                  width: `${Math.max(1, (transferSeconds(tb, r.gbps, util / 100) / maxS) * 100)}%`,
                  background: "var(--data)",
                }}
              />
            </span>
            <span className="num font-bold whitespace-nowrap">
              {r.dur.value} {t(unit[r.dur.unit])}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--muted)]">
        {t({
          en: "Pure arithmetic: decimal TB × 8 ÷ (link speed × utilization). Real transfers add protocol overhead and per-file costs, so treat these as best cases.",
          ja: "単純計算: 10 進 TB × 8 ÷ (回線速度 × 利用率)。実際はプロトコルのオーバーヘッドやファイル単位の処理が加わるので、最良値として見てください。",
        })}
      </p>
    </div>
  );
}
