import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { ROUTE } from "@/data/routes";
import { Stepper } from "@/components/ui/Stepper";
import { OFFICE_EGRESS } from "./policy";

interface Hop {
  label: L;
  sub: L;
}

const HOPS: Hop[] = [
  {
    label: { en: "Your laptop", ja: "社内の PC" },
    sub: { en: "10.1.2.3", ja: "10.1.2.3" },
  },
  {
    label: { en: "Proxy / firewall", ja: "プロキシ / FW" },
    sub: { en: "egress NAT", ja: "出口 NAT" },
  },
  {
    label: { en: "ISP", ja: "ISP" },
    sub: { en: "public internet", ja: "インターネット" },
  },
  {
    label: { en: "AWS edge", ja: "AWS エッジ" },
    sub: { en: "AWS network", ja: "AWS のネットワーク" },
  },
  {
    label: { en: "S3 endpoint", ja: "S3 エンドポイント" },
    sub: { en: "public IP", ja: "パブリック IP" },
  },
];

const STEPS: L[] = [
  {
    en: "Your laptop resolves s3.ap-northeast-1.amazonaws.com to a public IP and opens HTTPS. The request is signed with SigV4: AWS trusts the signature, not your network position.",
    ja: "PC が s3.ap-northeast-1.amazonaws.com をパブリック IP に名前解決し HTTPS を開始。リクエストは SigV4 で署名されていて、AWS が信用するのはネットワーク上の位置ではなく署名です。",
  },
  {
    en: `The corporate proxy or firewall rewrites the source to your egress address, ${OFFICE_EGRESS}. That is the only IP AWS will ever see, and it changes if the network team switches ISPs.`,
    ja: `社内プロキシ / FW が送信元を出口アドレス ${OFFICE_EGRESS} に変換。AWS から見えるのはこの IP だけで、ネットワークチームが ISP を変えれば変わります。`,
  },
  {
    en: "Across the ISP and the internet, TLS is the only lock. Anyone on the path can see the addresses, but not the request inside. There is no network-level encryption on this stretch.",
    ja: "ISP とインターネット上では TLS が唯一の鍵。経路上の誰でもアドレスは見えますが、中身のリクエストは見えません。この区間にネットワーク層の暗号化はありません。",
  },
  {
    en: "At the AWS edge the packet enters the AWS network. Between AWS facilities, traffic is encrypted at the physical layer and stays on the AWS backbone.",
    ja: "AWS エッジでパケットは AWS のネットワークに入ります。AWS の施設間の通信は物理層で暗号化され、AWS のバックボーン上を流れます。",
  },
  {
    en: `S3 checks the signature and the bucket policy. Here aws:SourceIp is ${OFFICE_EGRESS}, so a policy that allows your office range lets it in. AWS API endpoints accept TLS 1.2 or later only (since 2024-02-27).`,
    ja: `S3 は署名とバケットポリシーを確認。ここでの aws:SourceIp は ${OFFICE_EGRESS} なので、オフィスの範囲を許可するポリシーなら通ります。AWS の API エンドポイントは TLS 1.2 以上のみ受け付けます (2024-02-27 以降)。`,
  },
];

/** A walk along the plain internet road, one hop per step. */
export function HopWalk() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [i, setI] = useState(0);
  const color = ROUTE.internet.color;

  const W = narrow ? 360 : 900;
  const H = narrow ? 520 : 210;
  const box = (k: number) =>
    narrow
      ? { x: 70, y: 20 + k * 100, w: 220, h: 64 }
      : { x: 12 + k * 178, y: 70, w: 160, h: 70 };
  const centre = (k: number) => {
    const b = box(k);
    return [b.x + b.w / 2, b.y + b.h / 2] as const;
  };
  const srcIp = i >= 1 ? OFFICE_EGRESS : "10.1.2.3";

  return (
    <div className="panel p-4 sm:p-5">
      {/* Ink, not the slate internet colour, so Next never reads as disabled. */}
      <Stepper steps={STEPS} index={i} onChange={setI} color="var(--ink)">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="diagram block h-auto w-full"
          role="img"
          aria-label={t({
            en: "Hops from your laptop to an S3 public endpoint over the internet",
            ja: "PC からインターネット経由で S3 パブリックエンドポイントまでのホップ",
          })}
        >
          {/* TLS spans the whole road: the only protection end to end. */}
          {narrow ? (
            <>
              <line
                x1={36}
                y1={50}
                x2={36}
                y2={470}
                stroke="var(--ok)"
                strokeWidth={4}
                strokeDasharray="8 6"
              />
              <text x={36} y={505} textAnchor="middle" fontSize={13} fill="var(--ok)">
                TLS
              </text>
            </>
          ) : (
            <>
              <line
                x1={92}
                y1={36}
                x2={806}
                y2={36}
                stroke="var(--ok)"
                strokeWidth={4}
                strokeDasharray="8 6"
              />
              <text x={450} y={24} textAnchor="middle" fontSize={14} fill="var(--ok)">
                {t({
                  en: "TLS: the only lock on this road",
                  ja: "TLS: この道で唯一の鍵",
                })}
              </text>
            </>
          )}
          {HOPS.slice(0, -1).map((_, k) => {
            const [ax, ay] = centre(k);
            const [bx, by] = centre(k + 1);
            const on = k < i;
            return (
              <line
                key={k}
                x1={ax}
                y1={ay}
                x2={bx}
                y2={by}
                stroke={on ? color : "var(--line)"}
                strokeWidth={on ? 7 : 5}
                strokeLinecap="round"
              />
            );
          })}
          {HOPS.map((h, k) => {
            const b = box(k);
            const cur = k === i;
            const awsSide = k >= 3;
            return (
              <g key={k}>
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={8}
                  fill={cur ? "var(--paper)" : "var(--paper-2)"}
                  stroke={cur ? color : awsSide ? "var(--hub)" : "var(--line)"}
                  strokeWidth={cur ? 3 : 1.5}
                  strokeDasharray={awsSide && !cur ? "5 4" : undefined}
                />
                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2 - 4}
                  textAnchor="middle"
                  fontSize={15}
                  fill="var(--ink)"
                >
                  {t(h.label)}
                </text>
                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2 + 15}
                  textAnchor="middle"
                  fontSize={13}
                  fill="var(--muted)"
                >
                  {k === 0 ? "10.1.2.3" : t(h.sub)}
                </text>
              </g>
            );
          })}
          {/* The packet, with the source address AWS would see at this hop. */}
          {(() => {
            const [cx, cy] = centre(i);
            const ly = narrow ? cy : cy + 56;
            const lx = narrow ? cx + 0 : cx;
            return (
              <g>
                <circle
                  cx={narrow ? box(i).x + box(i).w + 22 : cx}
                  cy={narrow ? cy : cy - 44}
                  r={9}
                  fill="var(--lane)"
                  stroke="var(--asphalt)"
                  strokeWidth={2}
                />
                {!narrow && (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    fontSize={13}
                    fill="var(--ink)"
                    className="num"
                  >
                    src {srcIp}
                  </text>
                )}
              </g>
            );
          })()}
        </svg>
        {narrow && <p className="mt-1 num text-sm">src {srcIp}</p>}
      </Stepper>
    </div>
  );
}
