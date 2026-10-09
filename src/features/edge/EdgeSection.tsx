import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { Callout, Section, Segmented, Sources } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { humanDuration, transferSeconds } from "./transfer";

const C = "var(--r-edge)";

type Mode = "direct" | "coip";

function OutpostsDiagram() {
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

type LzPath = "dxvgw" | "dxtgw" | "vpn" | "internet";
const LZ: Record<LzPath, { label: L; hairpin: boolean; why: L }> = {
  dxvgw: {
    label: { en: "DX → VGW", ja: "DX → VGW" },
    hairpin: false,
    why: {
      en: "A private VIF to a VGW takes the shortest path to the Local Zone, not through the parent Region.",
      ja: "VGW へのプライベート VIF は最短経路で Local Zone へ。親リージョンを経由しません。",
    },
  },
  dxtgw: {
    label: { en: "DX → Transit Gateway", ja: "DX → Transit Gateway" },
    hairpin: true,
    why: {
      en: "Transit Gateway cannot attach Local Zone subnets, so traffic detours through the parent Region and loses the latency benefit.",
      ja: "Transit Gateway は Local Zone のサブネットをアタッチできないため、親リージョンを迂回して低遅延の利点が消えます。",
    },
  },
  vpn: {
    label: { en: "Site-to-Site VPN", ja: "Site-to-Site VPN" },
    hairpin: true,
    why: {
      en: "The VPN terminates in the parent Region (VGW or TGW), so it hairpins too. A self-managed VPN on EC2 in the Local Zone is the workaround.",
      ja: "VPN は親リージョン (VGW / TGW) で終端するので、これも迂回します。回避策は Local Zone 内 EC2 で自前の VPN。",
    },
  },
  internet: {
    label: { en: "Internet", ja: "インターネット" },
    hairpin: false,
    why: {
      en: "Internet traffic enters and leaves from the Local Zone itself.",
      ja: "インターネット通信は Local Zone 自体から出入りします。",
    },
  },
};

function LocalZoneLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [p, setP] = useState<LzPath>("dxvgw");
  const r = LZ[p];
  const W = narrow ? 360 : 900;
  const H = narrow ? 300 : 220;
  const office = narrow ? [20, 200, 140, 60] : [30, 140, 180, 60];
  const lz = narrow ? [200, 200, 140, 60] : [380, 140, 180, 60];
  const reg = narrow ? [110, 30, 140, 60] : [690, 20, 180, 60];
  const mid = (b: number[]) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
  const [ox, oy] = mid(office);
  const [lx, ly] = mid(lz);
  const [rx, ry] = mid(reg);
  const d = r.hairpin
    ? `M${ox} ${oy} Q${(ox + rx) / 2} ${ry} ${rx} ${ry} Q${(rx + lx) / 2} ${ry + 40} ${lx} ${ly}`
    : `M${ox} ${oy} L${lx} ${ly}`;
  const box = (b: number[], title: L) => (
    <g>
      <rect
        x={b[0]}
        y={b[1]}
        width={b[2]}
        height={b[3]}
        rx={10}
        fill="var(--paper)"
        stroke="var(--line)"
        strokeWidth={1.5}
      />
      <text
        x={b[0] + b[2] / 2}
        y={b[1] + b[3] / 2 + 5}
        textAnchor="middle"
        fontSize={15}
        fill="var(--ink)"
      >
        {t(title)}
      </text>
    </g>
  );
  return (
    <div className="panel p-4 sm:p-5">
      <Segmented
        label={{ en: "Path to the Local Zone", ja: "Local Zone への経路" }}
        options={(Object.keys(LZ) as LzPath[]).map((k) => ({
          id: k,
          label: LZ[k].label,
        }))}
        value={p}
        onChange={setP}
        color={C}
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="diagram mt-4 block h-auto w-full"
        role="img"
        aria-label={t(r.why)}
      >
        <path
          d={d}
          fill="none"
          stroke="var(--asphalt)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d={d}
          fill="none"
          stroke={r.hairpin ? "var(--bad)" : C}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={r.hairpin ? "10 6" : undefined}
        />
        {box(office, { en: "Your office", ja: "オフィス" })}
        {box(lz, { en: "Local Zone", ja: "Local Zone" })}
        {box(reg, { en: "Parent Region", ja: "親リージョン" })}
      </svg>
      <p
        className="mt-2 font-bold"
        style={{ color: r.hairpin ? "var(--bad)" : "var(--ok)" }}
        aria-live="polite"
      >
        {r.hairpin
          ? t({ en: "✕ Hairpins through the parent Region", ja: "✕ 親リージョンを迂回" })
          : t({ en: "✓ Straight to the Local Zone", ja: "✓ Local Zone へ直行" })}
      </p>
      <p className="mt-1 text-sm">{t(r.why)}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {t({
          en: "Direct Connect to most Local Zones also caps MTU at 1,468 bytes (not 9,001) and a single flow at about 2.5 Gbps. Los Angeles is the exception.",
          ja: "多くの Local Zone への Direct Connect は MTU が 1,468 バイト (9,001 ではない)、単一フローは約 2.5 Gbps が上限。ロサンゼルスは例外。",
        })}
      </p>
    </div>
  );
}

