import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { DataTable, Segmented } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { DiagramBox } from "@/components/ui/DiagramBox";
import { ROUTE } from "@/data/routes";
import { reach, type Client, type Result, type Target } from "./reach";

const CLIENTS: { id: Client; label: L }[] = [
  {
    id: "onprem",
    label: { en: "On-prem over DX / VPN", ja: "オンプレ (DX / VPN 経由)" },
  },
  { id: "sameVpc", label: { en: "EC2 in the same VPC", ja: "同じ VPC の EC2" } },
  { id: "otherVpc", label: { en: "Another VPC via TGW", ja: "別 VPC (TGW 経由)" } },
];

interface TargetInfo {
  id: Target;
  label: L;
  title: L;
  sub: L;
  service: L;
}

const TARGETS: TargetInfo[] = [
  {
    id: "gateway",
    label: { en: "Gateway endpoint", ja: "ゲートウェイ型" },
    title: { en: "Gateway endpoint", ja: "ゲートウェイ型" },
    sub: { en: "route-table target, no IP", ja: "ルートの宛先のみ (IP なし)" },
    service: { en: "S3 / DynamoDB", ja: "S3 / DynamoDB" },
  },
  {
    id: "interface",
    label: { en: "Interface endpoint", ja: "インターフェイス型" },
    title: { en: "Interface endpoint", ja: "インターフェイス型" },
    sub: { en: "ENI 10.0.1.15", ja: "ENI 10.0.1.15" },
    service: { en: "AWS API (e.g. KMS)", ja: "AWS API (KMS など)" },
  },
  {
    id: "s3Inbound",
    label: {
      en: "S3 interface, inbound-only DNS",
      ja: "S3 インターフェイス型 (DNS はインバウンドのみ)",
    },
    title: { en: "S3 interface endpoint", ja: "S3 インターフェイス型" },
    sub: { en: "private DNS: inbound only", ja: "DNS はインバウンドのみ" },
    service: { en: "Amazon S3", ja: "Amazon S3" },
  },
  {
    id: "publicVif",
    label: { en: "DX public VIF", ja: "DX パブリック VIF" },
    title: { en: "Public VIF", ja: "パブリック VIF" },
    sub: { en: "AWS public prefixes", ja: "AWS のパブリック経路" },
    service: { en: "AWS public endpoints", ja: "AWS のパブリック API" },
  },
  {
    id: "latticeAssoc",
    label: { en: "Lattice VPC association", ja: "Lattice VPC 関連付け" },
    title: { en: "Lattice association", ja: "Lattice 関連付け" },
    sub: { en: "169.254.171.0/24", ja: "169.254.171.0/24" },
    service: { en: "Lattice service", ja: "Lattice サービス" },
  },
  {
    id: "latticeEndpoint",
    label: { en: "Service network endpoint", ja: "サービスネットワークエンドポイント" },
    title: { en: "Service network", ja: "サービスネットワーク" },
    sub: { en: "endpoint, real VPC IPs", ja: "エンドポイント (VPC の IP)" },
    service: { en: "Lattice service", ja: "Lattice サービス" },
  },
];

const OPTIONS: { id: Result; label: L }[] = [
  { id: "yes", label: { en: "Yes", ja: "届く" } },
  { id: "partial", label: { en: "Yes, with a catch", ja: "届くが落とし穴あり" } },
  { id: "no", label: { en: "No path", ja: "届かない" } },
  { id: "na", label: { en: "Doesn't apply", ja: "対象外" } },
];

const MARK: Record<Result, { sym: string; color: string }> = {
  yes: { sym: "✓", color: "var(--ok)" },
  partial: { sym: "!", color: "var(--warn)" },
  no: { sym: "✕", color: "var(--bad)" },
  na: { sym: "–", color: "var(--muted)" },
};

