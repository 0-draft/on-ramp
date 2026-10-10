import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";
import { DataTable, MetaphorLimit, Section, Sources, Spec, Traps } from "@/components/ui";
import { FailoverLab } from "./FailoverLab";
import { ThroughputLab } from "./ThroughputLab";

const SPECS: { k: L; v: L }[] = [
  {
    k: { en: "Tunnels per connection", ja: "1 接続のトンネル数" },
    v: { en: "2, in different AZs", ja: "2 本 (別々の AZ)" },
  },
  {
    k: { en: "Standard tunnel", ja: "標準トンネル" },
    v: { en: "1.25 Gbps, 140,000 PPS", ja: "1.25 Gbps、140,000 PPS" },
  },
  {
    k: { en: "Large tunnel (2025-11)", ja: "広帯域幅トンネル (2025-11)" },
    v: { en: "5 Gbps, 400,000 PPS", ja: "5 Gbps、400,000 PPS" },
  },
  {
    k: { en: "Max MTU / MSS", ja: "最大 MTU / MSS" },
    v: { en: "1446 / 1406 bytes", ja: "1446 / 1406 バイト" },
  },
  {
    k: { en: "SLA", ja: "SLA" },
    v: { en: "99.95% per connection", ja: "接続ごとに 99.95%" },
  },
  {
    k: { en: "Tokyo price", ja: "東京の料金" },
    v: {
      en: "USD 0.048/h standard, 0.60/h Large",
      ja: "標準 USD 0.048/時、広帯域幅 0.60/時",
    },
  },
];

// Where the tunnels end, as a feature matrix (docs/02, "AWS-side termination options").
const Y = "✓";
const N = "✕";
const ENDS: { name: string; ecmp: L; large: string; accel: string; ipv6: L; notes: L }[] =
  [
    {
      name: "Virtual private gateway",
      ecmp: { en: "✕ one egress tunnel", ja: "✕ 送信は 1 トンネル" },
      large: N,
      accel: N,
      ipv6: { en: "✕", ja: "✕" },
      notes: {
        en: "Attached to one VPC. 10 connections per VGW (default, adjustable). VPN CloudHub between branches.",
        ja: "VPC 1 つにアタッチ。VGW あたり 10 接続 (既定値、引き上げ可)。拠点間の VPN CloudHub は可。",
      },
    },
    {
      name: "Transit Gateway",
      ecmp: { en: "✓ BGP, on by default", ja: "✓ BGP、既定で有効" },
      large: Y,
      accel: Y,
      ipv6: { en: "✓ inside and outside", ja: "✓ 内側・外側とも" },
      notes: {
        en: "Regional hub with route tables; VPN is one attachment. Private IP VPN over DX.",
        ja: "ルートテーブルを持つリージョンのハブ。VPN はアタッチメントの 1 種。DX 上のプライベート IP VPN も。",
      },
    },
    {
      name: "Cloud WAN",
      ecmp: { en: "✓ BGP, on by default", ja: "✓ BGP、既定で有効" },
      large: Y,
      accel: N,
      ipv6: { en: "✓", ja: "✓" },
      notes: {
        en: "BGP only; lands in a segment. The VPN must be in the same account as the core network. No Private IP VPN: front it with a peered Transit Gateway.",
        ja: "BGP のみ。セグメントに所属。VPN はコアネットワークと同じアカウントに必要。プライベート IP VPN は不可 (ピアリングした Transit Gateway 経由で)。",
      },
    },
    {
      name: "VPN Concentrator (2025-11-19)",
      ecmp: { en: "✕", ja: "✕" },
      large: N,
      accel: Y,
      ipv6: { en: "no dual-stack", ja: "デュアルスタック不可" },
      notes: {
        en: "Transit Gateway only, BGP only. 100 sites, 100 Mbps and 10,000 PPS per site, 5 Gbps shared.",
        ja: "Transit Gateway のみ、BGP のみ。100 拠点、拠点あたり 100 Mbps・10,000 PPS、合計 5 Gbps。",
      },
    },
  ];

