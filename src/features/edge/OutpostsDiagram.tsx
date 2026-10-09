import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { Segmented } from "@/components/ui";
import { C } from "./color";

type Mode = "direct" | "coip";

export function OutpostsDiagram() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [mode, setMode] = useState<Mode>("direct");
  const sees: Record<Mode, L> = {
    direct: { en: "sees 10.1.x.x", ja: "10.1.x.x が見える" },
    coip: { en: "sees 192.0.2.x", ja: "192.0.2.x が見える" },
  };
  const W = narrow ? 360 : 900;
  const H = narrow ? 560 : 150;
  // Wide: LAN — LGW/Outpost (inside your DC) — Region. Narrow: top to bottom.
  const b = narrow
    ? { lan: [40, 20, 280, 70], out: [40, 210, 280, 90], reg: [40, 450, 280, 80] }
    : { lan: [30, 80, 200, 80], out: [340, 70, 220, 100], reg: [670, 80, 200, 80] };
  const rect = (k: keyof typeof b, title: L, sub: L, fill: string) => {
    const [x, y, w, h] = b[k];
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={10}
          fill={fill}
          stroke="var(--line)"
          strokeWidth={1.5}
        />
        <text
          x={x + w / 2}
          y={y + h / 2 - 4}
          textAnchor="middle"
          fontSize={16}
          fill="var(--ink)"
        >
          {t(title)}
        </text>
        <text
          x={x + w / 2}
          y={y + h / 2 + 16}
          textAnchor="middle"
          fontSize={13}
          fill="var(--muted)"
        >
          {t(sub)}
        </text>
      </g>
    );
  };
  const lgw = narrow
    ? { x1: 180, y1: 90, x2: 180, y2: 210 }
    : { x1: 230, y1: 120, x2: 340, y2: 120 };
  const sl = narrow
    ? { x1: 180, y1: 300, x2: 180, y2: 450 }
    : { x1: 560, y1: 120, x2: 670, y2: 120 };
  return (
    <div className="panel p-4 sm:p-5">
      <Segmented
        label={{ en: "Local gateway mode", ja: "ローカルゲートウェイのモード" }}
        options={[
          {
            id: "direct",
            label: {
              en: "Direct VPC routing (default)",
              ja: "直接 VPC ルーティング (既定)",
            },
          },
          {
            id: "coip",
            label: { en: "Customer-owned IP (CoIP)", ja: "顧客所有 IP (CoIP)" },
          },
        ]}
        value={mode}
        onChange={setMode}
        color={C}
      />
      <svg
        viewBox={narrow ? `0 0 ${W} ${H}` : `0 45 ${W} ${H}`}
        className="diagram mt-4 block h-auto w-full"
        role="img"
        aria-label={t({
          en: "Outposts rack: local gateway to your LAN, service link to the Region",
          ja: "Outposts ラック: 社内 LAN へはローカルゲートウェイ、リージョンへはサービスリンク",
        })}
      >
        {rect("lan", { en: "Your LAN", ja: "社内 LAN" }, sees[mode], "var(--paper-2)")}
        {rect(
          "out",
          { en: "Outposts rack", ja: "Outposts ラック" },
          { en: "in your data center", ja: "自社データセンター内" },
          "var(--paper)",
        )}
        {rect(
          "reg",
          { en: "Parent Region", ja: "親リージョン" },
          { en: "the rest of the VPC", ja: "VPC の残りの部分" },
          "var(--paper)",
        )}
        <line {...lgw} stroke={C} strokeWidth={6} />
        <line {...sl} stroke="var(--asphalt)" strokeWidth={10} />
        <line {...sl} stroke={C} strokeWidth={5} strokeDasharray="10 6" />
        <text
          x={narrow ? 195 : 285}
          y={narrow ? 155 : 105}
          textAnchor={narrow ? "start" : "middle"}
          fontSize={13}
          fill="var(--ink)"
        >
          {t({ en: "local gateway", ja: "ローカル GW" })}
        </text>
        <text
          x={narrow ? 195 : 615}
          y={narrow ? 380 : 105}
          textAnchor={narrow ? "start" : "middle"}
          fontSize={13}
          fill="var(--ink)"
        >
          {t({ en: "service link", ja: "サービスリンク" })}
        </text>
        <text
          x={narrow ? 195 : 615}
          y={narrow ? 400 : 150}
          textAnchor={narrow ? "start" : "middle"}
          fontSize={13}
          fill="var(--muted)"
        >
          {t({ en: "VPN, MTU 1500", ja: "VPN・MTU 1500" })}
        </text>
        {mode === "coip" && (
          <text
            x={narrow ? 195 : 285}
            y={narrow ? 175 : 150}
            textAnchor={narrow ? "start" : "middle"}
            fontSize={13}
            fill={C}
          >
            {t({ en: "1:1 NAT", ja: "1:1 NAT" })}
          </text>
        )}
      </svg>
      <p className="mt-3 text-sm">
        {mode === "direct"
          ? t({
              en: "Direct VPC routing advertises the Outpost subnets' private IPs to your network over BGP, with no NAT. Use it when the VPC range is unique in your corporate network.",
              ja: "直接 VPC ルーティングは、Outpost サブネットのプライベート IP を BGP でそのまま社内へ広告します (NAT なし)。VPC の範囲が社内で重複しないときに。",
            })
          : t({
              en: "CoIP gives each instance an address from a pool you own; the local gateway does 1:1 NAT. Use it when the VPC range overlaps or must not leak. The two modes are mutually exclusive per local gateway route table.",
              ja: "CoIP では、自社所有のプールから各インスタンスにアドレスを割り当て、ローカルゲートウェイが 1:1 NAT します。VPC の範囲が重複する、または社内に出したくないときに。2 つのモードはローカルゲートウェイのルートテーブル単位で排他です。",
            })}
      </p>
    </div>
  );
}
