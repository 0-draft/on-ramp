import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { Slider } from "@/components/ui/Slider";
import { useNarrow } from "@/hooks/useNarrow";
import { ROUTE } from "@/data/routes";
import { Segmented, Shield } from "@/components/ui";
import {
  MTU_PATH,
  MTU_PATHS,
  classify,
  mssOf,
  overheadOf,
  type MtuPathId,
  type Outcome,
} from "./mtu";

const fmt = (n: number) => n.toLocaleString("en-US");

const OUTCOME: Record<Outcome, { label: L; color: string; detail: L }> = {
  fits: {
    label: { en: "Fits under the bridge", ja: "橋の下を通れる" },
    color: "var(--ok)",
    detail: {
      en: "The packet is at or under the path MTU and goes through untouched.",
      ja: "パケットは経路 MTU 以下なので、そのまま通ります。",
    },
  },
  pmtud: {
    label: { en: "Too tall: told to shrink", ja: "高すぎ: 縮めるよう通知" },
    color: "var(--warn)",
    detail: {
      en: "The packet is dropped, but the sender gets an ICMP 'fragmentation needed' message and resends smaller (Path MTU Discovery, PMTUD). It works if nothing filters that ICMP.",
      ja: "パケットは破棄されますが、送信元に ICMP 'fragmentation needed' が返り、小さくして再送します (パス MTU 検出、PMTUD)。途中でその ICMP が遮断されていないことが条件です。",
    },
  },
  blackhole: {
    label: { en: "Too tall: silently dropped", ja: "高すぎ: 黙って破棄" },
    color: "var(--bad)",
    detail: {
      en: "No PMTUD on this path, so nobody tells the sender. Small packets work, big ones vanish: the classic 'SSH logs in, then the transfer hangs' symptom. TCP is saved only by MSS clamping or a lower MSS on your router.",
      ja: "この経路には PMTUD がなく、送信元に誰も知らせません。小さいパケットは通り、大きいものだけ消えます。「SSH はログインできるのに転送が固まる」典型的な症状です。TCP を救えるのは MSS クランプか、ルーター側で MSS を下げることだけです。",
    },
  },
  unknown: {
    label: { en: "Too tall: don't count on rescue", ja: "高すぎ: 救済は期待しない" },
    color: "var(--bad)",
    detail: {
      en: "AWS does not document PMTUD for this path. Size packets to the MTU yourself (MSS on your router) instead of relying on ICMP.",
      ja: "この経路の PMTUD は AWS のドキュメントに記載がありません。ICMP 頼みにせず、ルーターの MSS で自分からサイズを合わせましょう。",
    },
  },
};

const PMTUD: Record<string, L> = {
  yes: { en: "Yes", ja: "あり" },
  no: { en: "No", ja: "なし" },
  undocumented: { en: "Not documented", ja: "記載なし" },
};

/** Nested envelopes: each header wraps everything inside it. */
function Envelope({ id }: { id: MtuPathId }) {
  const { t } = useLang();
  const p = MTU_PATH[id];
  const color = ROUTE[p.route].color;
  const inner = (
    <div className="rounded-md border-2 border-[var(--ink)] bg-[var(--paper)] p-2">
      <div className="flex justify-between gap-2 text-xs font-bold">
        <span>{t({ en: "Inner IP header", ja: "内側 IP ヘッダー" })}</span>
        <span className="num">20 B</span>
      </div>
      <div className="mt-2 rounded-md border-2 border-[var(--asphalt-2)] p-2">
        <div className="flex justify-between gap-2 text-xs font-bold">
          <span>{t({ en: "TCP header", ja: "TCP ヘッダー" })}</span>
          <span className="num">20 B</span>
        </div>
        <div
          className="mt-2 rounded-md px-2 py-3 text-sm font-bold text-[var(--on-color)]"
          style={{ background: color }}
        >
          <div className="flex flex-wrap justify-between gap-2">
            <span>
              {t({
                en: "Your data (max segment = MSS)",
                ja: "データ (最大セグメント = MSS)",
              })}
            </span>
            <span className="num">{fmt(mssOf(p))} B</span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-right text-xs font-bold text-[var(--muted)]">
        {t({ en: "Inner packet = MTU", ja: "内側パケット = MTU" })}{" "}
        <span className="num text-[var(--ink)]">{fmt(p.mtu)} B</span>
      </p>
    </div>
  );
  return p.wrappers.reduceRight(
    (child, w, i) => (
      <div
        key={i}
        className="rounded-lg border-2 border-dashed p-2"
        style={{
          borderColor: color,
          // A cutaway hatch marks what the wrapper encrypts.
          backgroundImage: w.encrypts
            ? `repeating-linear-gradient(135deg, transparent 0 8px, color-mix(in srgb, ${color} 18%, transparent) 8px 10px)`
            : undefined,
        }}
      >
        <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs font-bold">
          <span>
            {t(w.label)}
            {w.encrypts && (
              <span
                className="ml-2 rounded bg-[var(--paper)] px-1.5 py-0.5"
                style={{ color }}
              >
                {t({ en: "encrypts everything inside", ja: "内側をすべて暗号化" })}
              </span>
            )}
          </span>
          <span className="num">+{w.bytes} B</span>
        </div>
        {child}
      </div>
    ),
    inner,
  );
}

