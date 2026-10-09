import { useState } from "react";
import type { ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { Segmented } from "@/components/ui";
import { GRE_OVERHEAD, greInnerMtu } from "./connect";

type Where = "vpc" | "dx" | "tunnelless";

interface Layer {
  label: L;
  note: L;
  color: string;
  /** Plaintext layers are dashed so colour is never the only cue. */
  encrypted: boolean | null;
}

interface Leg {
  title: L;
  layers: Layer[];
}

const PACKET: Layer = {
  label: {
    en: "Your packet: branch → workload VPC",
    ja: "自社のパケット: 拠点 → ワークロード VPC",
  },
  note: { en: "what you actually want to send", ja: "本当に送りたいもの" },
  color: "var(--ink)",
  encrypted: null,
};

const GRE: Layer = {
  label: {
    en: "GRE + BGP: appliance ↔ TGW Connect peer",
    ja: "GRE + BGP: アプライアンス ↔ TGW Connect ピア",
  },
  note: {
    en: `${GRE_OVERHEAD}-byte header, not encrypted`,
    ja: `${GRE_OVERHEAD} バイトのヘッダー、暗号化なし`,
  },
  color: "var(--r-sdwan)",
  encrypted: false,
};

const LEGS: Record<Where, Leg[]> = {
  vpc: [
    {
      title: {
        en: "Leg 1: branch to the appliance in a Connect VPC",
        ja: "区間 1: 拠点 → Connect VPC のアプライアンス",
      },
      layers: [
        {
          label: { en: "Internet", ja: "インターネット" },
          note: { en: "the road underneath", ja: "下を走る道" },
          color: "var(--r-internet)",
          encrypted: false,
        },
        {
          label: { en: "Vendor SD-WAN overlay", ja: "ベンダーの SD-WAN オーバーレイ" },
          note: { en: "usually encrypted by the vendor", ja: "通常はベンダーが暗号化" },
          color: "var(--r-sdwan)",
          encrypted: true,
        },
        PACKET,
      ],
    },
    {
      title: {
        en: "Leg 2: appliance to the Transit Gateway",
        ja: "区間 2: アプライアンス → Transit Gateway",
      },
      layers: [
        {
          label: {
            en: "VPC attachment (the transport)",
            ja: "VPC アタッチメント (トランスポート)",
          },
          note: {
            en: "AWS network inside the Region",
            ja: "リージョン内の AWS ネットワーク",
          },
          color: "var(--layer-3)",
          encrypted: null,
        },
        GRE,
        PACKET,
      ],
    },
  ],
  dx: [
    {
      title: {
        en: "On-prem SD-WAN router straight to the Transit Gateway",
        ja: "オンプレの SD-WAN ルーター → Transit Gateway 直結",
      },
      layers: [
        {
          label: {
            en: "DX transit VIF → DX attachment (transport)",
            ja: "DX トランジット VIF → DX アタッチメント (トランスポート)",
          },
          note: { en: "private, but plaintext", ja: "閉域だが平文" },
          color: "var(--r-dx)",
          encrypted: false,
        },
        GRE,
        PACKET,
      ],
    },
  ],
  tunnelless: [
    {
      title: {
        en: "Appliance to a Cloud WAN edge, Tunnel-less Connect",
        ja: "アプライアンス → Cloud WAN エッジ (トンネルレス Connect)",
      },
      layers: [
        {
          label: {
            en: "VPC attachment (the transport)",
            ja: "VPC アタッチメント (トランスポート)",
          },
          note: { en: "BGP peers directly with the edge", ja: "BGP はエッジと直接ピア" },
          color: "var(--layer-3)",
          encrypted: null,
        },
        PACKET,
      ],
    },
  ],
};

const WHERE: { id: Where; label: L }[] = [
  { id: "vpc", label: { en: "Appliance in a VPC", ja: "VPC 内のアプライアンス" } },
  {
    id: "dx",
    label: { en: "Appliance on-prem, over DX", ja: "オンプレのアプライアンス (DX 経由)" },
  },
  {
    id: "tunnelless",
    label: { en: "Cloud WAN Tunnel-less", ja: "Cloud WAN トンネルレス" },
  },
];

/**
 * One leg drawn as a cutaway: each wrapper is a box around the next, hatched
 * like a cross-section. HTML rather than SVG so long labels wrap in both
 * languages.
 */
function Cutaway({ leg }: { leg: Leg }) {
  const { t } = useLang();
  const render = (i: number): ReactNode => {
    const l = leg.layers[i];
    const inner = i === leg.layers.length - 1;
    return (
      <div
        className="rounded-lg border-[2.5px] p-2 sm:p-3"
        style={{
          borderColor: l.color,
          borderStyle: l.encrypted === false ? "dashed" : "solid",
          background: inner
            ? "var(--paper)"
            : "repeating-linear-gradient(45deg, var(--paper-2) 0 6px, var(--paper) 6px 12px)",
        }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 rounded bg-[var(--paper)] px-2 py-1">
          <span className="font-bold" style={{ color: l.color }}>
            {t(l.label)}
          </span>
          <span className="text-sm text-[var(--muted)]">
            {l.encrypted === true ? "🔒 " : ""}
            {t(l.note)}
          </span>
        </div>
        {!inner && <div className="mt-2">{render(i + 1)}</div>}
      </div>
    );
  };
  return (
    <figure className="mt-4">
      <figcaption className="mb-2 text-sm font-bold">{t(leg.title)}</figcaption>
      {render(0)}
    </figure>
  );
}

export function EncapLab() {
  const { t } = useLang();
  const [where, setWhere] = useState<Where>("vpc");
  return (
    <div className="panel p-4 sm:p-5">
      <Segmented
        label={{
          en: "Where the SD-WAN appliance sits",
          ja: "SD-WAN アプライアンスの場所",
        }}
        options={WHERE}
        value={where}
        onChange={setWhere}
        color="var(--r-sdwan)"
      />
      {LEGS[where].map((leg, i) => (
        <Cutaway key={`${where}-${i}`} leg={leg} />
      ))}
      <p className="mt-3 text-sm" aria-live="polite">
        {where === "tunnelless"
          ? t({
              en: "No GRE header at all: Cloud WAN supports 8500 MTU on Tunnel-less Connect VPC attachments, bounded by the VPC attachment's 100 Gbps per AZ.",
              ja: "GRE ヘッダーはなし。Cloud WAN はトンネルレス Connect の VPC アタッチメントで MTU 8500 をサポートし、上限は VPC アタッチメントの AZ あたり 100 Gbps。",
            })
          : t({
              en: `The GRE header costs ${GRE_OVERHEAD} bytes: over a 1500-byte outer MTU only ${greInnerMtu(1500)} bytes are left for your packet. Dashed borders mark plaintext layers.`,
              ja: `GRE ヘッダーで ${GRE_OVERHEAD} バイト使うので、外側 MTU 1500 ならパケットに使えるのは ${greInnerMtu(1500)} バイト。破線の枠は平文のレイヤーです。`,
            })}
      </p>
    </div>
  );
}
