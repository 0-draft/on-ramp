import type { L } from "@/i18n/lang";
import { useId } from "react";
import { useLang } from "@/i18n/useLang";

export type HubKind = "vgw" | "dxgw" | "tgw" | "cloudwan";

/**
 * A thumbnail of each hub's scope: what it attaches, and whether a packet can
 * go VPC to VPC through it (a crossed-out arrow when it cannot). Drawn small
 * on purpose; the table next to it carries the details.
 */
export function HubSketch({ kind }: { kind: HubKind }) {
  const { t } = useLang();
  const arrow = `hs-arrow-${useId()}`;
  const vpc = (x: number, y: number, key: string) => (
    <g key={key}>
      <rect
        x={x}
        y={y}
        width={56}
        height={28}
        rx={5}
        fill="var(--paper)"
        stroke="var(--ink)"
      />
      <text x={x + 28} y={y + 19} textAnchor="middle" fontSize={13} fill="var(--ink)">
        VPC
      </text>
    </g>
  );
  const hub = (x: number, y: number, w: number, label: string, dashed = false) => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={30}
        rx={6}
        fill={dashed ? "var(--paper)" : "var(--hub)"}
        stroke="var(--hub)"
        strokeWidth={2}
        strokeDasharray={dashed ? "5 4" : undefined}
      />
      <text
        x={x + w / 2}
        y={y + 20}
        textAnchor="middle"
        fontSize={13}
        fill={dashed ? "var(--ink)" : "var(--on-hub)"}
      >
        {label}
      </text>
    </g>
  );
  const line = (d: string, key: string, dashed = false) => (
    <path
      key={key}
      d={d}
      fill="none"
      stroke="var(--asphalt-2)"
      strokeWidth={2.5}
      strokeDasharray={dashed ? "4 4" : undefined}
    />
  );
  const onprem = (
    <g>
      <rect
        x={6}
        y={56}
        width={58}
        height={28}
        rx={5}
        fill="var(--paper-2)"
        stroke="var(--line)"
      />
      <text x={35} y={75} textAnchor="middle" fontSize={13} fill="var(--ink)">
        {t({ en: "On-prem", ja: "社内" })}
      </text>
    </g>
  );
  /** VPC-to-VPC through the hub: allowed or not. */
  const vpcToVpc = (ok: boolean, x: number) => (
    <g>
      <path
        d={`M${x} 34 L${x} 106`}
        stroke={ok ? "var(--ok)" : "var(--bad)"}
        strokeWidth={2.5}
        markerEnd={`url(#${arrow})`}
      />
      <text
        x={x - 22}
        y={74}
        fontSize={15}
        fontWeight={800}
        fill={ok ? "var(--ok)" : "var(--bad)"}
      >
        {ok ? "✓" : "✕"}
      </text>
    </g>
  );

  /** A faint dashed boundary showing how far the hub reaches. */
  const scope = (
    x: number,
    y: number,
    w: number,
    h: number,
    text: L,
    tx: number,
    ty: number,
  ) => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill="none"
        stroke="var(--asphalt-2)"
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.7}
      />
      <text x={tx} y={ty} fontSize={11} fill="var(--muted)">
        {t(text)}
      </text>
    </g>
  );

  const label: Record<HubKind, L> = {
    vgw: { en: "One VPC, one Region", ja: "VPC 1 つ・1 リージョン" },
    dxgw: { en: "Maps only: no packet passes", ja: "経路を配るだけ: パケットは通らない" },
    tgw: { en: "VPC to VPC in one Region", ja: "1 リージョン内で VPC 間も通る" },
    cloudwan: {
      en: "One network across Regions",
      ja: "リージョンをまたぐ 1 つのネットワーク",
    },
  };

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 260 140"
        className="diagram block h-auto w-full"
        role="img"
        aria-label={t(label[kind])}
      >
        <defs>
          <marker
            id={arrow}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="var(--asphalt-2)" />
          </marker>
        </defs>
        {onprem}
        {kind === "vgw" && (
          <>
            {scope(98, 46, 150, 50, { en: "one VPC", ja: "VPC 1 つ" }, 100, 40)}
            {line("M64 70 L104 70", "a")}
            {hub(104, 55, 50, "VGW")}
            {line("M154 70 L184 70", "b")}
            {vpc(184, 56, "v")}
          </>
        )}
        {kind === "dxgw" && (
          <>
            {scope(90, 49, 76, 42, { en: "control plane", ja: "制御だけ" }, 92, 44)}
            {line("M64 70 L96 70", "a")}
            {hub(96, 55, 64, "DXGW", true)}
            {line("M160 64 C175 64 175 22 190 22", "b", true)}
            {line("M160 76 C175 76 175 118 190 118", "c", true)}
            {vpc(190, 8, "v1")}
            {vpc(190, 104, "v2")}
            <text
              x={222}
              y={74}
              textAnchor="middle"
              fontSize={20}
              fontWeight={800}
              fill="var(--bad)"
            >
              ✕
            </text>
          </>
        )}
        {kind === "tgw" && (
          <>
            {scope(88, 2, 168, 136, { en: "one Region", ja: "1 リージョン" }, 94, 18)}
            {line("M64 70 L96 70", "a")}
            {hub(96, 55, 52, "TGW")}
            {line("M148 64 C165 64 165 22 184 22", "b")}
            {line("M148 76 C165 76 165 118 184 118", "c")}
            {vpc(184, 8, "v1")}
            {vpc(184, 104, "v2")}
            {vpcToVpc(true, 248)}
          </>
        )}
        {kind === "cloudwan" && (
          <>
            {scope(76, 2, 180, 136, { en: "global", ja: "全リージョン" }, 140, 18)}
            {line("M64 70 L86 70", "a")}
            {hub(86, 22, 48, "CNE")}
            {hub(86, 90, 48, "CNE")}
            {line("M110 52 L110 90", "m")}
            {line("M86 70 L86 37", "x")}
            {line("M134 37 L184 22", "b")}
            {line("M134 105 L184 118", "c")}
            {vpc(184, 8, "v1")}
            {vpc(184, 104, "v2")}
            {vpcToVpc(true, 248)}
          </>
        )}
      </svg>
      <figcaption className="mt-1 text-sm font-semibold">{t(label[kind])}</figcaption>
    </figure>
  );
}
