import { DiagramBox } from "@/components/ui/DiagramBox";
import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { Toggle } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";

type Spot = "spoke" | "tgw" | "fwA" | "fwB" | "onprem";

interface Step {
  at: Spot;
  /** Which way the packet is going. */
  dir: "out" | "back";
  dropped?: boolean;
  text: L;
}

function steps(appliance: boolean): Step[] {
  const common: Step[] = [
    {
      at: "tgw",
      dir: "out",
      text: {
        en: "A server in a spoke VPC (AZ a) sends to on-prem. The packet enters the Transit Gateway in AZ a.",
        ja: "スポーク VPC (AZ a) のサーバーがオンプレへ送信。パケットは AZ a で Transit Gateway に入ります。",
      },
    },
    {
      at: "fwA",
      dir: "out",
      text: {
        en: "The pre-inspection route table sends everything to the inspection VPC. The TGW keeps the flow in the AZ it entered: firewall A.",
        ja: "検査前ルートテーブルが全通信を検査 VPC へ。TGW は入ってきた AZ のまま流すので、ファイアウォール A へ。",
      },
    },
    {
      at: "onprem",
      dir: "out",
      text: {
        en: "Firewall A records the new flow and lets it through. The TGW sends it over DX (or VPN) to on-prem.",
        ja: "ファイアウォール A が新しいフローを記録して通過させ、TGW が DX (または VPN) でオンプレへ送ります。",
      },
    },
  ];
  if (appliance)
    return [
      ...common,
      {
        at: "fwA",
        dir: "back",
        text: {
          en: "The reply comes back on the DX attachment. Appliance mode on the inspection VPC attachment pins both directions of a flow to one AZ: firewall A again.",
          ja: "応答が DX アタッチメントから戻ります。検査 VPC アタッチメントのアプライアンスモードが、フローの往復を同じ AZ に固定するので、再びファイアウォール A へ。",
        },
      },
      {
        at: "spoke",
        dir: "back",
        text: {
          en: "Firewall A knows this flow and passes the reply to the server. Symmetric, every time.",
          ja: "ファイアウォール A はこのフローを知っているので応答をサーバーへ通します。毎回、往復が対称です。",
        },
      },
    ];
  return [
    ...common,
    {
      at: "fwB",
      dir: "back",
      text: {
        en: "The reply comes back on the DX attachment. Without appliance mode the TGW picks the inspection AZ by flow hash, and this time it picks AZ b: firewall B.",
        ja: "応答が DX アタッチメントから戻ります。アプライアンスモードがないと TGW はフローのハッシュで検査 AZ を選び、今回は AZ b、つまりファイアウォール B へ。",
      },
    },
    {
      at: "fwB",
      dir: "back",
      dropped: true,
      text: {
        en: "Firewall B never saw the request, so a stateful firewall drops the reply. It only happens when the hash lands on the other AZ, which is why it looks intermittent.",
        ja: "ファイアウォール B は往路を見ていないので、ステートフルなファイアウォールは応答を破棄します。ハッシュが別 AZ に当たったときだけ起きるので、「たまに切れる」ように見えます。",
      },
    },
  ];
}