function Clearance({
  mtu,
  size,
  outcome,
}: {
  mtu: number;
  size: number;
  outcome: Outcome;
}) {
  const { t } = useLang();
  const narrow = useNarrow();
  const W = narrow ? 360 : 900;
  const H = 280;
  const ground = 250;
  const gap = 150; // drawn clearance under the bridge = the path MTU
  const bx = narrow ? 150 : 400;
  const bw = narrow ? 110 : 200;
  const h = Math.min(220, Math.max(36, (gap * size) / mtu));
  const tw = narrow ? 120 : 170;
  const through = outcome === "fits";
  const tx = through ? bx + bw + (narrow ? 10 : 60) : bx - tw - (narrow ? 14 : 40);
  const signW = narrow ? 180 : 240;
  const c = OUTCOME[outcome].color;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="diagram block h-auto w-full"
      role="img"
      aria-label={`${t({ en: "Clearance", ja: "高さ制限" })} ${mtu} B, ${t({ en: "packet", ja: "パケット" })} ${size} B: ${t(OUTCOME[outcome].label)}`}
    >
      <rect x={0} y={ground} width={W} height={H - ground} fill="var(--asphalt)" />
      <line
        x1={0}
        y1={ground + 15}
        x2={W}
        y2={ground + 15}
        stroke="var(--lane)"
        strokeWidth={3}
        strokeDasharray="18 14"
      />
      {/* Bridge */}
      <rect x={bx} y={ground - gap - 26} width={bw} height={26} fill="var(--asphalt-2)" />
      <rect x={bx} y={ground - gap} width={16} height={gap} fill="var(--asphalt-2)" />
      <rect
        x={bx + bw - 16}
        y={ground - gap}
        width={16}
        height={gap}
        fill="var(--asphalt-2)"
      />
      {/* Low-clearance sign: yellow with black legend, like the real thing. */}
      <rect
        x={bx + bw / 2 - signW / 2}
        y={18}
        width={signW}
        height={44}
        rx={6}
        fill="var(--lane)"
        stroke="#000"
        strokeWidth={3}
      />
      <text
        x={bx + bw / 2}
        y={47}
        textAnchor="middle"
        fontSize={narrow ? 15 : 18}
        fill="#000"
      >
        {t({ en: "Clearance", ja: "高さ制限" })} {fmt(mtu)} B
      </text>
      {/* Truck: its height is the packet size relative to the clearance. */}
      <g>
        <rect
          x={tx}
          y={ground - 12 - h}
          width={tw}
          height={h}
          rx={6}
          fill={c}
          stroke="var(--ink)"
          strokeWidth={2}
        />
        <text
          x={tx + tw / 2}
          y={ground - 12 - h / 2 + 6}
          textAnchor="middle"
          fontSize={16}
          fill="var(--on-color)"
          className="num"
        >
          {fmt(size)} B
        </text>
        <circle cx={tx + 28} cy={ground - 6} r={10} fill="var(--ink)" />
        <circle cx={tx + tw - 28} cy={ground - 6} r={10} fill="var(--ink)" />
      </g>
      {!through && (
        <text
          x={bx + bw / 2}
          y={ground - gap / 2 + 6}
          textAnchor="middle"
          fontSize={narrow ? 30 : 40}
          fill={c}
          aria-hidden="true"
        >
          ✕
        </text>
      )}
    </svg>
  );
}

const QUICK = [1400, 1500, 8500, 9001];

