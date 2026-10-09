import { useState } from "react";
import type { ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ipToInt } from "@/lib/cidr";
import { KIND, ROUTES, type Kind } from "@/data/routes";
import { Callout, Section, Segmented, Shield, Sources } from "@/components/ui";
import { longestMatch, prefixInfo, type SignRoute } from "./prefix";

/**
 * A zine-style card: one idea, a one-line summary on the cover, the detail
 * inside. Native <details> so it works without script and with the keyboard.
 */
function Card({
  n,
  title,
  gist,
  open,
  children,
}: {
  n: number;
  title: L;
  gist: L;
  open?: boolean;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <details open={open} className="panel group overflow-hidden">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--lane)] font-black text-black"
        >
          {n}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-extrabold">{t(title)}</span>
          <span className="block text-sm text-[var(--muted)]">{t(gist)}</span>
        </span>
        <span
          aria-hidden="true"
          className="mt-1 text-[var(--muted)] transition-transform group-open:rotate-90"
        >
          ▶
        </span>
      </summary>
      <div className="border-t border-[var(--line)] p-4">{children}</div>
    </details>
  );
}

function CidrCard() {
  const { t } = useLang();
  const [len, setLen] = useState(16);
  const info = prefixInfo("10.0.0.0", len)!;
  return (
    <div>
      <label className="flex flex-wrap items-center gap-3 font-semibold">
        {t({ en: "Prefix length", ja: "プレフィックス長" })}
        <input
          type="range"
          min={8}
          max={32}
          value={len}
          onChange={(e) => setLen(Number(e.target.value))}
          className="w-48 accent-[var(--sign)]"
        />
        <span className="font-mono text-lg font-bold">/{len}</span>
      </label>
      {/* 32 bits: the first `len` are fixed (the network), the rest are yours. */}
      <div
        className="mt-3 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-0.5 sm:grid-cols-[repeat(32,minmax(0,1fr))]"
        aria-hidden="true"
      >
        {Array.from({ length: 32 }, (_, i) => (
          <span
            key={i}
            className="h-5 rounded-sm"
            style={{
              background: i < len ? "var(--r-vpn)" : "var(--paper-2)",
              border: "1px solid var(--line)",
            }}
          />
        ))}
      </div>
      <p className="mt-1 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[var(--r-vpn)]" />
          {t({
            en: `${len} network bits (fixed)`,
            ja: `ネットワーク部 ${len} ビット (固定)`,
          })}
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-[var(--line)] bg-[var(--paper-2)]" />
          {t({
            en: `${32 - len} host bits (free)`,
            ja: `ホスト部 ${32 - len} ビット (自由)`,
          })}
        </span>
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-[var(--muted)]">
            {t({ en: "Block", ja: "ブロック" })}
          </dt>
          <dd className="font-mono font-bold">{info.network}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-xs text-[var(--muted)]">
            {t({ en: "Range", ja: "範囲" })}
          </dt>
          <dd className="font-mono font-bold whitespace-nowrap">
            {info.first} – {info.last}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">
            {t({ en: "Addresses", ja: "アドレス数" })}
          </dt>
          <dd className="font-mono font-bold">{info.count.toLocaleString("en-US")}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm">
        {t({
          en: "A bigger number after the slash means a smaller, more specific block. Every routing decision on this site starts by asking which block is the most specific.",
          ja: "スラッシュの後ろの数字が大きいほど、ブロックは小さく具体的になります。このサイトのあらゆる経路判断は「どれが一番具体的か」から始まります。",
        })}
      </p>
    </div>
  );
}

const SIGNS: (SignRoute & { label: L })[] = [
  {
    prefix: "0.0.0.0/0",
    target: "igw",
    label: { en: "Internet gateway", ja: "インターネットゲートウェイ" },
  },
  {
    prefix: "10.0.0.0/8",
    target: "vpn",
    label: { en: "Site-to-Site VPN", ja: "Site-to-Site VPN" },
  },
  {
    prefix: "10.0.0.0/16",
    target: "dx",
    label: { en: "Direct Connect", ja: "Direct Connect" },
  },
  {
    prefix: "10.0.1.0/24",
    target: "tgw",
    label: { en: "Transit Gateway", ja: "Transit Gateway" },
  },
];
const DESTS = ["10.0.1.9", "10.0.9.9", "10.9.9.9", "8.8.8.8"] as const;