export function ApplianceLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [appliance, setAppliance] = useState(false);
  const [i, setI] = useState(0);
  const list = steps(appliance);
  const s = list[Math.min(i, list.length - 1)];

  // Coordinates of each spot, wide and narrow.
  const P: Record<Spot, [number, number]> = narrow
    ? {
        onprem: [180, 60],
        tgw: [180, 190],
        fwA: [102, 350],
        fwB: [258, 350],
        spoke: [180, 475],
      }
    : {
        onprem: [95, 160],
        tgw: [380, 160],
        fwA: [725, 72],
        fwB: [725, 180],
        spoke: [725, 280],
      };
  const [px, py] = P[s.at];
  const W = narrow ? 360 : 900;
  const H = narrow ? 520 : 320;

  const HALF: Record<Spot, number> = { onprem: 75, tgw: 85, fwA: 60, fwB: 60, spoke: 85 };
  // Roads leave the TGW from the edge facing the other box and bend once.
  // The whole flow rides DX, so both directions use the DX route colour; the
  // reply is dashed, so direction never rests on colour.
  const link = (b: Spot, on: boolean, dashed: boolean) => {
    const [tx, ty] = P.tgw;
    const [bx, by] = P[b];
    let d: string;
    if (narrow) {
      // The spoke road goes around the inspection VPC on the right, so it
      // never looks like it passes through the firewalls.
      const lane = 352;
      d =
        b === "onprem"
          ? `M${tx} ${ty - 24} L${bx} ${by + 24}`
          : b === "spoke"
            ? `M${tx + HALF.tgw} ${ty} C${lane} ${ty} ${lane} ${ty} ${lane} ${ty + 40} L${lane} ${by - 40} C${lane} ${by} ${lane} ${by} ${bx + HALF.spoke} ${by}`
            : `M${tx} ${ty + 24} C${tx} ${ty + 80} ${bx} ${by - 80} ${bx} ${by - 24}`;
    } else if (b === "onprem") {
      d = `M${tx - HALF.tgw} ${ty} L${bx + HALF.onprem} ${by}`;
    } else {
      const sx = tx + HALF.tgw;
      const ex = bx - HALF[b];
      const mx = (sx + ex) / 2;
      d = `M${sx} ${ty} C${mx} ${ty} ${mx} ${by} ${ex} ${by}`;
    }
    return (
      <path
        d={d}
        fill="none"
        stroke={on ? "var(--r-dx)" : "var(--line)"}
        strokeWidth={on ? 5 : 3}
        strokeDasharray={on && dashed ? "9 6" : undefined}
        strokeLinecap="round"
      />
    );
  };
  const visited = new Set(list.slice(0, i + 1).map((x) => x.at));
  const back = s.dir === "back";

  const node = (spot: Spot, label: L, w: number, sub?: L) => {
    const [x, y] = P[spot];
    const dead = s.dropped && spot === s.at;
    return (
      <DiagramBox
        r={{ x: x - w / 2, y: y - 24, w, h: 48 }}
        title={t(label)}
        sub={sub ? t(sub) : undefined}
        fill={spot === "tgw" ? "var(--hub)" : "var(--paper)"}
        stroke={dead ? "var(--bad)" : spot === "tgw" ? "var(--hub)" : "var(--ink)"}
        ink={spot === "tgw" ? "var(--on-hub)" : dead ? "var(--bad)" : "var(--ink)"}
        strokeWidth={dead ? 3 : 1.5}
      />
    );
  };

  return (
    <div className="panel p-4 sm:p-5">
      <Toggle
        label={{
          en: "Appliance mode on the inspection VPC attachment",
          ja: "検査 VPC アタッチメントでアプライアンスモードを有効化",
        }}
        checked={appliance}
        onChange={(v) => {
          setAppliance(v);
          setI(0);
        }}
      />
      <Stepper
        steps={list.map((x) => x.text)}
        index={i}
        onChange={setI}
        color="var(--ink)"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="diagram mt-4 block h-auto w-full"
          role="img"
          aria-label={t({
            en: "Spoke VPC, Transit Gateway, inspection VPC with firewalls in two AZs, and on-prem",
            ja: "スポーク VPC・Transit Gateway・2 AZ にファイアウォールがある検査 VPC・オンプレ",
          })}
        >
          {/* Inspection VPC and spoke VPC frames */}
          {narrow ? (
            <>
              <rect
                x={10}
                y={275}
                width={340}
                height={110}
                rx={10}
                fill="none"
                stroke="var(--asphalt-2)"
                strokeDasharray="5 4"
              />
              <text x={22} y={295} fontSize={13} fill="var(--muted)">
                {t({ en: "Inspection VPC", ja: "検査 VPC" })}
              </text>
            </>
          ) : (
            <>
              <rect
                x={630}
                y={22}
                width={240}
                height={192}
                rx={10}
                fill="none"
                stroke="var(--asphalt-2)"
                strokeDasharray="5 4"
              />
              <text x={858} y={40} textAnchor="end" fontSize={13} fill="var(--muted)">
                {t({ en: "Inspection VPC", ja: "検査 VPC" })}
              </text>
            </>
          )}
          {link("spoke", visited.has("tgw"), false)}
          {link("fwA", visited.has("fwA"), back && s.at === "fwA")}
          {link("fwB", visited.has("fwB"), true)}
          {link("onprem", visited.has("onprem"), false)}
          {node("onprem", { en: "On-prem", ja: "オンプレ" }, 150, {
            en: "via DX",
            ja: "DX 経由",
          })}
          {node("tgw", { en: "Transit Gateway", ja: "Transit Gateway" }, 170)}
          {node("fwA", { en: "Firewall A", ja: "FW A" }, 120, { en: "AZ a", ja: "AZ a" })}
          {node("fwB", { en: "Firewall B", ja: "FW B" }, 120, { en: "AZ b", ja: "AZ b" })}
          {node("spoke", { en: "Spoke VPC server", ja: "スポーク VPC" }, 170, {
            en: "AZ a",
            ja: "AZ a",
          })}
          {/* The packet: a numbered marker that jumps hop to hop, no gliding. */}
          <circle
            cx={px}
            cy={py - 38}
            r={13}
            fill={s.dropped ? "var(--bad)" : "var(--lane)"}
            stroke="var(--asphalt)"
            strokeWidth={2}
          />
          <text
            x={px}
            y={py - 33}
            textAnchor="middle"
            fontSize={14}
            fill={s.dropped ? "var(--on-color)" : "#000"}
          >
            {s.dropped ? "✕" : i + 1}
          </text>
        </svg>
      </Stepper>
    </div>
  );
}
