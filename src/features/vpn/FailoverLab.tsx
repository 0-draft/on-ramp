import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { ROUTE } from "@/data/routes";
import { Toggle } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";
import { road } from "@/features/map/geometry";
import { failoverFrame, type TunnelState } from "./failover";

const TWO: L[] = [
  {
    en: "Both tunnels are up, each ending in a different Availability Zone. Your side may send on both; AWS sends back to you on one tunnel (here tunnel 1).",
    ja: "トンネルは 2 本とも稼働中で、それぞれ別のアベイラビリティーゾーンに終端。社内側は両方に送れますが、AWS から社内への戻りは 1 本 (ここではトンネル 1) を使います。",
  },
  {
    en: "AWS starts replacing tunnel 1's endpoint: patching, hardware retirement or an unhealthy endpoint. It replaces one tunnel at a time, and the outside IP does not change.",
    ja: "AWS がトンネル 1 のエンドポイントの交換を開始 (パッチ適用、ハードウェア退役、不調など)。交換は 1 本ずつで、外部 IP は変わりません。",
  },
  {
    en: "Tunnel 1 stops answering. Dead peer detection notices: AWS sends R-U-THERE every 10 seconds, and when the DPD timeout runs out it ends the tunnel (30 s minimum; the default is 40 s in the user guide and 30 s in the API reference). With BGP, the 30-second hold timer can expire first.",
    ja: "トンネル 1 が応答しなくなり、DPD (デッドピア検出) が気付きます。AWS は 10 秒ごとに R-U-THERE を送り、DPD タイムアウトが切れるとトンネルを終了 (最小 30 秒。既定値はユーザーガイドでは 40 秒、API リファレンスでは 30 秒)。BGP なら 30 秒のホールドタイマーが先に切れることも。",
  },
  {
    en: "Traffic moves to tunnel 2. You have lost redundancy, not connectivity. This is why your customer gateway must accept traffic arriving on either tunnel (asymmetric routing).",
    ja: "通信はトンネル 2 へ。失ったのは冗長性で、接続ではありません。だからカスタマーゲートウェイはどちらのトンネルから来た通信も受け入れる (非対称ルーティングを許す) 必要があります。",
  },
  {
    en: "Tunnel 1 comes back with the same outside IP. With the default startup action (Add), your device must start IKE again; with IKEv1 and no traffic, a tunnel can stay down until it does.",
    ja: "トンネル 1 が同じ外部 IP で復帰。既定の起動アクション (Add) では社内機器から IKE を張り直す必要があり、IKEv1 で通信がないと張り直すまで down のままのことも。",
  },
];

const ONE: Record<number, L> = {
  2: {
    en: "Tunnel 1 stops answering, and there is no second tunnel configured. Everything between your network and AWS is now down, during routine maintenance.",
    ja: "トンネル 1 が応答しなくなり、2 本目は設定されていません。社内と AWS の間の通信がすべて停止。しかも定例メンテナンスの最中に。",
  },
  3: {
    en: "Still down. AWS documents that a single-tunnel setup loses connectivity during each endpoint replacement. Configure both tunnels on your device.",
    ja: "まだ停止中。AWS は、トンネル 1 本だけの構成はエンドポイント交換のたびに接続を失うと明記しています。社内機器で 2 本とも設定しましょう。",
  },
  4: {
    en: "Tunnel 1 comes back with the same outside IP, but only once your device starts IKE again (startup action Add). Until then, the outage continues.",
    ja: "トンネル 1 は同じ外部 IP で復帰。ただし社内機器が IKE を張り直してから (起動アクション Add)。それまで停止は続きます。",
  },
};

const STATE: Record<TunnelState, { label: L; stroke: string; dash?: string }> = {
  up: { label: { en: "up", ja: "稼働" }, stroke: "var(--r-vpn)", dash: "10 6" },
  replacing: {
    label: { en: "replacing", ja: "交換中" },
    stroke: "var(--lane)",
    dash: "4 6",
  },
  down: { label: { en: "down", ja: "停止" }, stroke: "var(--bad)", dash: "2 8" },
  off: {
    label: { en: "not configured", ja: "未設定" },
    stroke: "var(--line)",
    dash: "2 8",
  },
};

