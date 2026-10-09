import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ROUTE, ROUTES, type RouteId } from "@/data/routes";
import { road, type Pt } from "./geometry";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  label: L;
  sub?: L;
}

// Places on the map. Left: your side. Middle: the roads in between. Right:
// the AWS Region with one VPC.
const BOX = {
  dc: {
    x: 30,
    y: 72,
    w: 180,
    h: 76,
    label: { en: "Data center / HQ", ja: "データセンター / 本社" },
  },
  branch: {
    x: 30,
    y: 214,
    w: 180,
    h: 60,
    label: { en: "Branch office", ja: "支社・拠点" },
  },
  people: {
    x: 30,
    y: 340,
    w: 180,
    h: 60,
    label: { en: "People, anywhere", ja: "社員 (どこからでも)" },
  },
  outpost: {
    x: 30,
    y: 460,
    w: 180,
    h: 60,
    label: { en: "Outposts rack", ja: "Outposts ラック" },
  },
  dxloc: {
    x: 370,
    y: 296,
    w: 160,
    h: 64,
    label: { en: "DX location", ja: "DX ロケーション" },
    sub: { en: "colocation building", ja: "コロケーション施設" },
  },
  pub: {
    x: 690,
    y: 48,
    w: 140,
    h: 60,
    label: { en: "Public endpoints", ja: "パブリック エンドポイント" },
    sub: { en: "S3, APIs, ALB", ja: "S3・API・ALB" },
  },
  hub: {
    x: 690,
    y: 236,
    w: 120,
    h: 80,
    label: { en: "Gateway hub", ja: "ゲートウェイ" },
    sub: { en: "VGW, TGW, Cloud WAN", ja: "VGW・TGW・Cloud WAN" },
  },
  access: {
    x: 690,
    y: 400,
    w: 120,
    h: 60,
    label: { en: "User access", ja: "ユーザー接続" },
    sub: { en: "Client VPN, AVA", ja: "Client VPN・AVA" },
  },
  app: { x: 846, y: 190, w: 120, h: 50, label: { en: "Your app", ja: "アプリ" } },
  endpoint: {
    x: 846,
    y: 290,
    w: 120,
    h: 50,
    label: { en: "VPC endpoint", ja: "VPC エンドポイント" },
  },
  resolver: {
    x: 846,
    y: 372,
    w: 120,
    h: 50,
    label: { en: "Resolver", ja: "Resolver" },
    sub: { en: "inbound endpoint", ja: "インバウンド" },
  },
} satisfies Record<string, Box>;

/** The roads, as points from your side to AWS. Lanes are offset a few
 * pixels where several routes share a stretch, as on a real road atlas. */
const PATHS: Record<RouteId, Pt[]> = {
  internet: [
    [210, 90],
    [330, 150],
    [570, 150],
    [690, 78],
  ],
  vpn: [
    [210, 236],
    [330, 168],
    [570, 168],
    [690, 252],
    [810, 252],
    [846, 210],
  ],
  sdwan: [
    [210, 252],
    [330, 186],
    [570, 186],
    [690, 266],
    [810, 266],
    [846, 222],
  ],
  people: [
    [210, 370],
    [330, 204],
    [570, 204],
    [690, 430],
    [810, 430],
    [846, 232],
  ],
  dx: [
    [210, 106],
    [370, 316],
    [530, 316],
    [690, 280],
    [810, 280],
    [846, 200],
  ],
  private: [
    [210, 120],
    [370, 330],
    [530, 330],
    [690, 294],
    [810, 294],
    [846, 315],
  ],
  dns: [
    [210, 134],
    [370, 344],
    [530, 344],
    [690, 306],
    [810, 306],
    [846, 397],
  ],
  edge: [
    [210, 490],
    [600, 490],
    [836, 490],
  ],
};

const D: Record<RouteId, string> = Object.fromEntries(
  Object.entries(PATHS).map(([k, v]) => [k, road(v)]),
) as Record<RouteId, string>;

function Place({ b, active }: { b: Box; active: boolean }) {
  const { t } = useLang();
  const cy = b.y + b.h / 2;
  return (
    <g>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={8}
        fill="var(--paper)"
        stroke={active ? "var(--ink)" : "var(--line)"}
        strokeWidth={active ? 2.5 : 1.5}
      />
      <text
        x={b.x + b.w / 2}
        y={b.sub ? cy - 4 : cy + 5}
        textAnchor="middle"
        fontSize={14}
        fill="var(--ink)"
      >
        {t(b.label)}
      </text>
      {b.sub && (
        <text
          x={b.x + b.w / 2}
          y={cy + 14}
          textAnchor="middle"
          fontSize={11}
          fill="var(--muted)"
        >
          {t(b.sub)}
        </text>
      )}
    </g>
  );
}