export function ReachLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [client, setClient] = useState<Client>("onprem");
  const [target, setTarget] = useState<Target>("gateway");
  const key = `${client}-${target}`;
  const v = reach(client, target);
  const info = TARGETS.find((x) => x.id === target)!;
  const color = ROUTE.private.color;

  // Layout. The client sits inside the VPC when it is "same VPC".
  const inside = client === "sameVpc";
  const W = narrow ? 360 : 900;
  const H = narrow ? 440 : 250;
  const L_ = narrow
    ? {
        vpc: inside ? { x: 20, y: 8, w: 320, h: 296 } : { x: 20, y: 120, w: 320, h: 184 },
        client: inside
          ? { x: 70, y: 40, w: 220, h: 64 }
          : { x: 70, y: 20, w: 220, h: 64 },
        target: { x: 50, y: 196, w: 260, h: 72 },
        service: { x: 70, y: 352, w: 220, h: 64 },
      }
    : {
        vpc: inside
          ? { x: 20, y: 30, w: 620, h: 190 }
          : { x: 300, y: 30, w: 340, h: 190 },
        client: inside
          ? { x: 50, y: 90, w: 210, h: 70 }
          : { x: 20, y: 90, w: 170, h: 70 },
        target: { x: 400, y: 90, w: 220, h: 70 },
        service: { x: 700, y: 90, w: 180, h: 70 },
      };
  const c = L_.client;
  const tg = L_.target;
  const s = L_.service;
  const vpcEdge = narrow ? L_.vpc.y : L_.vpc.x;

  const a = narrow
    ? { x: c.x + c.w / 2, y: c.y + c.h }
    : { x: c.x + c.w, y: c.y + c.h / 2 };
  const b = narrow ? { x: tg.x + tg.w / 2, y: tg.y } : { x: tg.x, y: tg.y + tg.h / 2 };
  const b2 = narrow
    ? { x: tg.x + tg.w / 2, y: tg.y + tg.h }
    : { x: tg.x + tg.w, y: tg.y + tg.h / 2 };
  const d = narrow ? { x: s.x + s.w / 2, y: s.y } : { x: s.x, y: s.y + s.h / 2 };

  const stop = narrow ? { x: a.x, y: vpcEdge } : { x: vpcEdge, y: a.y };
  const blocked = v.result === "no";
  const lineColor =
    v.result === "no" ? "var(--bad)" : v.result === "na" ? "var(--muted)" : color;
  const dash = v.result === "na" ? "6 6" : undefined;

  const linkLabel: L | null =
    client === "onprem"
      ? { en: "DX / VPN", ja: "DX / VPN" }
      : client === "otherVpc"
        ? { en: "Transit Gateway", ja: "Transit Gateway" }
        : null;

  return (
    <div className="grid gap-5">
      <div className="panel p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold text-[var(--muted)]">
              {t({ en: "Who is asking", ja: "誰から" })}
            </p>
            <Segmented
              label={{ en: "Client", ja: "クライアント" }}
              options={CLIENTS}
              value={client}
              onChange={setClient}
              color={color}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-[var(--muted)]">
              {t({ en: "Which endpoint it aims at", ja: "どのエンドポイント宛てか" })}
            </p>
            <Segmented
              label={{ en: "Endpoint type", ja: "エンドポイントの種類" }}
              options={TARGETS.map(({ id, label }) => ({ id, label }))}
              value={target}
              onChange={setTarget}
              color={color}
            />
          </div>
        </div>
      </div>

      {/* The diagram answers the question, so it sits locked under it until
          you guess (or skip). Changing the scenario re-arms the question. */}
      <Predict
        resetKey={key}
        question={{
          en: "Can this request reach the service through this endpoint?",
          ja: "このリクエストはこのエンドポイント経由でサービスに届く?",
        }}
        options={OPTIONS}
        answer={v.result}
        why={<p>{t(v.why)}</p>}
      >
        <div className="panel p-4 sm:p-5">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="diagram block h-auto w-full"
            role="img"
            aria-label={`${t(CLIENTS.find((x) => x.id === client)!.label)} → ${t(info.label)} → ${t(info.service)}`}
          >
            <rect
              x={L_.vpc.x}
              y={L_.vpc.y}
              width={L_.vpc.w}
              height={L_.vpc.h}
              rx={12}
              fill="var(--paper-2)"
              stroke="var(--asphalt-2)"
              strokeWidth={1.5}
              strokeDasharray={target === "publicVif" ? "4 6" : undefined}
            />
            <text x={L_.vpc.x + 12} y={L_.vpc.y + 22} fontSize={13} fill="var(--muted)">
              {target === "publicVif"
                ? t({ en: "AWS edge", ja: "AWS エッジ" })
                : t({ en: "VPC 10.0.0.0/16", ja: "VPC 10.0.0.0/16" })}
            </text>

            {/* The road from the client to the endpoint, then on to the service. */}
            <path
              d={`M${a.x} ${a.y} L${blocked ? stop.x : b.x} ${blocked ? stop.y : b.y}`}
              stroke={lineColor}
              strokeWidth={5}
              strokeDasharray={dash}
              strokeLinecap="round"
            />
            {!blocked && (
              <path
                d={`M${b2.x} ${b2.y} L${d.x} ${d.y}`}
                stroke={lineColor}
                strokeWidth={5}
                strokeDasharray={dash}
                strokeLinecap="round"
              />
            )}
            {linkLabel && (
              <text
                x={narrow ? a.x + 14 : (a.x + stop.x) / 2}
                y={narrow ? (a.y + stop.y) / 2 + 5 : a.y - 12}
                textAnchor={narrow ? "start" : "middle"}
                fontSize={13}
                fill="var(--muted)"
              >
                {t(linkLabel)}
              </text>
            )}
            {blocked && (
              <g transform={`translate(${stop.x} ${stop.y})`}>
                {/* A drawn cross, not a glyph: it sits on the VPC's edge on purpose. */}
                <circle r={14} fill="var(--bad)" />
                <path
                  d="M-5 -5 L5 5 M5 -5 L-5 5"
                  stroke="var(--on-color)"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              </g>
            )}

            <DiagramBox
              r={c}
              title={t(
                client === "onprem"
                  ? { en: "On-prem host", ja: "オンプレのホスト" }
                  : client === "sameVpc"
                    ? { en: "EC2 in this VPC", ja: "この VPC の EC2" }
                    : { en: "EC2 in a spoke VPC", ja: "スポーク VPC の EC2" },
              )}
              sub={
                client === "onprem"
                  ? "10.10.1.20"
                  : client === "sameVpc"
                    ? "10.0.3.7"
                    : "10.1.3.7"
              }
              stroke="var(--line)"
              strokeWidth={2}
              fontSize={15}
            />
            <DiagramBox
              r={tg}
              title={t(info.title)}
              sub={t(info.sub)}
              stroke={color}
              dash={target === "gateway" ? "5 4" : undefined}
              strokeWidth={2}
              fontSize={15}
            />
            <DiagramBox
              r={s}
              title={t(info.service)}
              stroke="var(--line)"
              fill="var(--paper-2)"
              strokeWidth={2}
              fontSize={15}
            />

            {/* A verdict badge pinned to the target's corner, overlapping its edge
                on purpose (so it carries its own transform). */}
            <circle
              cx={tg.x + tg.w - 4}
              cy={tg.y + 4}
              r={14}
              fill={MARK[v.result].color}
            />
            <text
              transform={`translate(${tg.x + tg.w - 4} ${tg.y + 10})`}
              textAnchor="middle"
              fontSize={17}
              fill="var(--on-color)"
            >
              {MARK[v.result].sym}
            </text>
          </svg>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {t({
              en: "A dashed box is a gateway endpoint: it has no IP address of its own, only an entry in the route table.",
              ja: "破線の箱はゲートウェイ型エンドポイント。自前の IP アドレスはなく、ルートテーブルの 1 行にすぎません。",
            })}
          </p>
        </div>
      </Predict>

      <details className="panel p-4">
        <summary className="cursor-pointer font-bold">
          {t({ en: "Show the whole answer grid", ja: "全組み合わせの答えを見る" })}
        </summary>
        <div className="mt-3">
          <DataTable
            columns={[
              { en: "Endpoint", ja: "エンドポイント" },
              ...CLIENTS.map((cl) => cl.label),
            ]}
            rows={TARGETS.map((tgt) => [
              t(tgt.label),
              ...CLIENTS.map((cl) => {
                const r = reach(cl.id, tgt.id).result;
                return (
                  <span key={cl.id}>
                    <span
                      className="font-black"
                      style={{ color: MARK[r].color }}
                      aria-hidden="true"
                    >
                      {MARK[r].sym}
                    </span>{" "}
                    {t(OPTIONS.find((o) => o.id === r)!.label)}
                  </span>
                );
              }),
            ])}
          />
        </div>
      </details>
    </div>
  );
}