const VARIANTS: { title: L; body: L }[] = [
  {
    title: { en: "Accelerated VPN", ja: "高速 VPN (Accelerated VPN)" },
    body: {
      en: "Global Accelerator brings your tunnels onto the AWS backbone at the nearest edge location. Transit Gateway only, set at creation, NAT-T required, not with Large tunnels. Listed for Tokyo, not for Osaka.",
      ja: "Global Accelerator で最寄りのエッジから AWS バックボーンに乗せます。Transit Gateway のみ、作成時にだけ指定、NAT-T 必須、広帯域幅トンネルとは併用不可。東京は対応、大阪は一覧になし。",
    },
  },
  {
    title: {
      en: "Private IP VPN over Direct Connect",
      ja: "Direct Connect 上のプライベート IP VPN",
    },
    body: {
      en: "IPsec over a DX transit VIF to a Transit Gateway, with private outside IPs on both ends. It encrypts DX without a public VIF. Large tunnels work with it; the Concentrator does not. Transit Gateway is the only termination; Cloud WAN reaches it through a peered TGW.",
      ja: "DX のトランジット VIF 上で Transit Gateway まで IPsec を張り、両端の外部 IP はプライベート。パブリック VIF なしで DX を暗号化できます。広帯域幅トンネルは可、VPN コンセントレータは不可。終端は Transit Gateway のみで、Cloud WAN からはピアリングした TGW 経由になります。",
    },
  },
  {
    title: { en: "Static or BGP", ja: "静的か BGP か" },
    body: {
      en: "Static needs you to list prefixes (up to 100 static routes on a VGW) and fails over on tunnel state alone. BGP is required for ECMP, Cloud WAN and the Concentrator. BGP limits: 100 prefixes from you to a VGW, 1,000 to a Transit Gateway; exceed them and the session drops.",
      ja: "静的はプレフィックスを手で登録し (VGW では静的ルートは最大 100)、フェイルオーバーはトンネル状態だけが頼り。ECMP・Cloud WAN・VPN コンセントレータには BGP が必須。BGP の上限は社内から VGW へ 100、Transit Gateway へ 1,000 プレフィックスで、超えるとセッションが落ちます。",
    },
  },
];

const TRAPS: L[] = [
  {
    en: "Configuring only one tunnel: you go down during routine endpoint replacement.",
    ja: "トンネルを 1 本しか設定しない: 定例のエンドポイント交換で停止。",
  },
  {
    en: "Expecting more than 1.25 Gbps from a virtual private gateway.",
    ja: "仮想プライベートゲートウェイに 1.25 Gbps 超を期待する。",
  },
  {
    en: "Expecting ECMP with static routing, or one big transfer to use every tunnel.",
    ja: "静的ルーティングで ECMP、あるいは大きな転送 1 本で全トンネルを使えると思う。",
  },
  {
    en: "Leaving the tunnel interface at MTU 1500: there is no Path MTU Discovery, so set MTU and MSS for your algorithms.",
    ja: "トンネルインターフェイスを MTU 1500 のままにする: PMTUD がないので、暗号方式に合わせて MTU と MSS を設定。",
  },
  {
    en: "Using ASN 10124 for your router in Tokyo, or 7224 anywhere: both are reserved.",
    ja: "東京で ASN 10124、またはどこでも 7224 を自社ルーターに使う: どちらも予約済み。",
  },
  {
    en: "Reading the pricing page examples as the full bill: they leave out Transit Gateway data processing (USD 0.02/GB).",
    ja: "料金ページの例を総額だと思う: Transit Gateway のデータ処理料 (USD 0.02/GB) が抜けています。",
  },
];

