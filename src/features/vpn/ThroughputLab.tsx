import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";
import { Callout, Segmented, Toggle } from "@/components/ui";
import { throughput, type TunnelSize, type VpnHub } from "./throughput";

const PROBLEM: Record<string, L> = {
  largeOnVgw: {
    en: "Large (5 Gbps) tunnels exist only on Transit Gateway and Cloud WAN. A virtual private gateway offers standard tunnels only.",
    ja: "広帯域幅 (5 Gbps) トンネルは Transit Gateway と Cloud WAN だけ。仮想プライベートゲートウェイは標準トンネルのみです。",
  },
  staticOnCloudWan: {
    en: "Cloud WAN VPN attachments are BGP only. A static VPN cannot attach.",
    ja: "Cloud WAN の VPN アタッチメントは BGP のみ。静的 VPN はつなげません。",
  },
};

const SINGLE: Record<string, L> = {
  vgw: {
    en: "A virtual private gateway picks one tunnel across all its VPN connections to send to you, and has no ECMP. Its total AWS-to-you throughput tops out at 1.25 Gbps, however many connections you add.",
    ja: "仮想プライベートゲートウェイは、全 VPN 接続の中から 1 本のトンネルだけを社内向けの送信に使い、ECMP もありません。接続をいくつ足しても AWS → 社内の合計は最大 1.25 Gbps。",
  },
  static: {
    en: "ECMP needs BGP. With static routing, one tunnel carries the traffic.",
    ja: "ECMP には BGP が必要。静的ルーティングでは 1 本のトンネルが運びます。",
  },
  ecmpOff: {
    en: "The Transit Gateway's VPN ECMP option is off, so it uses one path.",
    ja: "Transit Gateway の VPN ECMP オプションがオフなので 1 経路だけ。",
  },
};

const HUBS: { id: VpnHub; label: L }[] = [
  {
    id: "vgw",
    label: { en: "Virtual private gateway", ja: "仮想プライベートゲートウェイ" },
  },
  { id: "tgw", label: { en: "Transit Gateway", ja: "Transit Gateway" } },
  { id: "cloudwan", label: { en: "Cloud WAN", ja: "Cloud WAN" } },
];

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: L;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span>{t(label)}</span>
      <button
        type="button"
        className="h-10 w-10 rounded-md border border-[var(--line)] font-black aria-disabled:opacity-40"
        onClick={() => value > min && onChange(value - 1)}
        aria-disabled={value <= min}
        aria-label={`${t(label)} −1`}
      >
        −
      </button>
      <output className="num w-8 text-center text-base">{value}</output>
      <button
        type="button"
        className="h-10 w-10 rounded-md border border-[var(--line)] font-black aria-disabled:opacity-40"
        onClick={() => value < max && onChange(value + 1)}
        aria-disabled={value >= max}
        aria-label={`${t(label)} +1`}
      >
        +
      </button>
    </div>
  );
}

const fmt = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "");