function RouteSignCard() {
  const { t } = useLang();
  const [dst, setDst] = useState<(typeof DESTS)[number]>("10.0.1.9");
  const win = longestMatch(ipToInt(dst)!, SIGNS);
  return (
    <div>
      <Segmented
        label={{ en: "Packet to", ja: "宛先" }}
        options={DESTS.map((d) => ({ id: d, label: { en: d, ja: d } }))}
        value={dst}
        onChange={setDst}
      />
      {/* A gantry of signs: one per route; every matching sign lights up,
          and the most specific one is the one you follow. */}
      <ul
        className="mt-4 grid gap-2 sm:grid-cols-2"
        aria-label={t({ en: "Route table", ja: "ルートテーブル" })}
      >
        {SIGNS.map((s, i) => {
          const matches = longestMatch(ipToInt(dst)!, [s]) === 0;
          const winner = i === win;
          return (
            <li
              key={s.prefix}
              className="sign flex items-center justify-between gap-3 px-4 py-3 transition-opacity"
              style={{
                opacity: matches ? 1 : 0.35,
                outline: winner ? "4px solid var(--lane)" : undefined,
                outlineOffset: 3,
              }}
            >
              <span className="min-w-0">
                <span className="block font-mono text-lg font-bold">{s.prefix}</span>
                <span className="block text-sm">{t(s.label)}</span>
              </span>
              <span aria-hidden="true" className="text-3xl font-black">
                →
              </span>
              <span className="sr-only">
                {winner
                  ? t({
                      en: "(chosen: most specific match)",
                      ja: "(採用: 最も具体的な一致)",
                    })
                  : matches
                    ? t({
                        en: "(matches, but less specific)",
                        ja: "(一致するが具体性で負け)",
                      })
                    : t({ en: "(no match)", ja: "(不一致)" })}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 font-semibold" aria-live="polite">
        {t({
          en: `${dst} matches ${SIGNS.filter((s) => longestMatch(ipToInt(dst)!, [s]) === 0).length} signs; the most specific, ${SIGNS[win].prefix}, wins.`,
          ja: `${dst} に合う標識は ${SIGNS.filter((s) => longestMatch(ipToInt(dst)!, [s]) === 0).length} 枚。最も具体的な ${SIGNS[win].prefix} が勝ちます。`,
        })}
      </p>
      <p className="mt-2 text-sm">
        {t({
          en: "This is longest prefix match. Every router here applies it first; route types and BGP attributes only break ties between identical prefixes.",
          ja: "これが最長一致 (ロンゲストプレフィックスマッチ) です。ここに出てくるどのルーターもまずこれを適用し、経路の種類や BGP 属性は同じプレフィックス同士の同点決着にしか使われません。",
        })}
      </p>
    </div>
  );
}

function BgpCard() {
  const { t } = useLang();
  return (
    <div className="grid gap-4">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <div className="panel flex-1 p-3 text-center">
          <p className="font-bold">{t({ en: "Your router", ja: "自社ルーター" })}</p>
          <p className="font-mono text-sm">AS 65001</p>
        </div>
        <div className="flex-[2] space-y-1.5 text-sm">
          <p className="rounded-lg bg-[var(--paper-2)] px-3 py-2">
            <span aria-hidden="true">→ </span>
            {t({
              en: '"I can reach 10.0.0.0/16. Path: 65001."',
              ja: "「10.0.0.0/16 に行けます。経路: 65001」",
            })}
          </p>
          <p className="rounded-lg bg-[var(--paper-2)] px-3 py-2 text-right">
            {t({
              en: '"I can reach 172.31.0.0/16. Path: 64512."',
              ja: "「172.31.0.0/16 に行けます。経路: 64512」",
            })}
            <span aria-hidden="true"> ←</span>
          </p>
        </div>
        <div className="panel flex-1 p-3 text-center">
          <p className="font-bold">
            {t({ en: "AWS gateway", ja: "AWS のゲートウェイ" })}
          </p>
          <p className="font-mono text-sm">AS 64512</p>
        </div>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>
          {t({
            en: "BGP is how two networks tell each other which prefixes they can reach. Each side is an autonomous system with a number (ASN).",
            ja: "BGP は「どのプレフィックスに行けるか」を互いに伝え合う仕組み。それぞれの側は番号 (ASN) を持つ自律システムです。",
          })}
        </li>
        <li>
          {t({
            en: "Private ASNs are 64,512–65,534 and 4,200,000,000–4,294,967,294. The Amazon-side ASN of a gateway defaults to 64512.",
            ja: "プライベート ASN は 64,512〜65,534 と 4,200,000,000〜4,294,967,294。ゲートウェイの Amazon 側 ASN のデフォルトは 64512。",
          })}
        </li>
        <li>
          {t({
            en: "AS_PATH lists the ASes a route passed through. Repeating your own ASN (prepending) makes a path look longer, but only routers that compare AS_PATH care.",
            ja: "AS_PATH は経路が通った AS の列。自分の ASN を繰り返す (プリペンド) と経路が長く見えますが、AS_PATH を比較するルーターにしか効きません。",
          })}
        </li>
        <li>
          {t({
            en: "Static routing skips all this: you type the prefixes by hand, and nothing tells you when a path dies.",
            ja: "静的ルーティングはこれを省き、プレフィックスを手で書きます。経路が死んでも誰も教えてくれません。",
          })}
        </li>
      </ul>
    </div>
  );
}

const KIND_ORDER: Kind[] = ["underlay", "overlay", "service"];
const KIND_HINT: Record<Kind, L> = {
  underlay: {
    en: "Carries the bits. Solid line on the map.",
    ja: "ビットを運ぶ道。地図では実線。",
  },
  overlay: {
    en: "Wraps traffic and rides an underlay. Dashed line.",
    ja: "通信を包んで道の上を走る。破線。",
  },
  service: {
    en: "Needs a road underneath to be reachable at all.",
    ja: "下に道がないとそもそも届かない。",
  },
};

function LayersCard() {
  const { t } = useLang();
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {KIND_ORDER.map((k) => (
        <div key={k} className="rounded-lg border border-[var(--line)] p-3">
          <p className="font-bold">{t(KIND[k])}</p>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{t(KIND_HINT[k])}</p>
          <ul className="mt-3 space-y-1.5">
            {ROUTES.filter((r) => r.kind === k).map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-sm font-semibold">
                <Shield label={r.shield} color={r.color} size="sm" />
                {t(r.name)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Hops of a DX path, and which stretch each kind of encryption covers. */
const HOPS: L[] = [
  { en: "Your app", ja: "自社アプリ" },
  { en: "Your router", ja: "自社ルーター" },
  { en: "AWS DX router", ja: "AWS DX ルーター" },
  { en: "VGW / TGW", ja: "VGW / TGW" },
  { en: "App in AWS", ja: "AWS のアプリ" },
];
const ENC: {
  name: string;
  layer: L;
  from: number;
  to: number;
  color: string;
  note: L;
}[] = [
  {
    name: "MACsec",
    layer: { en: "Layer 2, one hop", ja: "L2・1 区間" },
    from: 1,
    to: 2,
    color: "var(--r-dx)",
    note: {
      en: "Only your router ↔ the AWS DX router, on dedicated 10/100/400 Gbps ports.",
      ja: "自社ルーター ↔ AWS DX ルーター間だけ。専用接続 10/100/400 Gbps のみ。",
    },
  },
  {
    name: "IPsec",
    layer: { en: "Layer 3, gateway to gateway", ja: "L3・ゲートウェイ間" },
    from: 1,
    to: 3,
    color: "var(--r-vpn)",
    note: {
      en: "Your router ↔ the AWS gateway: a Site-to-Site VPN, or Private IP VPN over DX.",
      ja: "自社ルーター ↔ AWS ゲートウェイ。Site-to-Site VPN、または DX 上の Private IP VPN。",
    },
  },
  {
    name: "TLS",
    layer: { en: "Layer 7, app to app", ja: "L7・アプリ間" },
    from: 0,
    to: 4,
    color: "var(--r-private)",
    note: {
      en: "End to end, whatever road is underneath. Your application's job.",
      ja: "下の道に関係なく端から端まで。アプリ側の責任。",
    },
  },
];

function EncryptionCard() {
  const { t } = useLang();
  return (
    <div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[34rem] grid-cols-5 gap-y-2 text-center text-xs font-bold">
          {HOPS.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="h-4 w-4 rounded-full border-4 border-[var(--asphalt)] bg-[var(--paper)]"
                aria-hidden="true"
              />
              {t(h)}
            </div>
          ))}
          {ENC.map((e) => (
            <div
              key={e.name}
              className="mx-[10%] rounded-md px-2 py-1 text-left text-[var(--on-color)]"
              style={{ gridColumn: `${e.from + 1} / ${e.to + 2}`, background: e.color }}
            >
              {e.name} <span className="font-normal opacity-90">({t(e.layer)})</span>
            </div>
          ))}
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {ENC.map((e) => (
          <li key={e.name}>
            <b>{e.name}</b>: {t(e.note)}
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Callout tone="warn">
          {t({
            en: 'Direct Connect by itself encrypts nothing. "Private" and "encrypted" are different properties.',
            ja: "Direct Connect 自体は何も暗号化しません。「閉域」と「暗号化」は別の性質です。",
          })}
        </Callout>
      </div>
    </div>
  );
}

export function BasicsSection() {
  return (
    <Section
      id="basics"
      title={{ en: "Rules of the road", ja: "交通ルール" }}
      lead={{
        en: "Five ideas the rest of the page leans on. If you already speak CIDR and BGP, skim the covers and drive on.",
        ja: "このページ全体が前提にしている 5 つの考え方です。CIDR や BGP が分かる人は表紙だけ眺めて先へどうぞ。",
      }}
    >
      <div className="grid gap-3">
        <Card
          n={1}
          open
          title={{ en: "CIDR and prefix length", ja: "CIDR とプレフィックス長" }}
          gist={{
            en: "10.0.0.0/16 is a block of 65,536 addresses. The /16 says how much is fixed.",
            ja: "10.0.0.0/16 は 65,536 個のアドレスのかたまり。/16 は固定部分の長さ。",
          }}
        >
          <CidrCard />
        </Card>
        <Card
          n={2}
          title={{
            en: "Route tables and longest prefix match",
            ja: "ルートテーブルと最長一致",
          }}
          gist={{
            en: "Several signs can point the right way; you follow the most specific one.",
            ja: "正しい方向を指す標識が何枚あっても、従うのは一番具体的な 1 枚。",
          }}
        >
          <RouteSignCard />
        </Card>
        <Card
          n={3}
          title={{ en: "BGP and ASNs", ja: "BGP と ASN" }}
          gist={{
            en: "How your network and AWS tell each other what they can reach.",
            ja: "社内と AWS が「どこへ行けるか」を伝え合う仕組み。",
          }}
        >
          <BgpCard />
        </Card>
        <Card
          n={4}
          title={{
            en: "Underlay, overlay, service",
            ja: "アンダーレイ・オーバーレイ・サービス",
          }}
          gist={{
            en: "Roads, tunnels on roads, and the things that ride them.",
            ja: "道、道の上のトンネル、その上を走るもの。",
          }}
        >
          <LayersCard />
        </Card>
        <Card
          n={5}
          title={{ en: "Where encryption happens", ja: "暗号化はどこで効くか" }}
          gist={{
            en: "MACsec, IPsec and TLS each cover a different stretch of road.",
            ja: "MACsec・IPsec・TLS は、それぞれ違う区間を守ります。",
          }}
        >
          <EncryptionCard />
        </Card>
      </div>
      <Sources
        doc="01-overview.md"
        links={[
          {
            label: "VPC route table priority",
            url: "https://docs.aws.amazon.com/vpc/latest/userguide/route-tables-priority.html",
          },
          {
            label: "Direct Connect encryption in transit",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html",
          },
          {
            label: "Site-to-Site VPN customer gateway options (ASNs)",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/cgw-options.html",
          },
        ]}
      />
    </Section>
  );
}