const SPEEDS: { gbps: number; label: L }[] = [
  {
    gbps: 1.25,
    label: { en: "1 VPN tunnel (1.25 Gbps)", ja: "VPN 1 トンネル (1.25 Gbps)" },
  },
  {
    gbps: 5,
    label: { en: "1 large VPN tunnel (5 Gbps)", ja: "大容量 VPN 1 トンネル (5 Gbps)" },
  },
  {
    gbps: 10,
    label: {
      en: "10 Gbps DX (one DataSync task can fill it)",
      ja: "10 Gbps DX (DataSync 1 タスクで使い切れる)",
    },
  },
  { gbps: 100, label: { en: "100 Gbps DX", ja: "100 Gbps DX" } },
];

function TransferCalc() {
  const { t } = useLang();
  const [tb, setTb] = useState(100);
  const [util, setUtil] = useState(80);
  const unit: Record<string, L> = {
    min: { en: "min", ja: "分" },
    h: { en: "hours", ja: "時間" },
    d: { en: "days", ja: "日" },
  };
  const rows = SPEEDS.map((s) => ({
    ...s,
    dur: humanDuration(transferSeconds(tb, s.gbps, util / 100)),
  }));
  const maxS = transferSeconds(tb, SPEEDS[0].gbps, util / 100);
  return (
    <div className="panel p-4 sm:p-5">
      <p className="font-bold">
        {t({ en: "How long to move it online?", ja: "オンラインで運ぶと何日かかる?" })}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          {t({ en: `Data: ${tb} TB`, ja: `データ量: ${tb} TB` })}
          <input
            type="range"
            min={1}
            max={1000}
            value={tb}
            onChange={(e) => setTb(Number(e.target.value))}
            className="block w-full accent-[var(--r-edge)]"
          />
        </label>
        <label className="text-sm font-semibold">
          {t({ en: `Link utilization: ${util}%`, ja: `回線の利用率: ${util}%` })}
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={util}
            onChange={(e) => setUtil(Number(e.target.value))}
            className="block w-full accent-[var(--r-edge)]"
          />
        </label>
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li
            key={r.gbps}
            className="grid grid-cols-[minmax(0,14rem)_1fr_auto] items-center gap-3 text-sm"
          >
            <span className="font-semibold">{t(r.label)}</span>
            <span className="h-4 rounded bg-[var(--paper-2)]">
              <span
                className="block h-4 rounded"
                style={{
                  width: `${Math.max(1, (transferSeconds(tb, r.gbps, util / 100) / maxS) * 100)}%`,
                  background: C,
                }}
              />
            </span>
            <span className="font-mono font-bold whitespace-nowrap">
              {r.dur.value} {t(unit[r.dur.unit])}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--muted)]">
        {t({
          en: "Pure arithmetic: decimal TB × 8 ÷ (link speed × utilization). Real transfers add protocol overhead and per-file costs, so treat these as best cases.",
          ja: "単純計算: 10 進 TB × 8 ÷ (回線速度 × 利用率)。実際はプロトコルのオーバーヘッドやファイル単位の処理が加わるので、最良値として見てください。",
        })}
      </p>
    </div>
  );
}

