import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { NAV } from "@/data/nav";
import { Section, Sources, Toggle } from "@/components/ui";
import { GAPS, openGaps, type Fixes, type Gap } from "./gaps";

/** The five decisions every hybrid path stacks up (docs/01, docs/14). */
const STACK: { name: L; ex: L }[] = [
  {
    name: { en: "Underlay", ja: "アンダーレイ" },
    ex: {
      en: "internet, Direct Connect, carrier closed network",
      ja: "インターネット・Direct Connect・閉域網",
    },
  },
  {
    name: { en: "Overlay", ja: "オーバーレイ" },
    ex: { en: "IPsec, GRE, MACsec, TLS", ja: "IPsec・GRE・MACsec・TLS" },
  },
  {
    name: { en: "AWS-side hub", ja: "AWS 側のハブ" },
    ex: { en: "VGW, Transit Gateway, Cloud WAN", ja: "VGW・Transit Gateway・Cloud WAN" },
  },
  {
    name: { en: "VPC", ja: "VPC" },
    ex: { en: "route tables, endpoints, DNS", ja: "ルートテーブル・エンドポイント・DNS" },
  },
  {
    name: { en: "Service", ja: "サービス" },
    ex: { en: "S3, your app, a database", ja: "S3・自社アプリ・DB" },
  },
];

const GAP: Record<Gap, { q: L; open: L; fix: L; to: string }> = {
  encryption: {
    q: { en: "Is it encrypted?", ja: "暗号化されている?" },
    open: {
      en: "No. Direct Connect does not encrypt by default.",
      ja: "いいえ。Direct Connect はデフォルトでは暗号化しません。",
    },
    fix: {
      en: "Add MACsec or an IPsec VPN over DX",
      ja: "MACsec か DX 上の IPsec VPN を追加",
    },
    to: "dx",
  },
  dns: {
    q: {
      en: "Do names resolve to private IPs?",
      ja: "名前はプライベート IP に解決される?",
    },
    open: {
      en: "No. On-prem DNS returns public IPs, so traffic leaves by the internet.",
      ja: "いいえ。社内 DNS がパブリック IP を返し、通信はインターネットへ出ていきます。",
    },
    fix: {
      en: "Resolver inbound endpoint + conditional forwarder",
      ja: "Resolver インバウンドエンドポイント + 条件付きフォワーダー",
    },
    to: "dns",
  },
  endpoint: {
    q: { en: "Can on-prem reach the endpoint?", ja: "オンプレからエンドポイントに届く?" },
    open: {
      en: "No. A gateway endpoint only works from inside the VPC.",
      ja: "いいえ。ゲートウェイエンドポイントは VPC 内からしか使えません。",
    },
    fix: {
      en: "Use an interface endpoint (PrivateLink)",
      ja: "インターフェイスエンドポイント (PrivateLink) を使う",
    },
    to: "private",
  },
  location: {
    q: { en: "Is there a second location?", ja: "2 つ目のロケーションはある?" },
    open: {
      en: "No. One location can't survive a location failure and gets no multi-site SLA.",
      ja: "いいえ。1 ロケーションではロケーション障害に耐えられず、マルチサイト SLA もありません。",
    },
    fix: { en: "Connections in two DX locations", ja: "2 つの DX ロケーションに接続" },
    to: "dx",
  },
};