export function VpnSection() {
  const { t } = useLang();
  const color = ROUTE.vpn.color;
  return (
    <Section
      id="vpn"
      title={{
        en: "Site-to-Site VPN: two tunnels through the internet",
        ja: "Site-to-Site VPN: インターネットを通る 2 本のトンネル",
      }}
      lead={{
        en: "When TLS per app is not enough, you wrap all traffic between your router and AWS in IPsec. A VPN connection is a customer gateway on your side, a target on the AWS side, and always two tunnels. It is up in minutes on the line you already have, but every tunnel has a hard ceiling.",
        ja: "アプリごとの TLS では足りないとき、社内ルーターと AWS の間の通信を丸ごと IPsec で包みます。VPN 接続は、社内側のカスタマーゲートウェイ、AWS 側の終端、そして必ず 2 本のトンネルでできています。既存の回線で数分で開通しますが、トンネルごとに越えられない上限があります。",
      }}
    >
      <dl
        className="panel grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-5"
        style={{ borderTop: `6px solid ${color}` }}
      >
        {SPECS.map((s, i) => (
          <Spec key={i} k={s.k} v={s.v} />
        ))}
      </dl>

      <h3 className="mt-12 mb-2 text-xl font-extrabold">
        {t({ en: "Why there are always two tunnels", ja: "トンネルが必ず 2 本ある理由" })}
      </h3>
      <p className="mb-4 max-w-3xl">
        {t({
          en: "AWS replaces tunnel endpoints from time to time, one tunnel at a time, keeping the outside IP. With both tunnels configured you only lose redundancy for a while. With one, you lose the connection. Step through a replacement, then flip the switch to see the single-tunnel version.",
          ja: "AWS はときどきトンネルのエンドポイントを交換します。1 本ずつ、外部 IP は変えずに。2 本とも設定していれば一時的に冗長性を失うだけ。1 本だけなら接続そのものを失います。交換を 1 ステップずつ見てから、スイッチで 1 本構成も見てください。",
        })}
      </p>
      <FailoverLab />

      <h3 className="mt-12 mb-3 text-xl font-extrabold">
        {t({
          en: "Where the tunnels end on the AWS side",
          ja: "AWS 側でトンネルが終わる場所",
        })}
      </h3>
      <DataTable
        columns={[
          { en: "Termination", ja: "終端" },
          { en: "ECMP", ja: "ECMP" },
          { en: "Large tunnels", ja: "広帯域幅トンネル" },
          { en: "Accelerated", ja: "高速 VPN" },
          { en: "IPv6", ja: "IPv6" },
          { en: "Notes", ja: "補足" },
        ]}
        rows={ENDS.map((e) => [
          e.name,
          t(e.ecmp),
          e.large,
          e.accel,
          t(e.ipv6),
          <span key="n" className="text-[var(--muted)]">
            {t(e.notes)}
          </span>,
        ])}
      />

      <h3 className="mt-12 mb-2 text-xl font-extrabold">
        {t({ en: "How fast can it go?", ja: "どこまで速くなる?" })}
      </h3>
      <p className="mb-4 max-w-3xl">
        {t({
          en: "Each tunnel has a ceiling: 1.25 Gbps standard, 5 Gbps Large. To go past one tunnel you need ECMP, which only Transit Gateway and Cloud WAN do, only with BGP. Even then, a single flow sticks to one tunnel. A virtual private gateway uses one tunnel to send to you, full stop.",
          ja: "トンネルには上限があります: 標準 1.25 Gbps、広帯域幅 5 Gbps。1 本を超えるには ECMP が必要で、できるのは Transit Gateway と Cloud WAN だけ、しかも BGP のときだけ。それでも 1 フローは 1 トンネルに固定。仮想プライベートゲートウェイは社内への送信に 1 本しか使いません。",
        })}
      </p>
      <ThroughputLab />

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {VARIANTS.map((v, i) => (
          <article key={i} className="panel p-4">
            <h4 className="font-extrabold">{t(v.title)}</h4>
            <p className="mt-2 text-sm">{t(v.body)}</p>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <Traps items={TRAPS} />
      </div>

      <MetaphorLimit>
        {t({
          en: "Roads do not run inside other roads, but tunnels do. A VPN wraps each packet in an encrypted envelope with a new IP header addressed to the AWS endpoint, and the envelope takes space: that is why the usable MTU drops from 1500 to at most 1446 bytes.",
          ja: "道路の中に道路は通りませんが、トンネルは通ります。VPN は各パケットを暗号化した封筒に入れ、AWS エンドポイント宛ての新しい IP ヘッダーを付けます。封筒の分だけ場所を取るので、使える MTU は 1500 から最大 1446 バイトに減ります。",
        })}
      </MetaphorLimit>

      <Sources
        doc="02-site-to-site-vpn.md"
        links={[
          {
            label: "Site-to-Site VPN quotas",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-limits.html",
          },
          {
            label: "Tunnel options",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/VPNTunnels.html",
          },
          {
            label: "Tunnel endpoint replacements",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/endpoint-replacements.html",
          },
          {
            label: "Customer gateway best practices (MTU/MSS)",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/cgw-best-practice.html",
          },
          {
            label: "VPN Concentrator",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-concentrator.html",
          },
          {
            label: "Site-to-Site VPN pricing",
            url: "https://aws.amazon.com/vpn/pricing/",
          },
        ]}
      />
    </Section>
  );
}
