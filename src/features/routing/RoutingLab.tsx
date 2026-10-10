import { useMemo, useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { Callout, Segmented, Toggle } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { road } from "@/features/map/geometry";
import { decide, type Advert, type Hub, type Rule } from "./engine";

interface Lane extends Advert {
  present: boolean;
}

const COLOR: Record<string, string> = {
  dx: "var(--r-dx)",
  vpn1: "var(--r-vpn)",
  // Both VPNs are the same kind of road: same colour, different dash.
  vpn2: "var(--r-vpn)",
};
const NAME: Record<string, L> = {
  dx: { en: "Direct Connect", ja: "Direct Connect" },
  vpn1: { en: "VPN 1", ja: "VPN 1" },
  vpn2: { en: "VPN 2", ja: "VPN 2" },
};

const RULE: Record<Rule, L> = {
  unsupported: {
    en: "Can this hub take the route at all?",
    ja: "このハブでそもそも使える?",
  },
  health: { en: "Is the BGP session / tunnel up?", ja: "BGP / トンネルは生きてる?" },
  match: {
    en: "Does the prefix contain the destination?",
    ja: "宛先がプレフィックスに含まれる?",
  },
  longest: { en: "Longest prefix wins", ja: "最長一致 (より細かい経路が勝つ)" },
  type: { en: "Route type priority", ja: "経路の種類による優先順位" },
  aspath: { en: "Shortest AS_PATH", ja: "AS_PATH が短い方" },
  med: { en: "Lowest MED", ja: "MED が小さい方" },
  ecmp: {
    en: "Tie: ECMP spreads flows across all of them",
    ja: "同点: ECMP で全部に分散",
  },
  pick: { en: "Tie: AWS uses just one", ja: "同点: AWS が 1 本だけ使う" },
};

const TYPE_ORDER: Record<Hub, L> = {
  vgw: {
    en: "DX (BGP) > VPN (static) > VPN (BGP)",
    ja: "DX (BGP) > VPN (静的) > VPN (BGP)",
  },
  tgw: {
    en: "Static (incl. static VPN) > prefix list > VPC > DX gateway > Connect > Private IP VPN > VPN (BGP) > VPN Concentrator > Client VPN > TGW peering (Cloud WAN)",
    ja: "静的ルート (静的 VPN 含む) > プレフィックスリスト > VPC > DX ゲートウェイ > Connect > プライベート IP VPN > VPN (BGP) > VPN コンセントレータ > Client VPN > TGW ピアリング (Cloud WAN)",
  },
  cloudwan: {
    en: "Static first; then AS_PATH and MED; only then DX > Connect > VPN",
    ja: "静的が最優先。次に AS_PATH・MED、最後に DX > Connect > VPN",
  },
};

const HUBS = [
  {
    id: "vgw" as const,
    label: { en: "Virtual private gateway", ja: "仮想プライベートゲートウェイ" },
  },
  { id: "tgw" as const, label: { en: "Transit Gateway", ja: "Transit Gateway" } },
  { id: "cloudwan" as const, label: { en: "Cloud WAN", ja: "Cloud WAN" } },
];

const base = (): Lane[] => [
  { id: "dx", path: "dx", prefix: "10.0.0.0/16", asPath: 1, up: true, present: true },
  {
    id: "vpn1",
    path: "vpn",
    prefix: "10.0.0.0/16",
    vpnRouting: "bgp",
    asPath: 1,
    up: true,
    present: true,
  },
  {
    id: "vpn2",
    path: "vpn",
    prefix: "10.0.0.0/16",
    vpnRouting: "bgp",
    asPath: 1,
    up: true,
    present: false,
  },
];

interface Preset {
  id: string;
  label: L;
  hub: Hub;
  dst: string;
  ecmp: boolean;
  lanes: (l: Lane[]) => Lane[];
  note: L;
}

const set = (l: Lane[], id: string, p: Partial<Lane>) =>
  l.map((x) => (x.id === id ? { ...x, ...p } : x));

const PRESETS: Preset[] = [
  {
    id: "steal",
    label: { en: "VPN steals with a /24", ja: "VPN の /24 が横取り" },
    hub: "tgw",
    dst: "10.0.1.5",
    ecmp: false,
    lanes: (l) => set(l, "vpn1", { prefix: "10.0.1.0/24" }),
    note: {
      en: "Longest prefix is checked before anything else. Your 'backup' VPN advertises a more specific /24, so it carries that /24 even though DX is healthy, and your firewall may see asymmetric flows.",
      ja: "最長一致は何より先に評価されます。バックアップのつもりの VPN がより細かい /24 を広告しているので、DX が健全でもその /24 は VPN 経由になります。ファイアウォールでは非対称ルーティングになりがちです。",
    },
  },
  {
    id: "prepend",
    label: { en: "Prepend DX, switch hubs", ja: "DX をプリペンド、ハブを切替" },
    hub: "cloudwan",
    dst: "10.0.1.5",
    ecmp: false,
    lanes: (l) => set(l, "dx", { asPath: 3 }),
    note: {
      en: "Same routes, different hub, different answer. Try switching the hub: VGW and Transit Gateway compare route type first, so DX wins regardless of AS_PATH. Cloud WAN compares AS_PATH first, so the VPN wins.",
      ja: "経路は同じでも、ハブが違えば答えも違います。ハブを切り替えてみてください。VGW と Transit Gateway は種類を先に比べるので、AS_PATH に関係なく DX が勝ちます。Cloud WAN は AS_PATH を先に比べるので VPN が勝ちます。",
    },
  },
  {
    id: "static",
    label: { en: "Static VPN as backup", ja: "静的 VPN をバックアップに" },
    hub: "tgw",
    dst: "10.0.1.5",
    ecmp: false,
    lanes: (l) => set(l, "vpn1", { vpnRouting: "static" }),
    note: {
      en: "On a Transit Gateway a static VPN route is a static route, and static beats every propagated route, DX included. Your backup becomes the primary. Use a BGP VPN if you want DX preferred.",
      ja: "Transit Gateway では静的 VPN の経路は「静的ルート」扱い。静的は DX を含むすべての伝播ルートに勝つので、バックアップがプライマリになります。DX を優先させたいなら BGP VPN を。",
    },
  },
  {
    id: "down",
    label: { en: "DX goes down", ja: "DX がダウン" },
    hub: "tgw",
    dst: "10.0.1.5",
    ecmp: false,
    lanes: (l) => set(l, "dx", { up: false }),
    note: {
      en: "Health is checked first: a withdrawn route is simply gone, and the VPN takes over. Without BFD (Bidirectional Forwarding Detection, sub-second failure detection), DX BGP waits out a 90-second hold timer before that happens.",
      ja: "健全性が最初にチェックされ、取り下げられた経路は消えます。VPN が引き継ぎます。BFD (サブ秒で障害を検知する仕組み) がないと、DX の BGP はホールドタイマー 90 秒を待ってから切り替わります。",
    },
  },
  {
    id: "ecmp",
    label: { en: "Two VPNs, ECMP", ja: "VPN 2 本で ECMP" },
    hub: "tgw",
    dst: "10.0.1.5",
    ecmp: true,
    lanes: (l) => set(set(l, "dx", { present: false }), "vpn2", { present: true }),
    note: {
      en: "Two BGP VPNs with identical routes on a Transit Gateway with VPN ECMP on: flows are spread across every tunnel. Each flow still sticks to one tunnel, so one big transfer never goes faster than one tunnel. Switch to Cloud WAN: ECMP is on by default there. Switch to VGW: no ECMP at all.",
      ja: "Transit Gateway で VPN ECMP を有効にし、同じ経路の BGP VPN が 2 本: フローが全トンネルに分散します。ただし 1 フローは 1 トンネルに固定なので、単一の大きな転送は 1 トンネル分より速くなりません。Cloud WAN に切り替えると既定で ECMP が有効。VGW に切り替えると ECMP は一切ありません。",
    },
  },
];

const PREFIXES = ["10.0.0.0/8", "10.0.0.0/16", "10.0.1.0/24"];
const DSTS = ["10.0.1.5", "10.0.9.9", "10.200.0.1"];

export function RoutingLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [preset, setPreset] = useState(PRESETS[0].id);
  const p0 = PRESETS[0];
  const [hub, setHub] = useState<Hub>(p0.hub);
  const [dst, setDst] = useState(p0.dst);
  const [ecmp, setEcmp] = useState(p0.ecmp);
  const [lanes, setLanes] = useState<Lane[]>(() => p0.lanes(base()));
  // The scenario key whose answer has been revealed (by a right guess or by
  // asking for it). Any change to the scenario re-arms the question, and the
  // ladder hides its verdict until that scenario is answered too.
  const [answered, setAnswered] = useState<string | null>(null);

  const applyPreset = (p: Preset) => {
    setPreset(p.id);
    setHub(p.hub);
    setDst(p.dst);
    setEcmp(p.ecmp);
    setLanes(p.lanes(base()));
  };
  // Any manual change leaves the preset, so its note can no longer contradict
  // the result. Switching hubs keeps the "prepend" note: that preset is about
  // exactly that comparison.
  const edit = (id: string, patch: Partial<Lane>) => {
    setLanes((l) => set(l, id, patch));
    setPreset("");
  };

  const shown = useMemo(() => lanes.filter((l) => l.present), [lanes]);
  const d = useMemo(
    () => decide(hub, dst, shown, { vpnEcmp: ecmp }),
    [hub, dst, shown, ecmp],
  );
  const key = `${preset}|${hub}|${dst}|${ecmp}|${JSON.stringify(shown)}`;
  const revealed = answered === key;
  const answer = d.winners.length === 0 ? "none" : d.ecmp ? "ecmp" : d.winners[0];
  const lostAt = (id: string) => d.steps.find((s) => s.dropped.includes(id))?.rule;
  const note = PRESETS.find((p) => p.id === preset)?.note;

  // Diagram geometry: roads run from the hub (right) back to your network (left),
  // because this is AWS choosing how to send traffic to you.
  const W = narrow ? 360 : 900;
  // Wide layout: spread only the roads that are advertised, so a two-road
  // scenario has no empty third lane under it.
  const LANE_YS: Record<number, number[]> = { 1: [150], 2: [95, 205], 3: [60, 150, 240] };
  const ys = Object.fromEntries(
    shown.map((l, k) => [l.id, LANE_YS[Math.max(1, shown.length)][k]]),
  ) as Record<string, number>;
  const H = narrow ? 420 : shown.length === 3 ? 300 : 250;
  const xs = { dx: 70, vpn1: 180, vpn2: 290 } as Record<string, number>;
  const laneD = (id: string) =>
    narrow
      ? `M${xs[id]} 330 C${xs[id]} 250 ${xs[id]} 170 ${xs[id]} 90`
      : road([
          [700, 150],
          [600, ys[id]],
          [300, ys[id]],
          [190, 150],
        ]);

  const choices = [
    ...shown.map((l) => ({ id: l.id, label: NAME[l.id] })),
    ...(shown.length > 1
      ? [
          {
            id: "ecmp",
            label: { en: "Spread across them (ECMP)", ja: "全部に分散 (ECMP)" },
          },
        ]
      : []),
    { id: "none", label: { en: "No route", ja: "経路なし" } },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="panel p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              aria-pressed={preset === p.id}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm font-semibold aria-pressed:border-[var(--ink)] aria-pressed:bg-[var(--ink)] aria-pressed:text-[var(--paper)]"
            >
              {t(p.label)}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {narrow ? (
            // On phones the long hub names wrap badly as a segmented row.
            <label className="flex w-full flex-col gap-1 text-sm font-semibold">
              {t({ en: "AWS hub", ja: "AWS 側のハブ" })}
              <select
                value={hub}
                onChange={(e) => {
                  setHub(e.target.value as Hub);
                  if (preset !== "prepend") setPreset("");
                }}
                className="min-h-10 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2"
              >
                {HUBS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {t(h.label)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <Segmented
              label={{ en: "AWS hub", ja: "AWS 側のハブ" }}
              options={HUBS}
              value={hub}
              onChange={(h) => {
                setHub(h);
                if (preset !== "prepend") setPreset("");
              }}
            />
          )}
          <label className="flex items-center gap-2 text-sm font-semibold">
            {t({ en: "Packet to", ja: "宛先" })}
            <select
              value={dst}
              onChange={(e) => {
                setDst(e.target.value);
                setPreset("");
              }}
              className="num min-h-9 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-1"
            >
              {DSTS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="diagram mt-4 block h-auto w-full"
          role="img"
          aria-label={t({
            en: "AWS hub choosing a road back to your network",
            ja: "AWS のハブが社内への道を選ぶ図",
          })}
        >
          {narrow ? (
            <>
              <rect
                x={20}
                y={20}
                width={320}
                height={56}
                rx={8}
                fill="var(--paper-2)"
                stroke="var(--line)"
              />
              <text x={180} y={54} textAnchor="middle" fontSize={15} fill="var(--ink)">
                {t({ en: "Your network", ja: "社内ネットワーク" })}
              </text>
              <rect x={20} y={340} width={320} height={60} rx={8} fill="var(--hub)" />
              <text
                x={180}
                y={376}
                textAnchor="middle"
                fontSize={15}
                fill="var(--on-hub)"
              >
                {t(HUBS.find((h) => h.id === hub)!.label)}
              </text>
            </>
          ) : (
            <>
              <rect
                x={20}
                y={110}
                width={170}
                height={80}
                rx={10}
                fill="var(--paper-2)"
                stroke="var(--line)"
              />
              <text x={105} y={146} textAnchor="middle" fontSize={18} fill="var(--ink)">
                {t({ en: "Your network", ja: "社内ネットワーク" })}
              </text>
              <text
                x={105}
                y={168}
                textAnchor="middle"
                fontSize={14}
                fill="var(--muted)"
                className="num"
              >
                {dst}
              </text>
              <rect x={700} y={105} width={180} height={90} rx={10} fill="var(--hub)" />
              <text
                x={790}
                y={146}
                textAnchor="middle"
                fontSize={18}
                fill="var(--on-hub)"
              >
                {t(HUBS.find((h) => h.id === hub)!.label)}
              </text>
              <text
                x={790}
                y={168}
                textAnchor="middle"
                fontSize={14}
                fill="var(--on-hub)"
              >
                {t({ en: "picks the road", ja: "が道を選ぶ" })}
              </text>
            </>
          )}
          {lanes.map((l) => {
            if (!l.present) return null;
            const win = revealed && d.winners.includes(l.id);
            const dim = revealed && !win;
            const dPath = laneD(l.id);
            const lx = narrow ? xs[l.id] : 450;
            // Lanes are only 110 apart on phones: stagger the labels.
            const ly = narrow ? { dx: 150, vpn1: 210, vpn2: 270 }[l.id]! : ys[l.id];
            const lw = narrow ? 96 : 150;
            return (
              // A road that is down is drawn as a faint grey dashed line.
              <g key={l.id} opacity={!l.up ? 0.25 : dim ? 0.35 : 1}>
                <path
                  d={dPath}
                  fill="none"
                  stroke="var(--asphalt)"
                  strokeWidth={win ? 14 : 10}
                  strokeLinecap="round"
                />
                <path
                  d={dPath}
                  fill="none"
                  stroke={l.up ? COLOR[l.id] : "var(--asphalt-2)"}
                  strokeWidth={win ? 7 : 5}
                  strokeLinecap="round"
                  strokeDasharray={
                    !l.up
                      ? "6 8"
                      : l.id === "vpn2"
                        ? "4 6"
                        : l.path === "vpn"
                          ? "10 6"
                          : undefined
                  }
                />
                {win && (
                  // A static packet on the winning road, next to the hub: the
                  // decision is the point, not a loop of motion.
                  <circle
                    cx={narrow ? xs[l.id] : 640}
                    cy={narrow ? 310 : ys[l.id]}
                    r={9}
                    fill="var(--lane)"
                    stroke="var(--asphalt)"
                    strokeWidth={2}
                  />
                )}
                <g transform={`translate(${lx} ${ly})`}>
                  <rect
                    x={-lw / 2}
                    y={-17}
                    width={lw}
                    height={34}
                    rx={6}
                    fill="var(--paper)"
                    stroke={COLOR[l.id]}
                    strokeWidth={2}
                  />
                  <text
                    textAnchor="middle"
                    y={6}
                    fontSize={narrow ? 14 : 16}
                    fill="var(--ink)"
                  >
                    {narrow && l.id === "dx" ? "DX" : t(NAME[l.id])}
                    {l.up ? "" : "\u00a0\u00a0✕"}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col gap-4">
        {lanes.map((l) => (
          <fieldset
            key={l.id}
            className="panel p-3"
            style={{ borderLeft: `6px solid ${COLOR[l.id]}` }}
          >
            <legend className="sr-only">{t(NAME[l.id])}</legend>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">{t(NAME[l.id])}</span>
              <Toggle
                label={{ en: "advertised", ja: "広告あり" }}
                checked={l.present}
                onChange={(v) => edit(l.id, { present: v })}
              />
            </div>
            {l.present && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <label className="col-span-2 flex items-center justify-between gap-2">
                  {t({ en: "Prefix", ja: "プレフィックス" })}
                  <select
                    value={l.prefix}
                    onChange={(e) => edit(l.id, { prefix: e.target.value })}
                    className="num min-h-9 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-0.5"
                  >
                    {PREFIXES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2">
                  AS_PATH
                  <select
                    value={l.asPath}
                    onChange={(e) => edit(l.id, { asPath: Number(e.target.value) })}
                    aria-describedby={
                      l.path === "vpn" && l.vpnRouting === "static"
                        ? `${l.id}-static`
                        : undefined
                    }
                    className="num min-h-9 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-0.5"
                    disabled={l.path === "vpn" && l.vpnRouting === "static"}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                {l.path === "vpn" && l.vpnRouting === "static" && (
                  <p
                    id={`${l.id}-static`}
                    className="col-span-2 text-xs text-[var(--muted)]"
                  >
                    {t({
                      en: "Static routes carry no AS_PATH, so it is not compared.",
                      ja: "静的ルートには AS_PATH がないので比較されません。",
                    })}
                  </p>
                )}
                <Toggle
                  label={{ en: "up", ja: "稼働" }}
                  checked={l.up}
                  onChange={(v) => edit(l.id, { up: v })}
                />
                {l.path === "vpn" && (
                  <div className="col-span-2">
                    <Segmented
                      label={{ en: "VPN routing", ja: "VPN のルーティング" }}
                      options={[
                        { id: "bgp", label: { en: "BGP", ja: "BGP" } },
                        { id: "static", label: { en: "Static", ja: "静的" } },
                      ]}
                      value={l.vpnRouting ?? "bgp"}
                      onChange={(v) => edit(l.id, { vpnRouting: v })}
                      color={COLOR[l.id]}
                    />
                  </div>
                )}
              </div>
            )}
          </fieldset>
        ))}
        {hub === "tgw" && (
          <Toggle
            label={{ en: "TGW VPN ECMP option on", ja: "TGW の VPN ECMP を有効化" }}
            checked={ecmp}
            onChange={setEcmp}
          />
        )}
      </div>

      {/* Predict, then reveal: the decision ladder stays locked until you
          commit to an answer (or skip), and the diagram marks the winner only
          after a guess. */}
      <div className="lg:col-span-2">
        <Predict
          question={{
            en: "Which road does AWS use to reach you?",
            ja: "AWS は社内へどの道を使う?",
          }}
          options={choices}
          answer={answer}
          resetKey={key}
          onPick={(_id, right) => {
            if (right) setAnswered(key);
          }}
          why={
            note ? (
              <Callout tone="warn">{t(note)}</Callout>
            ) : (
              <p>
                {t({
                  en: "The ladder below walks the hub's checklist rule by rule.",
                  ja: "下の判定はしごで、ハブのチェックリストを 1 ルールずつ確認できます。",
                })}
              </p>
            )
          }
        >
          <div className="panel p-4 sm:p-5">
            <p id="ladder-title" className="mb-3 font-bold">
              {t({
                en: "How the hub decided, rule by rule",
                ja: "ハブの判定を 1 ステップずつ",
              })}
            </p>
            <ol aria-labelledby="ladder-title">
              {d.steps
                // Show the whole checklist; rules that changed nothing are greyed out
                // so you can see they were checked and passed.
                .filter((s) => s.rule !== "unsupported" || s.dropped.length > 0)
                .filter((s) => s.kept.length + s.dropped.length > 0)
                .map((s, i) => (
                  <li
                    key={i}
                    className={`flex flex-wrap items-center gap-2 border-t border-[var(--line)] py-2 first:border-t-0 ${
                      s.dropped.length === 0 && s.rule !== "ecmp" ? "opacity-45" : ""
                    }`}
                  >
                    <span className="w-6 text-center font-black text-[var(--muted)]">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold">
                      {t(RULE[s.rule])}
                      {s.rule === "type" && (
                        <span className="block text-xs font-normal text-[var(--muted)]">
                          {t(TYPE_ORDER[hub])}
                        </span>
                      )}
                    </span>
                    {revealed &&
                      s.dropped.map((id) => (
                        <span
                          key={id}
                          className="rounded px-2 py-0.5 text-xs font-bold line-through opacity-70"
                          style={{ background: "var(--paper-2)", color: COLOR[id] }}
                        >
                          {t(NAME[id])}
                        </span>
                      ))}
                    {revealed &&
                      s.kept.map((id) => (
                        <span
                          key={id}
                          className="rounded px-2 py-0.5 text-xs font-bold text-[var(--on-color)]"
                          style={{ background: COLOR[id] }}
                        >
                          {t(NAME[id])}
                        </span>
                      ))}
                  </li>
                ))}
              <li className="border-t border-[var(--line)] pt-3 font-bold">
                {!revealed ? (
                  <span className="flex flex-wrap items-center gap-3 font-semibold text-[var(--muted)]">
                    {t({
                      en: "Answer the question above for this scenario to see which road wins.",
                      ja: "このシナリオの質問に答えると、どの道が勝つか表示されます。",
                    })}
                    <button
                      type="button"
                      onClick={() => setAnswered(key)}
                      className="min-h-9 rounded-lg border border-[var(--line)] px-3 text-sm font-bold text-[var(--ink)]"
                    >
                      {t({ en: "Show the result", ja: "結果を表示" })}
                    </button>
                  </span>
                ) : d.winners.length === 0 ? (
                  t({
                    en: "No usable route: the packet is dropped.",
                    ja: "使える経路なし: パケットは破棄されます。",
                  })
                ) : (
                  `${t({ en: "Result", ja: "結果" })}: ${d.winners.map((w) => t(NAME[w])).join(" + ")}${d.ecmp ? " (ECMP)" : ""}`
                )}
              </li>
              {lanes.some((l) => l.present && lostAt(l.id) === "unsupported") && (
                <li className="pt-2 text-sm text-[var(--muted)]">
                  {t({
                    en: "Cloud WAN VPN attachments must use BGP, so a static VPN cannot attach.",
                    ja: "Cloud WAN の VPN アタッチメントは BGP 必須なので、静的 VPN はつなげません。",
                  })}
                </li>
              )}
            </ol>
            {hub === "tgw" && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                {t({
                  en: "This lab has DX and VPN only; the full Transit Gateway order is listed under route type priority.",
                  ja: "このラボは DX と VPN だけの簡略版です。Transit Gateway の完全な順序は「経路の種類による優先順位」に記載しています。",
                })}
              </p>
            )}
          </div>
        </Predict>
      </div>
    </div>
  );
}