/** Ranked from docs/14 (editorial ranking: frequency × damage). */
const CONFUSIONS: { title: L; wrong: L; to: string }[] = [
  {
    title: { en: "Private is not encrypted", ja: "閉域 ≠ 暗号化" },
    wrong: {
      en: "Assuming DX or a carrier closed network is encrypted",
      ja: "DX や閉域網は暗号化済みだと思い込む",
    },
    to: "dx",
  },
  {
    title: {
      en: "VGW vs DX gateway vs Transit Gateway",
      ja: "VGW と DX ゲートウェイと Transit Gateway",
    },
    wrong: {
      en: 'Treating three "gateways" as interchangeable',
      ja: "3 つの「ゲートウェイ」を同じものとして扱う",
    },
    to: "hubs",
  },
  {
    title: { en: "A DX gateway is not a hub", ja: "DX ゲートウェイはハブではない" },
    wrong: {
      en: "Expecting VPC-to-VPC traffic through it",
      ja: "VPC 間の通信が通ると期待する",
    },
    to: "hubs",
  },
  {
    title: { en: "Hybrid DNS", ja: "ハイブリッド DNS" },
    wrong: {
      en: "IPs work but names don't, or names resolve to public IPs",
      ja: "IP では届くが名前で届かない、または名前がパブリック IP に解決される",
    },
    to: "dns",
  },
  {
    title: {
      en: "Gateway endpoints are VPC-only",
      ja: "ゲートウェイエンドポイントは VPC 専用",
    },
    wrong: {
      en: "Expecting on-prem to use an S3 gateway endpoint over DX",
      ja: "オンプレから DX 経由で S3 ゲートウェイエンドポイントを使えると思う",
    },
    to: "private",
  },
  {
    title: { en: "DX vs VPN route priority", ja: "DX と VPN の経路優先度" },
    wrong: {
      en: "The backup VPN quietly carries production",
      ja: "バックアップの VPN が本番通信を運んでしまう",
    },
    to: "routing",
  },
  {
    title: { en: "Resiliency is not two cables", ja: "冗長化 ≠ ケーブル 2 本" },
    wrong: {
      en: "Two connections in one location counted as HA",
      ja: "同一ロケーションの 2 接続を冗長化とみなす",
    },
    to: "dx",
  },
  {
    title: { en: "Three kinds of VIF", ja: "3 種類の VIF" },
    wrong: {
      en: "Private VIF where a transit VIF is needed",
      ja: "トランジット VIF が必要な所でプライベート VIF を使う",
    },
    to: "dx",
  },
  {
    title: { en: "VPN bandwidth ceilings", ja: "VPN の帯域上限" },
    wrong: {
      en: "Expecting one tunnel to fill a 10 Gbps line",
      ja: "1 トンネルで 10 Gbps 回線を埋められると思う",
    },
    to: "vpn",
  },
  {
    title: { en: "Asymmetric and flapping tunnels", ja: "非対称経路とトンネルの不安定" },
    wrong: {
      en: "A stateful firewall drops the return traffic",
      ja: "ステートフル FW が戻りの通信を落とす",
    },
    to: "vpn",
  },
  {
    title: { en: "MTU and path MTU discovery", ja: "MTU とパス MTU 探索" },
    wrong: {
      en: "Big packets vanish after failover from DX to VPN",
      ja: "DX から VPN へ切り替わると大きなパケットが消える",
    },
    to: "mtu",
  },
  {
    title: { en: "No transitive routing", ja: "推移的ルーティング不可" },
    wrong: {
      en: "Reaching a peered VPC through another VPC's VPN",
      ja: "別 VPC の VPN 経由でピアリング先に届くと思う",
    },
    to: "hubs",
  },
  {
    title: { en: "Overlapping CIDRs", ja: "CIDR の重複" },
    wrong: {
      en: "Assuming a hub can route two identical 10.0.0.0/16s",
      ja: "同じ 10.0.0.0/16 が 2 つあってもハブがさばけると思う",
    },
    to: "plan",
  },
  {
    title: { en: '"VPN" is three products', ja: "「VPN」は 3 つの製品" },
    wrong: {
      en: "Mixing up Site-to-Site VPN, Client VPN and Verified Access",
      ja: "Site-to-Site VPN・Client VPN・Verified Access を混同する",
    },
    to: "people",
  },
  {
    title: {
      en: "What a closed network (閉域) really needs",
      ja: "「閉域」に本当に必要なもの",
    },
    wrong: {
      en: '"We use DX" taken as "no internet", forgetting APIs, DNS and IGWs',
      ja: "「DX を使っている」=「インターネット不使用」と考え、API・DNS・IGW を忘れる",
    },
    to: "plan",
  },
];

function exitOf(id: string): number {
  return NAV.findIndex((n) => n.id === id) + 1;
}