/** How fast can AWS send to you over Site-to-Site VPN? */
export function ThroughputLab() {
  const { t } = useLang();
  const [hub, setHub] = useState<VpnHub>("vgw");
  const [size, setSize] = useState<TunnelSize>("standard");
  const [connections, setConnections] = useState(2);
  const [routing, setRouting] = useState<"bgp" | "static">("bgp");
  const [ecmp, setEcmp] = useState(true);
  const [flows, setFlows] = useState(8);
  const r = throughput({ hub, size, connections, routing, ecmp, flows });
  const color = ROUTE.vpn.color;
  // Bars scale to the largest the lab can show: 4 connections of Large tunnels.
  const MAX = 40;

  return (
    <div className="panel grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col gap-4">
        <Segmented
          label={{ en: "AWS side", ja: "AWS 側" }}
          options={HUBS}
          value={hub}
          onChange={setHub}
          color={color}
        />
        <Segmented
          label={{ en: "Tunnel size", ja: "トンネルのサイズ" }}
          options={[
            { id: "standard", label: { en: "Standard 1.25 Gbps", ja: "標準 1.25 Gbps" } },
            { id: "large", label: { en: "Large 5 Gbps", ja: "広帯域幅 5 Gbps" } },
          ]}
          value={size}
          onChange={setSize}
          color={color}
        />
        <Segmented
          label={{ en: "Routing", ja: "ルーティング" }}
          options={[
            { id: "bgp", label: { en: "BGP", ja: "BGP" } },
            { id: "static", label: { en: "Static", ja: "静的" } },
          ]}
          value={routing}
          onChange={setRouting}
          color={color}
        />
        <Counter
          label={{ en: "VPN connections", ja: "VPN 接続数" }}
          value={connections}
          min={1}
          max={4}
          onChange={setConnections}
        />
        <Counter
          label={{ en: "Parallel flows", ja: "同時フロー数" }}
          value={flows}
          min={1}
          max={16}
          onChange={setFlows}
        />
        {hub === "tgw" && (
          <Toggle
            label={{
              en: "Transit Gateway VPN ECMP option",
              ja: "Transit Gateway の VPN ECMP オプション",
            }}
            checked={ecmp}
            onChange={setEcmp}
          />
        )}
      </div>

      <div>
        {!r.ok ? (
          <Callout tone="bad" title={{ en: "Not possible", ja: "この組み合わせは不可" }}>
            {t(PROBLEM[r.problem!])}
          </Callout>
        ) : (
          <>
            {/* One lane per tunnel; lit lanes carry traffic at the same time. */}
            <p className="text-sm font-bold">
              {t({ en: "Tunnels, AWS to you", ja: "トンネル (AWS → 社内)" })}:{" "}
              {r.activeTunnels} / {r.tunnels} {t({ en: "in use", ja: "本を使用" })}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {Array.from({ length: r.tunnels }, (_, k) => {
                const used = k < Math.min(r.activeTunnels, flows);
                return (
                  <div key={k} className="flex items-center gap-2 text-xs font-semibold">
                    <span className="w-16 shrink-0 text-[var(--muted)]">
                      {t({ en: "Tunnel", ja: "トンネル" })} {k + 1}
                    </span>
                    <div className="h-4 flex-1 overflow-hidden rounded bg-[var(--paper-2)]">
                      <div
                        className="h-full rounded transition-[width]"
                        style={{
                          width: used ? `${(r.perTunnelGbps / 5) * 100}%` : "0%",
                          background: color,
                        }}
                      />
                    </div>
                    <span className="num w-24 shrink-0 text-right">
                      {used
                        ? `${fmt(r.perTunnelGbps)} Gbps`
                        : t({ en: "idle", ja: "待機" })}
                    </span>
                  </div>
                );
              })}
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4">
              <div>
                <dt className="text-xs font-semibold text-[var(--muted)]">
                  {t({ en: "Best-case total", ja: "最大合計 (理想的な分散)" })}
                </dt>
                <dd>
                  <span
                    className="num text-3xl font-black"
                    style={{ color }}
                    aria-live="polite"
                  >
                    {fmt(r.aggregateGbps)} <span className="text-base">Gbps</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 block h-2 rounded bg-[var(--paper-2)]"
                  >
                    <span
                      className="block h-full rounded"
                      style={{
                        width: `${(r.aggregateGbps / MAX) * 100}%`,
                        background: color,
                      }}
                    />
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[var(--muted)]">
                  {t({
                    en: "One big transfer (one flow)",
                    ja: "大きな転送 1 本 (1 フロー)",
                  })}
                </dt>
                <dd className="num text-3xl font-black" aria-live="polite">
                  {fmt(r.singleFlowGbps)} <span className="text-base">Gbps</span>
                </dd>
                <dd className="mt-1 text-xs text-[var(--muted)]">
                  {t({ en: "Max", ja: "上限" })} {r.perTunnelPps.toLocaleString()} PPS{" "}
                  {t({ en: "per tunnel", ja: "/ トンネル" })}
                </dd>
              </div>
            </dl>
            {r.single && <p className="mt-4 text-sm">{t(SINGLE[r.single])}</p>}
            {!r.single && (
              <p className="mt-4 text-sm">
                {t({
                  en: "ECMP hashes each flow onto one tunnel, so the total assumes flows spread evenly. A single flow never goes faster than one tunnel.",
                  ja: "ECMP は各フローを 1 本のトンネルにハッシュするので、合計はフローが均等に散った場合の値。1 フローは 1 トンネルより速くなりません。",
                })}
                {hub === "cloudwan" &&
                  ` ${t({
                    en: "Cloud WAN spreads BGP VPN flows by default; the core network policy can turn this off (vpn-ecmp-support).",
                    ja: "Cloud WAN は既定で BGP VPN のフローを分散します。コアネットワークポリシー (vpn-ecmp-support) で無効化も可能。",
                  })}`}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