interface DataSvc {
  name: string;
  status: "ok" | "closed";
  what: L;
}
const DATA: DataSvc[] = [
  {
    name: "AWS DataSync",
    status: "ok",
    what: {
      en: "Agent near your storage (NFS, SMB, HDFS, S3 API) copies over internet, VPN or DX. Tokyo: $0.0125/GB (Basic).",
      ja: "ストレージの近くに置いたエージェント (NFS・SMB・HDFS・S3 API) がインターネット・VPN・DX 経由でコピー。東京 $0.0125/GB (Basic)。",
    },
  },
  {
    name: "AWS Storage Gateway",
    status: "ok",
    what: {
      en: "S3 File, Volume and Tape Gateway. FSx File Gateway closed to new customers on 2024-10-28.",
      ja: "S3 File・Volume・Tape Gateway。FSx File Gateway は 2024-10-28 に新規受付終了。",
    },
  },
  {
    name: "AWS Transfer Family",
    status: "ok",
    what: {
      en: "SFTP, FTPS, FTP and AS2 endpoints; an internal VPC endpoint is reachable over DX or VPN. Tokyo: $0.30 per protocol-hour + $0.04/GB.",
      ja: "SFTP・FTPS・FTP・AS2 のエンドポイント。VPC 内部型なら DX / VPN から届く。東京 1 プロトコル時間 $0.30 + $0.04/GB。",
    },
  },
  {
    name: "AWS Data Transfer Terminal",
    status: "ok",
    what: {
      en: "Carry your own drives to an AWS facility and upload over a fast link. Tokyo added in 2026-02.",
      ja: "自分のドライブを AWS の施設へ持ち込み、高速回線でアップロード。2026-02 に東京が追加。",
    },
  },
  {
    name: "AWS Snowball Edge",
    status: "closed",
    what: {
      en: "No new customers since 2025-11-07. AWS points new customers to DataSync, Data Transfer Terminal or partners.",
      ja: "2025-11-07 以降、新規顧客は利用不可。AWS は DataSync・Data Transfer Terminal・パートナーを案内。",
    },
  },
];