function Box({
  b,
  title,
  sub,
  fill = "var(--paper)",
  ink = "var(--ink)",
  stroke = "var(--line)",
}: {
  b: { x: number; y: number; w: number; h: number };
  title: string;
  sub?: string;
  fill?: string;
  ink?: string;
  stroke?: string;
}) {
  return (
    <g>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
      <text
        x={b.x + b.w / 2}
        y={b.y + b.h / 2 + (sub ? -4 : 5)}
        textAnchor="middle"
        fontSize={15}
        fill={ink}
      >
        {title}
      </text>
      {sub && (
        <text
          x={b.x + b.w / 2}
          y={b.y + b.h / 2 + 15}
          textAnchor="middle"
          fontSize={13}
          fill={ink}
          opacity={0.85}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

export function FailoverLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [i, setI] = useState(0);
  const [oneTunnel, setOneTunnel] = useState(false);
  const f = failoverFrame(i, oneTunnel);
  const steps = TWO.map((s, k) => (oneTunnel && ONE[k] ? ONE[k] : s));
  const color = ROUTE.vpn.color;

  // Wide: left to right. Narrow: top to bottom.
  const W = narrow ? 360 : 900;
  const H = narrow ? 470 : 280;
  const cgw = narrow ? { x: 20, y: 20, w: 320, h: 60 } : { x: 20, y: 100, w: 180, h: 80 };
  const hub = narrow
    ? { x: 20, y: 390, w: 320, h: 60 }
    : { x: 690, y: 100, w: 196, h: 80 };
  const ep = (n: 1 | 2) =>
    narrow
      ? { x: n === 1 ? 20 : 190, y: 205, w: 150, h: 64 }
      : { x: 400, y: n === 1 ? 40 : 176, w: 190, h: 64 };
  const tunnelD = (n: 1 | 2) => {
    const e = ep(n);
    if (narrow) {
      const x = e.x + e.w / 2;
      return `M${x} 80 L${x} ${e.y} M${x} ${e.y + e.h} L${x} 390`;
    }
    const y = e.y + e.h / 2;
    return `${road([
      [200, n === 1 ? 128 : 152],
      [400, y],
    ])} ${road([
      [590, y],
      [690, n === 1 ? 128 : 152],
    ])}`;
  };

  return (
    <div className="panel p-4 sm:p-5">
      <div className="mb-3">
        <Toggle
          label={{
            en: "Only tunnel 1 configured on my device",
            ja: "社内機器でトンネル 1 しか設定していない",
          }}
          checked={oneTunnel}
          onChange={setOneTunnel}
        />
      </div>
      <Stepper steps={steps} index={i} onChange={setI} color={color}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="diagram block h-auto w-full"
          role="img"
          aria-label={t({
            en: "Customer gateway with two IPsec tunnels to AWS endpoints in two Availability Zones",
            ja: "2 つの AZ の AWS エンドポイントへ IPsec トンネル 2 本を張るカスタマーゲートウェイ",
          })}
        >
          {([1, 2] as const).map((n) => {
            const st = n === 1 ? f.t1 : f.t2;
            const s = STATE[st];
            const carrying = f.awsEgress === (n === 1 ? "t1" : "t2");
            return (
              <g key={n}>
                <path
                  d={tunnelD(n)}
                  fill="none"
                  stroke="var(--asphalt)"
                  strokeWidth={carrying ? 13 : 9}
                  strokeLinecap="round"
                  opacity={st === "off" ? 0.25 : 1}
                />
                <path
                  d={tunnelD(n)}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth={carrying ? 6 : 4}
                  strokeDasharray={s.dash}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
          <Box
            b={cgw}
            title={t({ en: "Customer gateway", ja: "カスタマーゲートウェイ" })}
            sub={t({ en: "your router", ja: "自社ルーター" })}
          />
          <Box
            b={hub}
            title="VGW / Transit Gateway"
            sub={t({ en: "AWS side", ja: "AWS 側" })}
            fill="var(--sign)"
            ink="#fff"
            stroke="var(--sign)"
          />
          {([1, 2] as const).map((n) => {
            const st = n === 1 ? f.t1 : f.t2;
            const carrying = f.awsEgress === (n === 1 ? "t1" : "t2");
            return (
              <Box
                key={n}
                b={ep(n)}
                title={`${t({ en: "Tunnel", ja: "トンネル" })} ${n} · AZ ${n === 1 ? "a" : "b"}`}
                sub={t(STATE[st].label)}
                stroke={carrying ? "var(--ink)" : STATE[st].stroke}
              />
            );
          })}
          {f.awsEgress &&
            (() => {
              const e = ep(f.awsEgress === "t1" ? 1 : 2);
              const t2 = f.awsEgress === "t2";
              // Narrow: tunnel 1's tag sits right of its line, tunnel 2's left of it.
              const x = narrow ? e.x + e.w / 2 + (t2 ? -12 : 12) : 645;
              const y = narrow ? 335 : e.y + e.h / 2 + (f.awsEgress === "t1" ? -18 : 34);
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={narrow ? (t2 ? "end" : "start") : "middle"}
                  fontSize={13}
                  fill="var(--ink)"
                >
                  {narrow
                    ? t({ en: "↑ AWS to you", ja: "↑ AWS から社内" })
                    : t({ en: "← AWS to you", ja: "← AWS から社内" })}
                </text>
              );
            })()}
        </svg>
        <p
          className="mt-2 text-sm font-bold"
          style={{ color: f.awsEgress ? "var(--ok)" : "var(--bad)" }}
        >
          {f.awsEgress
            ? t({ en: "Connected", ja: "接続中" })
            : t({ en: "Outage: no working tunnel", ja: "停止: 使えるトンネルがない" })}
        </p>
      </Stepper>
    </div>
  );
}
