import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { DataTable, MetaphorLimit, Section, Sources, Traps } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { EncapLab } from "./EncapLab";
import { CapacityLab } from "./CapacityLab";

interface Option {
  name: string;
  encap: L;
  bw: L;
  when: L;
}

const OPTIONS: Option[] = [
  {
    name: "Transit Gateway Connect",
    encap: {
      en: "GRE + BGP over a VPC or DX attachment",
      ja: "VPC か DX アタッチメント上の GRE + BGP",
    },
    bw: {
      en: "5 Gbps per peer, 4 peers, 20 Gbps per attachment",
      ja: "ピアあたり 5 Gbps・4 ピア・アタッチメントあたり 20 Gbps",
    },
    when: {
      en: "A Regional TGW hub; a VRF per Connect attachment",
      ja: "リージョン単位の TGW ハブ。Connect アタッチメントごとに VRF",
    },
  },
  {
    name: "Cloud WAN Connect (GRE)",
    encap: {
      en: "GRE + BGP over a VPC attachment",
      ja: "VPC アタッチメント上の GRE + BGP",
    },
    bw: { en: "5 Gbps per peer, 4 peers", ja: "ピアあたり 5 Gbps・4 ピア" },
    when: {
      en: "Global network; adding a VRF is another Connect attachment",
      ja: "グローバル網。VRF の追加は Connect アタッチメントを足すだけ",
    },
  },
  {
    name: "Cloud WAN Tunnel-less Connect",
    encap: {
      en: "None: plain BGP with the core network edge",
      ja: "なし: コアネットワークエッジと素の BGP",
    },
    bw: { en: "Up to 100 Gbps per AZ", ja: "AZ あたり最大 100 Gbps" },
    when: {
      en: "Global, high-throughput SD-WAN; one ENI per VRF",
      ja: "グローバルで高スループットの SD-WAN。VRF ごとに ENI 1 つ",
    },
  },
  {
    name: "Self-managed NVA on EC2",
    encap: {
      en: "Whatever you run (IPsec, vendor overlay)",
      ja: "自分で動かすもの (IPsec・ベンダーのオーバーレイ)",
    },
    bw: {
      en: "5 Gbps per flow outside a cluster placement group",
      ja: "クラスタープレイスメントグループ外は 1 フロー 5 Gbps",
    },
    when: {
      en: "Features AWS VPN lacks; no AWS SLA on the tunnel, your own HA",
      ja: "AWS VPN にない機能が必要なとき。トンネルの AWS SLA なし、冗長化は自前",
    },
  },
  {
    name: "Site-to-Site VPN Concentrator",
    encap: {
      en: "Managed IPsec, BGP, Transit Gateway only",
      ja: "マネージド IPsec・BGP・Transit Gateway のみ",
    },
    bw: {
      en: "100 Mbps per site, 100 sites, 5 Gbps shared",
      ja: "拠点あたり 100 Mbps・100 拠点・合計 5 Gbps",
    },
    when: {
      en: "Many small sites without an SD-WAN fabric (2025-11)",
      ja: "SD-WAN のない小規模拠点が多数 (2025-11)",
    },
  },
];