export function MtuLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [id, setId] = useState<MtuPathId>("vpnGcm");
  const [size, setSize] = useState(1500);
  const p = MTU_PATH[id];
  const outcome = classify(p, size);
  const color = ROUTE[p.route].color;

  return (
    <div className="flex flex-col gap-5">
      {narrow ? (
        // Phones: seven paths as chips would push the inspector off screen.
        <label className="flex flex-col gap-1 text-sm font-bold">
          {t({ en: "Path", ja: "経路" })}
          <select
            value={id}
            onChange={(e) => setId(e.target.value as MtuPathId)}
            className="min-h-11 rounded-lg border-2 bg-[var(--paper)] px-2 py-1 text-base"
            style={{ borderColor: color }}
          >
            {MTU_PATHS.map((x) => (
              <option key={x.id} value={x.id}>
                {t(x.name)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <Segmented
          label={{ en: "Path", ja: "経路" }}
          options={MTU_PATHS.map((x) => ({ id: x.id, label: x.name }))}
          value={id}
          onChange={setId}
          renderLabel={(o) => {
            const r = ROUTE[MTU_PATH[o.id].route];
            return (
              <span className="inline-flex items-center gap-2 text-left">
                <Shield label={r.shield} color={r.color} size="sm" />
                {t(o.label)}
              </span>
            );
          }}
        />
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_18rem]">
        <div className="panel p-4">
          <p className="mb-3 font-bold">
            {t({ en: "Header inspector", ja: "ヘッダーの中身" })}
            {p.outer !== undefined && (
              <span className="ml-2 text-sm font-semibold text-[var(--muted)]">
                {t({ en: "outer packet", ja: "外側パケット" })}{" "}
                <span className="num">{fmt(p.outer)} B</span>
              </span>
            )}
          </p>
          <Envelope id={id} />
        </div>
        <div className="panel flex flex-col gap-4 p-4">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-semibold text-[var(--muted)]">MTU</dt>
              <dd className="num text-2xl font-bold" style={{ color }}>
                {fmt(p.mtu)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[var(--muted)]">MSS</dt>
              <dd className="num text-2xl font-bold">{fmt(mssOf(p))}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[var(--muted)]">
                {t({ en: "Wrapping overhead", ja: "カプセル化のオーバーヘッド" })}
              </dt>
              <dd className="num font-bold">{overheadOf(p)} B</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[var(--muted)]">PMTUD</dt>
              <dd className="font-bold">{t(PMTUD[p.pmtud])}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs font-semibold text-[var(--muted)]">
                {t({ en: "MSS clamping by AWS", ja: "AWS による MSS クランプ" })}
              </dt>
              <dd className="font-bold">
                {p.clamp
                  ? t({ en: "Yes: TCP adjusts itself", ja: "あり: TCP は自動で収まる" })
                  : t({
                      en: "Not on this path: set MSS on your router",
                      ja: "この経路ではなし: ルーターで MSS を設定",
                    })}
              </dd>
            </div>
          </dl>
          <p className="text-sm text-[var(--muted)]">{t(p.note)}</p>
        </div>
      </div>

      <div className="panel p-4">
        <Slider
          label={{
            en: "Packet size (Don't Fragment set)",
            ja: "パケットサイズ (DF ビットあり)",
          }}
          min={576}
          max={9216}
          value={size}
          onChange={setSize}
          format={(v) => `${fmt(v)} B`}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setSize(q)}
              aria-pressed={size === q}
              className="num min-h-9 rounded-md border border-[var(--line)] px-3 py-1 text-sm aria-pressed:border-[var(--ink)] aria-pressed:font-bold"
            >
              {fmt(q)}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Clearance mtu={p.mtu} size={size} outcome={outcome} />
        </div>
        <p
          className="mt-2 font-bold"
          style={{ color: OUTCOME[outcome].color }}
          aria-live="polite"
        >
          {t(OUTCOME[outcome].label)}
        </p>
        <p className="mt-1 text-sm">{t(OUTCOME[outcome].detail)}</p>
        {outcome !== "fits" && p.clamp && (
          <p className="mt-1 text-sm text-[var(--muted)]">
            {t({
              en: `TCP never gets here: AWS clamps its MSS to ${fmt(mssOf(p))}. This bites UDP, ICMP and anything tunnelled inside.`,
              ja: `TCP はここまで来ません: AWS が MSS を ${fmt(mssOf(p))} にクランプするため。困るのは UDP、ICMP、内側でトンネルされた通信です。`,
            })}
          </p>
        )}
      </div>
    </div>
  );
}