// Which places each route touches, so the selected route lights them up.
const TOUCH: Record<RouteId, (keyof typeof BOX)[]> = {
  internet: ["dc", "pub"],
  vpn: ["branch", "hub", "app"],
  sdwan: ["branch", "hub", "app"],
  people: ["people", "access", "app"],
  dx: ["dc", "dxloc", "hub", "app"],
  private: ["dc", "dxloc", "hub", "endpoint"],
  dns: ["dc", "dxloc", "hub", "resolver"],
  edge: ["outpost"],
};

export function RoadMap({
  selected,
  onSelect,
}: {
  selected: RouteId | null;
  onSelect: (id: RouteId) => void;
}) {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const lit = new Set(selected ? TOUCH[selected] : []);
  const order = ROUTES.map((r) => r.id).sort((a, b) =>
    a === selected ? 1 : b === selected ? -1 : 0,
  );

  return (
    <svg
      viewBox="0 0 1000 560"
      className="diagram block h-auto w-full"
      role="group"
      aria-label={t({
        en: "Road map of every path from your network into AWS",
        ja: "社内ネットワークから AWS への全経路の道路地図",
      })}
    >
      {/* Zones */}
      <rect x={10} y={20} width={220} height={520} rx={14} fill="var(--paper-2)" />
      <rect
        x={670}
        y={20}
        width={320}
        height={520}
        rx={14}
        fill="var(--paper-2)"
        stroke="var(--sign)"
        strokeWidth={2}
        strokeDasharray="6 5"
      />
      <rect
        x={836}
        y={164}
        width={140}
        height={340}
        rx={10}
        fill="none"
        stroke="var(--asphalt-2)"
        strokeWidth={1.5}
      />
      <text x={22} y={44} fontSize={13} fill="var(--muted)">
        {t({ en: "Your network", ja: "社内ネットワーク" })}
      </text>
      <text x={682} y={40} fontSize={13} fill="var(--sign)">
        {t({ en: "AWS Region", ja: "AWS リージョン" })}
      </text>
      <text x={846} y={182} fontSize={12} fill="var(--muted)">
        VPC
      </text>
      <text x={450} y={44} textAnchor="middle" fontSize={13} fill="var(--muted)">
        {t({ en: "In between", ja: "その間" })}
      </text>

      {/* The internet is a cloud the overlays tunnel through. */}
      <ellipse
        cx={450}
        cy={177}
        rx={132}
        ry={62}
        fill="var(--paper-2)"
        stroke="var(--line)"
        strokeWidth={1.5}
      />
      <text x={450} y={128} textAnchor="middle" fontSize={13} fill="var(--muted)">
        {t({ en: "Internet", ja: "インターネット" })}
      </text>

      {/* Roads: a dark asphalt bed, then the colored route line on top. */}
      {order.map((id) => {
        const r = ROUTE[id];
        const on = selected === id;
        const dim = selected !== null && !on;
        return (
          <g key={id} opacity={dim ? 0.18 : 1}>
            <path
              d={D[id]}
              fill="none"
              stroke="var(--asphalt)"
              strokeWidth={on ? 11 : 8}
              strokeLinecap="round"
            />
            <path
              d={D[id]}
              fill="none"
              stroke={r.color}
              strokeWidth={on ? 6 : 4}
              strokeLinecap="round"
              strokeDasharray={r.kind === "overlay" ? "10 5" : undefined}
            />
            {on && !reduced && (
              <circle r={7} fill="var(--lane)" stroke="var(--asphalt)" strokeWidth={2}>
                <animateMotion dur="3.2s" repeatCount="indefinite" path={D[id]} />
              </circle>
            )}
            {/* A wide invisible stroke makes thin roads easy to hit. */}
            <path
              d={D[id]}
              fill="none"
              stroke="transparent"
              strokeWidth={22}
              className="cursor-pointer"
              onClick={() => onSelect(id)}
            >
              <title>{t(r.name)}</title>
            </path>
          </g>
        );
      })}

      {(Object.keys(BOX) as (keyof typeof BOX)[]).map((k) => (
        <Place key={k} b={BOX[k]} active={lit.has(k)} />
      ))}
      <text x={600} y={480} textAnchor="middle" fontSize={11} fill="var(--muted)">
        {t({ en: "service link", ja: "サービスリンク" })}
      </text>
    </svg>
  );
}
