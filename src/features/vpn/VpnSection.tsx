import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";
import { Callout, MetaphorLimit, Section, Sources, Spec } from "@/components/ui";
import { FailoverLab } from "./FailoverLab";
import { ThroughputLab } from "./ThroughputLab";

const SPECS: { k: L; v: L }[] = [
  {
    k: { en: "Tunnels per connection", ja: "1 接続のトンネル数" },
    v: { en: "2, in different AZs", ja: "2 本 (別々の AZ)" },
  },
  {
    k: { en: "Standard tunnel", ja: "標準トンネル" },
    v: { en: "1.25 Gbps · 140,000 PPS", ja: "1.25 Gbps・140,000 PPS" },
  },
  {
    k: { en: "Large tunnel (2025-11)", ja: "Large トンネル (2025-11)" },
    v: { en: "5 Gbps · 400,000 PPS", ja: "5 Gbps・400,000 PPS" },
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
      ja: "標準 USD 0.048/時、Large 0.60/時",
    },
  },
];

const ENDS: { name: string; what: L; limits: L }[] = [
  {
    name: "Virtual private gateway",
    what: {
      en: "Per-VPC VPN concentrator, attached to one VPC",
      ja: "1 つの VPC にアタッチする VPC 専用の VPN 終端",
    },
    limits: {
      en: "10 connections per VGW. No ECMP, no IPv6, no Large tunnels, no acceleration. VPN CloudHub between branches.",
      ja: "VGW あたり 10 接続。ECMP・IPv6・Large トンネル・高速化はなし。拠点間の VPN CloudHub は可。",
    },
  },
  {
    name: "Transit Gateway",
    what: {
      en: "Regional hub with route tables; VPN is one attachment",
      ja: "ルートテーブルを持つリージョンのハブ。VPN はアタッチメントの 1 種",
    },
    limits: {
      en: "ECMP across tunnels (BGP), Large tunnels, accelerated VPN, Private IP VPN over DX, IPv6 inside and outside.",
      ja: "トンネル間 ECMP (BGP)、Large トンネル、高速化 VPN、DX 上のプライベート IP VPN、内外の IPv6。",
    },
  },
  {
    name: "Cloud WAN",
    what: {
      en: "VPN attaches to a core network edge and lands in a segment",
      ja: "VPN をコアネットワークエッジにアタッチし、セグメントに所属",
    },
    limits: {
      en: "BGP only. Large tunnels and IPv6 supported. The VPN must be in the same account as the core network.",
      ja: "BGP のみ。Large トンネルと IPv6 は対応。VPN はコアネットワークと同じアカウントに必要。",
    },
  },
  {
    name: "VPN Concentrator",
    what: {
      en: "One shared Transit Gateway attachment for many small sites (2025-11-19)",
      ja: "多数の小拠点をまとめる共有の Transit Gateway アタッチメント (2025-11-19)",
    },
    limits: {
      en: "Transit Gateway only. 100 sites, 100 Mbps and 10,000 PPS per site, 5 Gbps total. BGP only, no ECMP.",
      ja: "Transit Gateway のみ。100 拠点、拠点あたり 100 Mbps・10,000 PPS、合計 5 Gbps。BGP のみ、ECMP なし。",
    },
  },
];

const VARIANTS: { title: L; body: L }[] = [
  {
    title: { en: "Accelerated VPN", ja: "高速化 VPN (Accelerated VPN)" },
    body: {
      en: "Global Accelerator brings your tunnels onto the AWS backbone at the nearest edge location. Transit Gateway only, set at creation, NAT-T required, not with Large tunnels. Listed for Tokyo, not for Osaka.",
      ja: "Global Accelerator で最寄りのエッジから AWS バックボーンに乗せます。Transit Gateway のみ、作成時にだけ指定、NAT-T 必須、Large トンネルとは併用不可。東京は対応、大阪は一覧になし。",
    },
  },
  {
    title: {
      en: "Private IP VPN over Direct Connect",
      ja: "Direct Connect 上のプライベート IP VPN",
    },
    body: {
      en: "IPsec over a DX transit VIF to a Transit Gateway, with private outside IPs on both ends. It encrypts DX without a public VIF. Large tunnels work with it; the Concentrator does not.",
      ja: "DX のトランジット VIF 上で Transit Gateway まで IPsec を張り、両端の外部 IP はプライベート。パブリック VIF なしで DX を暗号化できます。Large トンネルは可、Concentrator は不可。",
    },
  },
  {
    title: { en: "Static or BGP", ja: "静的か BGP か" },
    body: {
      en: "Static needs you to list prefixes and fails over on tunnel state alone. BGP is required for ECMP, Cloud WAN and the Concentrator. Limits: 100 prefixes from you to a VGW, 1,000 to a Transit Gateway; exceed them and the session drops.",
      ja: "静的はプレフィックスを手で登録し、フェイルオーバーはトンネル状態だけが頼り。ECMP・Cloud WAN・Concentrator には BGP が必須。上限は社内→VGW 100、→Transit Gateway 1,000 プレフィックスで、超えるとセッションが落ちます。",
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
      <div className="grid gap-3 sm:grid-cols-2">
        {ENDS.map((e) => (
          <article key={e.name} className="panel p-4">
            <h4 className="font-extrabold">{e.name}</h4>
            <p className="mt-1 text-sm text-[var(--muted)]">{t(e.what)}</p>
            <p className="mt-2 text-sm">{t(e.limits)}</p>
          </article>
        ))}
      </div>

      <h3 className="mt-12 mb-2 text-xl font-extrabold">
        {t({ en: "How fast can it go?", ja: "どこまで速くなる?" })}
      </h3>
      <p className="mb-4 max-w-3xl">
        {t({
          en: "Each tunnel has a ceiling: 1.25 Gbps standard, 5 Gbps Large. To go past one tunnel you need ECMP, which only Transit Gateway and Cloud WAN do, only with BGP. Even then, a single flow sticks to one tunnel. A virtual private gateway uses one tunnel to send to you, full stop.",
          ja: "トンネルには上限があります: 標準 1.25 Gbps、Large 5 Gbps。1 本を超えるには ECMP が必要で、できるのは Transit Gateway と Cloud WAN だけ、しかも BGP のときだけ。それでも 1 フローは 1 トンネルに固定。仮想プライベートゲートウェイは社内への送信に 1 本しか使いません。",
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

      <div className="mt-8">
        <Callout tone="bad" title={{ en: "Common traps", ja: "よくある落とし穴" }}>
          <ul className="list-disc space-y-1 pl-5">
            {TRAPS.map((x, i) => (
              <li key={i}>{t(x)}</li>
            ))}
          </ul>
        </Callout>
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
