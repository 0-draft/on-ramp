import { useId, useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { Segmented } from "@/components/ui";
import { capacity, fits, GBPS_PER_GRE_PEER, PEERS_MAX, type Mode } from "./connect";

const MODES: { id: Mode; label: L }[] = [
  { id: "tgw-gre", label: { en: "TGW Connect (GRE)", ja: "TGW Connect (GRE)" } },
  {
    id: "cwan-gre",
    label: { en: "Cloud WAN Connect (GRE)", ja: "Cloud WAN Connect (GRE)" },
  },
  {
    id: "cwan-tunnelless",
    label: { en: "Cloud WAN Tunnel-less", ja: "Cloud WAN Tunnel-less" },
  },
];

const DEMANDS = [2, 5, 10, 20, 40];

/** How many Gbps one Connect attachment carries as you add peers. */
export function CapacityLab() {
  const { t } = useLang();
  const id = useId();
  const [mode, setMode] = useState<Mode>("tgw-gre");
  const [peers, setPeers] = useState(1);
  const [demand, setDemand] = useState(10);
  const cap = capacity(mode, peers);
  const ok = fits(mode, peers, demand);
  const scale = Math.max(cap, demand, 20);
  const gre = mode !== "cwan-tunnelless";

  return (
    <div className="panel p-4 sm:p-5">
      <Segmented
        label={{ en: "Connect type", ja: "Connect の種類" }}
        options={MODES}
        value={mode}
        onChange={setMode}
        color="var(--r-sdwan)"
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={id}
            className="flex items-baseline justify-between text-sm font-semibold"
          >
            {t({ en: "Connect peers", ja: "Connect ピア数" })}
            <span className="text-2xl font-black">{peers}</span>
          </label>
          <input
            id={id}
            type="range"
            min={1}
            max={PEERS_MAX}
            value={peers}
            onChange={(e) => setPeers(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--r-sdwan)]"
          />
        </div>
        <label className="flex items-center justify-between gap-2 text-sm font-semibold">
          {t({ en: "Traffic from your branches", ja: "拠点からのトラフィック" })}
          <select
            value={demand}
            onChange={(e) => setDemand(Number(e.target.value))}
            className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-1 font-mono"
          >
            {DEMANDS.map((d) => (
              <option key={d} value={d}>
                {d} Gbps
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Capacity as lanes: one lane per GRE peer, so you can count them. */}
      <div className="mt-5 space-y-2" aria-hidden="true">
        <p className="text-xs font-semibold text-[var(--muted)]">
          {t({ en: "Capacity (Gbps)", ja: "容量 (Gbps)" })}
        </p>
        <div className="flex h-8 overflow-hidden rounded-md bg-[var(--paper-2)]">
          {gre ? (
            Array.from({ length: peers }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-center border-r-2 border-[var(--paper)] text-xs font-bold text-[var(--on-color)]"
                style={{
                  width: `${(GBPS_PER_GRE_PEER / scale) * 100}%`,
                  background: "var(--r-sdwan)",
                }}
              >
                {GBPS_PER_GRE_PEER}
              </div>
            ))
          ) : (
            <div
              className="flex items-center justify-center text-xs font-bold text-[var(--on-color)]"
              style={{ width: `${(cap / scale) * 100}%`, background: "var(--sign)" }}
            >
              100
            </div>
          )}
        </div>
        <p className="text-xs font-semibold text-[var(--muted)]">
          {t({ en: "Your traffic (Gbps)", ja: "流したい量 (Gbps)" })}
        </p>
        <div className="relative h-8 rounded-md bg-[var(--paper-2)]">
          <div
            className="flex h-8 items-center rounded-md px-2 text-xs font-bold"
            style={{
              width: `${(demand / scale) * 100}%`,
              background: ok ? "var(--ok)" : "var(--bad)",
              color: "var(--on-color)",
            }}
          >
            {demand}
          </div>
        </div>
      </div>
      <p
        className="mt-3 text-lg font-black"
        style={{ color: ok ? "var(--ok)" : "var(--bad)" }}
        aria-live="polite"
      >
        {ok
          ? t({
              en: `Fits: ${cap} Gbps of capacity for ${demand} Gbps`,
              ja: `収まる: 容量 ${cap} Gbps に対して ${demand} Gbps`,
            })
          : t({
              en: `Does not fit: ${cap} Gbps of capacity for ${demand} Gbps`,
              ja: `収まらない: 容量 ${cap} Gbps に対して ${demand} Gbps`,
            })}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {gre
          ? t({
              en: "Each GRE Connect peer carries up to 5 Gbps and an attachment takes at most 4, so 20 Gbps per attachment with ECMP, and only if every appliance advertises the same prefixes with the same AS_PATH. One GRE tunnel is one flow to EC2, so a single peer never goes past 5 Gbps however large the instance.",
              ja: "GRE の Connect ピアは 1 つ最大 5 Gbps、1 アタッチメントに最大 4 つなので、ECMP で 1 アタッチメント 20 Gbps。ただし全アプライアンスが同じプレフィックスを同じ AS_PATH で広告している場合だけ。GRE トンネル 1 本は EC2 から見て 1 フローなので、インスタンスがどれだけ大きくても 1 ピアは 5 Gbps を超えません。",
            })
          : t({
              en: "Tunnel-less Connect has no GRE peer limit: it is bounded by the VPC attachment, up to 100 Gbps per Availability Zone. The trade-off is one ENI per VRF on the appliance.",
              ja: "Tunnel-less Connect には GRE ピアの上限がなく、VPC アタッチメントの AZ あたり最大 100 Gbps が上限です。代わりにアプライアンス側で VRF ごとに ENI が 1 つ必要です。",
            })}
      </p>
    </div>
  );
}