export function SdwanSection() {
  const { t } = useLang();
  return (
    <Section
      id="sdwan"
      title={{
        en: "SD-WAN: a tunnel inside a tunnel",
        ja: "SD-WAN: トンネルの中のトンネル",
      }}
      lead={{
        en: "If your branches already run an SD-WAN fabric, you usually want AWS to become one more site in it, keeping the vendor's path selection and segmentation. The standard pattern is a pair of SD-WAN appliances that speak GRE and BGP to the AWS hub through a Connect attachment, which itself rides on another attachment.",
        ja: "拠点が既に SD-WAN で結ばれているなら、AWS もその 1 拠点にして、ベンダーの経路制御やセグメント分割をそのまま使いたいはず。定番は、SD-WAN アプライアンスのペアが Connect アタッチメントで AWS のハブと GRE + BGP で接続する形で、その Connect アタッチメント自体も別のアタッチメントの上に乗っています。",
      }}
    >
      <h3 className="text-xl font-extrabold">
        {t({ en: "Peel the layers", ja: "レイヤーを剥がしてみる" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "A Connect attachment needs a transport attachment underneath: a VPC attachment when the appliance runs in a VPC, or a DX attachment when it sits on-prem. GRE itself encrypts nothing. Encryption has to come from the vendor overlay, MACsec, or IPsec.",
          ja: "Connect アタッチメントの下には必ずトランスポートのアタッチメントがあります。アプライアンスが VPC 内なら VPC アタッチメント、オンプレなら DX アタッチメント。GRE 自体は何も暗号化しません。暗号化はベンダーのオーバーレイ、MACsec、IPsec のどれかで行います。",
        })}
      </p>
      <div className="mt-4">
        <EncapLab />
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "How much fits", ja: "どれだけ流せるか" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "Bandwidth grows in 5 Gbps steps per GRE peer, up to four peers. Tunnel-less Connect removes the GRE limit and is bounded by the VPC attachment instead. Guess first, then try it in the lab below.",
          ja: "帯域は GRE ピア 1 つにつき 5 Gbps ずつ、最大 4 ピアまで増えます。トンネルレス Connect は GRE の上限がなく、VPC アタッチメントが上限になります。先に予想してから、下のラボで確かめてください。",
        })}
      </p>
      <div className="mt-4">
        <Predict
          question={{
            en: "Your SD-WAN appliance has one GRE Connect peer to the Transit Gateway on a large instance. Branches send 10 Gbps. Enough?",
            ja: "大きなインスタンスの SD-WAN アプライアンスから Transit Gateway へ GRE の Connect ピアが 1 つ。拠点から 10 Gbps 流れてきます。足りる?",
          }}
          options={[
            {
              id: "yes",
              label: {
                en: "Yes, the instance is big",
                ja: "足りる (インスタンスが大きいから)",
              },
            },
            { id: "no", label: { en: "No", ja: "足りない" } },
          ]}
          answer="no"
          why={t({
            en: "A Connect peer is capped at 5 Gbps, and one GRE tunnel is a single flow to EC2 networking, which caps a flow at 5 Gbps outside a cluster placement group. Add peers (up to 4) with identical prefixes and AS_PATH so the TGW can spread flows with ECMP.",
            ja: "Connect ピアの上限は 5 Gbps。しかも GRE トンネル 1 本は EC2 から見て 1 フローで、クラスタープレイスメントグループ外では 1 フロー 5 Gbps が上限です。同じプレフィックス・同じ AS_PATH でピアを足せば (最大 4)、TGW が ECMP でフローを分散します。",
          })}
        >
          <CapacityLab />
        </Predict>
      </div>
      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "The options side by side", ja: "選択肢の比較" })}
      </h3>
      <div className="mt-3">
        <DataTable
          columns={[
            { en: "Option", ja: "選択肢" },
            { en: "Encapsulation", ja: "カプセル化" },
            { en: "Bandwidth", ja: "帯域" },
            { en: "When", ja: "使いどころ" },
          ]}
          rows={OPTIONS.map((o) => [o.name, t(o.encap), t(o.bw), t(o.when)])}
        />
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t({
            en: "A VRF (virtual routing and forwarding) is a separate routing table on one device, which is how SD-WAN keeps segments apart.",
            ja: "VRF (仮想ルーティング・転送) は 1 台の機器の中で経路表を分ける仕組みで、SD-WAN はこれでセグメントを分離します。",
          })}
        </p>
      </div>

      <div className="mt-10">
        <Traps
          items={[
            {
              en: "No BFD (Bidirectional Forwarding Detection, sub-second failure detection) on Connect, and no graceful restart, so failover waits for the 30-second BGP hold timer. Configure both BGP sessions on every peer.",
              ja: "Connect は BFD (サブ秒で障害を検知する仕組み) もグレースフルリスタートも非対応で、フェイルオーバーは BGP ホールドタイマー 30 秒待ち。各ピアの BGP セッションは 2 本とも設定すること。",
            },
            {
              en: "eBGP to a Connect peer needs ebgp-multihop with TTL 2. Leave the peer ASN empty and you end up in iBGP with the TGW.",
              ja: "Connect ピアとの eBGP には ebgp-multihop (TTL 2) が必要。ピア ASN を空にすると TGW と iBGP になります。",
            },
            {
              en: "Cloud WAN Connect does not ride on DX: it uses VPC attachments as transport. For on-prem SD-WAN over DX into Cloud WAN, AWS documents TGW Connect over DX plus TGW-to-Cloud WAN peering.",
              ja: "Cloud WAN Connect は DX に乗りません。トランスポートは VPC アタッチメントのみ。DX 経由のオンプレ SD-WAN を Cloud WAN に入れるには、AWS は「DX 上の TGW Connect + TGW と Cloud WAN のピアリング」を案内しています。",
            },
            {
              en: "The TGW CIDR pool is shared: GRE outer addresses on the AWS side come from the Transit Gateway CIDR blocks, shared with Private IP VPN and Client VPN. Don't overlap it with VPC or on-prem ranges.",
              ja: "TGW CIDR は共用プールです。AWS 側の GRE 外側アドレスは Transit Gateway CIDR ブロックから払い出され、プライベート IP VPN や Client VPN と共用。VPC やオンプレのアドレスと重ねないこと。",
            },
          ]}
        />
      </div>

      <p className="mt-6 max-w-3xl">
        {t({
          en: "Price (Tokyo): a TGW Connect attachment and its VPC transport attachment are $0.07 per hour each, about $102 a month before data. Connect adds no data processing charge beyond the transport attachment's $0.02/GB. On Cloud WAN, the edge alone is $365 a month plus $0.09 per attachment-hour.",
          ja: "料金 (東京): TGW Connect アタッチメントとトランスポート用 VPC アタッチメントがそれぞれ 1 時間 $0.07 で、データ料金を除き月約 $102。Connect 分のデータ処理料はなく、トランスポート側の $0.02/GB のみ。Cloud WAN ならエッジだけで月 $365、加えてアタッチメント 1 時間 $0.09。",
        })}
      </p>

      <MetaphorLimit>
        {t({
          en: "Roads do not run inside other roads, but tunnels do: your packet rides in a vendor overlay, inside GRE, inside a VPC or DX attachment. Every layer adds a header, and only some of them encrypt. That is why the cutaway above, not the map, is the honest picture.",
          ja: "道路の中に道路は通りませんが、トンネルは入れ子になります。パケットはベンダーのオーバーレイに包まれ、さらに GRE に、さらに VPC か DX のアタッチメントに包まれる。レイヤーごとにヘッダーが増え、暗号化するのはその一部だけ。だから地図ではなく、上の断面図のほうが実態に近いのです。",
        })}
      </MetaphorLimit>

      <Sources
        doc="03-sd-wan-and-connect.md"
        links={[
          {
            label: "Transit Gateway Connect",
            url: "https://docs.aws.amazon.com/vpc/latest/tgw/tgw-connect.html",
          },
          {
            label: "Cloud WAN Connect attachments",
            url: "https://docs.aws.amazon.com/network-manager/latest/cloudwan/cloudwan-connect-attachment.html",
          },
          {
            label: "Tunnel-less Connect launch",
            url: "https://aws.amazon.com/about-aws/whats-new/2023/10/aws-cloud-wan-tunnel-less-high-performant-global-sd-wans/",
          },
          {
            label: "EC2 instance network bandwidth",
            url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-network-bandwidth.html",
          },
          {
            label: "Site-to-Site VPN Concentrator",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-concentrator.html",
          },
        ]}
      />
    </Section>
  );
}