function ExitLink({ to }: { to: string }) {
  const { t } = useLang();
  const n = NAV.find((x) => x.id === to);
  if (!n) return null;
  return (
    <a
      href={`#${to}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--sign)] px-2 py-1 text-xs font-bold whitespace-nowrap text-[var(--sign-ink)]"
    >
      <span className="rounded-sm bg-[var(--sign-ink)] px-1 text-[var(--sign)]">
        {exitOf(to)}
      </span>
      {t(n.label)}
    </a>
  );
}

export function WhySection() {
  const { t } = useLang();
  const [fixes, setFixes] = useState<Fixes>({
    encryption: false,
    dns: false,
    endpoint: false,
    location: false,
  });
  const open = openGaps(fixes);

  return (
    <Section
      id="why"
      title={{ en: "Why this is hard", ja: "なぜ難しいのか" }}
      lead={{
        en: 'One connection to AWS is really five decisions stacked on top of each other, and AWS gives similar things similar names: three "gateways", three kinds of virtual interface, three products called "VPN". Most mistakes are a right answer at one layer plus a wrong assumption at another.',
        ja: "AWS への接続は 1 つに見えて、実は 5 つの判断の積み重ねです。しかも AWS は似たものに似た名前を付けます。「ゲートウェイ」が 3 つ、仮想インターフェイスが 3 種類、「VPN」という名の製品が 3 つ。ほとんどの失敗は、ある層では正解、別の層では思い込み、という組み合わせです。",
      }}
    >
      {/* The five layers, stacked bottom-up: underlay first, the service on top. */}
      <ol
        className="flex flex-col-reverse gap-1.5"
        aria-label={t({
          en: "The five layers of a hybrid path",
          ja: "ハイブリッド経路の 5 層",
        })}
      >
        {STACK.map((s, i) => (
          <li
            key={i}
            className="flex flex-wrap items-baseline gap-x-3 rounded-lg px-4 py-2.5 text-[var(--sign-ink)]"
            style={{
              background: "var(--asphalt)",
              // Underlay at the bottom and widest; each layer above sits on it.
              marginInline: `${i * 1.25}rem`,
            }}
          >
            <span className="font-black">
              {i + 1}. {t(s.name)}
            </span>
            <span className="text-sm opacity-80">{t(s.ex)}</span>
          </li>
        ))}
      </ol>

      <h3 className="mt-12 text-xl font-extrabold">
        {t({
          en: '"We have Direct Connect, so we\'re private."',
          ja: "「Direct Connect があるから閉域です」",
        })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "That one sentence hides four separate gaps, each at a different layer. Fixing one closes only that one. Switch the fixes on and watch which gaps stay open.",
          ja: "この一文には、層の違う 4 つの穴が隠れています。1 つを塞いでも塞がるのはその 1 つだけ。対策をオンにして、どの穴が残るか見てください。",
        })}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {GAPS.map((g) => {
          const isOpen = open.includes(g);
          return (
            <div
              key={g}
              className="panel p-4"
              style={{ borderLeft: `6px solid ${isOpen ? "var(--bad)" : "var(--ok)"}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold">{t(GAP[g].q)}</p>
                <span
                  className="shrink-0 rounded px-2 py-0.5 text-xs font-black text-[var(--on-color)]"
                  style={{ background: isOpen ? "var(--bad)" : "var(--ok)" }}
                >
                  {isOpen
                    ? t({ en: "✕ gap", ja: "✕ 穴あり" })
                    : t({ en: "✓ closed", ja: "✓ 対策済み" })}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {isOpen
                  ? t(GAP[g].open)
                  : t({ en: "Closed at this layer.", ja: "この層は塞がりました。" })}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Toggle
                  label={GAP[g].fix}
                  checked={fixes[g]}
                  onChange={(v) => setFixes((f) => ({ ...f, [g]: v }))}
                />
                <ExitLink to={GAP[g].to} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 font-bold" aria-live="polite">
        {open.length === 0
          ? t({
              en: "All four closed. Now it's private, encrypted, findable and redundant.",
              ja: "4 つとも対策済み。これで閉域・暗号化・名前解決・冗長化がそろいました。",
            })
          : t({
              en: `${open.length} of 4 gaps still open.`,
              ja: `4 つ中 ${open.length} つの穴が残っています。`,
            })}
      </p>

      <h3 className="mt-12 text-xl font-extrabold">
        {t({ en: "The 15 things people get wrong most", ja: "よくある勘違い 15 選" })}
      </h3>
      <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
        {t({
          en: "Ranked by how often they come up in AWS Knowledge Center and community articles, weighted by how badly a mistake hurts. Each one points to the exit that untangles it.",
          ja: "AWS ナレッジセンターやコミュニティ記事での登場頻度と、間違えた時の痛さで並べています。それぞれ解きほぐす出口へリンクしています。",
        })}
      </p>
      <ol className="mt-4 grid gap-2 md:grid-cols-2">
        {CONFUSIONS.map((c, i) => (
          <li key={i} className="panel flex items-start gap-3 p-3">
            <span className="w-7 shrink-0 text-right text-lg font-black text-[var(--muted)]">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{t(c.title)}</p>
              <p className="text-sm text-[var(--muted)]">{t(c.wrong)}</p>
            </div>
            <ExitLink to={c.to} />
          </li>
        ))}
      </ol>

      <Sources
        doc="14-why-hybrid-is-hard.md"
        links={[
          {
            label: "Direct Connect encryption in transit",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html",
          },
          {
            label: "Hybrid Connectivity whitepaper",
            url: "https://docs.aws.amazon.com/whitepapers/latest/hybrid-connectivity/hybrid-connectivity.html",
          },
          {
            label: "Access S3 over Direct Connect (Knowledge Center)",
            url: "https://repost.aws/knowledge-center/s3-bucket-access-direct-connect",
          },
        ]}
      />
    </Section>
  );
}