export function EdgeSection() {
  const { t } = useLang();
  return (
    <Section
      id="edge"
      title={{
        en: "AWS in your building, and moving data",
        ja: "社内に AWS を置く・データを運ぶ",
      }}
      lead={{
        en: "Sometimes the answer isn't a better road to the Region but putting AWS closer: Outposts racks in your own data center, Local Zones in your metro. And when the job is moving terabytes, a handful of services decide the endpoints and ports for you.",
        ja: "リージョンへの道を太くする代わりに、AWS を近くに置く手もあります。自社データセンターの Outposts ラック、同じ都市の Local Zones。テラバイト級の移送なら、エンドポイントやポートを決めてくれるサービスがあります。",
      }}
    >
      <h3 className="text-xl font-extrabold">
        {t({
          en: "Outposts: two links, often confused",
          ja: "Outposts: 混同されがちな 2 本のリンク",
        })}
      </h3>
      <p className="mt-2 mb-4 max-w-3xl">
        {t({
          en: "An Outpost is an extension of a VPC in its home Region. It talks to your LAN through a local gateway and to the Region through a service link, an AWS-managed encrypted VPN that needs a clean 1,500-byte MTU and AWS recommends at least 500 Mbps of it, redundant.",
          ja: "Outpost はホームリージョンの VPC の延長です。社内 LAN とはローカルゲートウェイで、リージョンとはサービスリンク (AWS 管理の暗号化 VPN) でつながります。サービスリンクには MTU 1,500 がそのまま通る経路と、冗長化された 500 Mbps 以上 (推奨) が必要です。",
        })}
      </p>
      <OutpostsDiagram />

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "Local Zones: does your path go straight there?",
          ja: "Local Zones: その経路は直行する?",
        })}
      </h3>
      <p className="mt-2 mb-4 max-w-3xl">
        {t({
          en: "A Local Zone is a piece of a parent Region in your metro. Whether you actually get the low latency depends on which hub your path lands on.",
          ja: "Local Zone は親リージョンの一部を近くの都市に置いたもの。実際に低遅延になるかは、経路がどのハブに着地するかで決まります。",
        })}
      </p>
      <Predict
        question={{
          en: "Office → Direct Connect → Transit Gateway → a Local Zone subnet. Does it go straight there?",
          ja: "オフィス → Direct Connect → Transit Gateway → Local Zone のサブネット。直行する?",
        }}
        options={[
          { id: "yes", label: { en: "Yes, straight there", ja: "はい、直行" } },
          {
            id: "no",
            label: { en: "No, via the parent Region", ja: "いいえ、親リージョン経由" },
          },
        ]}
        answer="no"
        why={<p className="text-sm">{t(LZ.dxtgw.why)}</p>}
      />
      <div className="mt-4">
        <LocalZoneLab />
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "AWS Interconnect (2026)", ja: "AWS Interconnect (2026)" })}
      </h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="panel p-4" style={{ borderTop: `6px solid var(--r-dx)` }}>
          <p className="font-bold">AWS Interconnect – last mile</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              {t({
                en: "GA 2026-04-13 with Lumen; AT&T in gated preview from 2026-06-30",
                ja: "2026-04-13 に Lumen で GA。AT&T は 2026-06-30 からゲート付きプレビュー",
              })}
            </li>
            <li>
              {t({
                en: "1–100 Gbps, MACsec on by default, BGP/VLAN/ASN pre-provisioned",
                ja: "1〜100 Gbps、MACsec がデフォルトで有効、BGP・VLAN・ASN は自動設定",
              })}
            </li>
            <li>
              {t({
                en: "Single hourly fee by bandwidth, no per-GB charge",
                ja: "帯域ごとの時間料金のみ、GB 課金なし",
              })}
            </li>
            <li>
              <b>
                {t({
                  en: "US only; not available in Japan as of 2026-10-10",
                  ja: "米国のみ。2026-10-10 時点で日本では利用不可",
                })}
              </b>
            </li>
          </ul>
        </div>
        <div className="panel p-4" style={{ borderTop: `6px solid var(--r-sdwan)` }}>
          <p className="font-bold">AWS Interconnect – multicloud</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              {t({
                en: "GA 2026-04 with Google Cloud; OCI GA 2026-07 (us-east-1); Azure preview 2026-08",
                ja: "2026-04 に Google Cloud で GA。OCI は 2026-07 に GA (us-east-1)、Azure は 2026-08 にプレビュー",
              })}
            </li>
            <li>
              {t({
                en: "Private link to another cloud, built on Direct Connect gateways",
                ja: "Direct Connect ゲートウェイを土台にした他クラウドとの閉域接続",
              })}
            </li>
            <li>
              {t({
                en: "Free tier: one 500 Mbps local interconnect per Region per cloud",
                ja: "無料枠: リージョン・クラウドごとに 500 Mbps のローカル接続を 1 本",
              })}
            </li>
            <li>
              <b>
                {t({
                  en: "No Tokyo (ap-northeast-1) pairing listed",
                  ja: "東京 (ap-northeast-1) のペアリングは未掲載",
                })}
              </b>
            </li>
          </ul>
        </div>
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "Moving bulk data", ja: "大量データを運ぶ" })}
      </h3>
      <ul className="mt-4 grid gap-2">
        {DATA.map((d) => (
          <li key={d.name} className="panel flex flex-wrap items-start gap-3 p-3">
            <span
              className="mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-black text-[var(--on-color)]"
              style={{ background: d.status === "ok" ? "var(--ok)" : "var(--bad)" }}
            >
              {d.status === "ok"
                ? t({ en: "✓ available", ja: "✓ 利用可" })
                : t({ en: "✕ no new customers", ja: "✕ 新規不可" })}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{d.name}</span>
              <span className="block text-sm text-[var(--muted)]">{t(d.what)}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <TransferCalc />
      </div>
      <div className="mt-4">
        <Callout
          tone="warn"
          title={{
            en: "Older diagrams still show Snowball",
            ja: "古い構成図には Snowball が残っている",
          }}
        >
          {t({
            en: "New AWS accounts cannot order Snowball Edge. For a new migration plan, size DataSync over DX or VPN, or book a Data Transfer Terminal.",
            ja: "新しい AWS アカウントは Snowball Edge を注文できません。新規の移行計画では DX / VPN 上の DataSync か、Data Transfer Terminal を検討してください。",
          })}
        </Callout>
      </div>

      <Sources
        doc="11-edge-and-data-paths.md"
        links={[
          {
            label: "How Outposts works",
            url: "https://docs.aws.amazon.com/outposts/latest/userguide/how-outposts-works.html",
          },
          {
            label: "Local Zones with Direct Connect",
            url: "https://docs.aws.amazon.com/local-zones/latest/ug/local-zones-connectivity-direct-connect.html",
          },
          {
            label: "Snowball Edge availability change",
            url: "https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html",
          },
          {
            label: "AWS Interconnect Region availability",
            url: "https://docs.aws.amazon.com/interconnect/latest/userguide/region-availability.html",
          },
        ]}
      />
    </Section>
  );
}
