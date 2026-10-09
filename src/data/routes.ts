import type { L } from "@/i18n/lang";

export type RouteId =
  "internet" | "vpn" | "dx" | "sdwan" | "people" | "private" | "dns" | "edge";

/** What the route is made of: a road you lay, a tunnel through someone
 * else's road, or a service that rides on top of either. */
export type Kind = "underlay" | "overlay" | "service";

export interface Stop {
  name: L;
  /** One sentence on what happens to the packet here. */
  say: L;
  /** Index of the point on the hero map where this stop sits. */
  at: number;
}

export interface Route {
  id: RouteId;
  shield: string;
  color: string;
  kind: Kind;
  name: L;
  tagline: L;
  /** The section that explains it. */
  section: string;
  /** Stops along the way, from your side to AWS. */
  stops: Stop[];
  specs: { k: L; v: L }[];
}

export const KIND: Record<Kind, L> = {
  underlay: { en: "Underlay: the road itself", ja: "アンダーレイ: 道そのもの" },
  overlay: { en: "Overlay: a tunnel on a road", ja: "オーバーレイ: 道の上のトンネル" },
  service: { en: "Service: rides on a road", ja: "サービス: 道の上を走る" },
};

const BW = { en: "Bandwidth", ja: "帯域" };
const ENC = { en: "Encrypted by default", ja: "デフォルトで暗号化" };
const LEAD = { en: "Lead time", ja: "開通まで" };
const COST = { en: "You pay for", ja: "課金" };

export const ROUTES: Route[] = [
  {
    id: "internet",
    shield: "I",
    color: "var(--r-internet)",
    kind: "underlay",
    name: { en: "The internet", ja: "インターネット" },
    tagline: {
      en: "Your office's normal internet line to AWS public endpoints. Always there, and the road most other routes are built on.",
      ja: "オフィスの普段のインターネット回線から AWS のパブリックエンドポイントへ。いつでもあり、他の多くの経路の土台でもある道。",
    },
    section: "internet",
    stops: [
      {
        name: { en: "Office proxy / firewall", ja: "社内プロキシ / FW" },
        say: {
          en: "The request leaves through your normal internet egress. AWS sees your office's public IP, not the PC's.",
          ja: "普段のインターネット出口から出ていきます。AWS から見えるのは PC ではなくオフィスのグローバル IP。",
        },
        at: 0,
      },
      {
        name: { en: "ISP", ja: "ISP" },
        say: {
          en: "Your ISP carries it across the public internet. Nobody guarantees the path or the latency.",
          ja: "ISP が公衆インターネットを運びます。経路も遅延も誰も保証しません。",
        },
        at: 1,
      },
      {
        name: { en: "AWS edge", ja: "AWS エッジ" },
        say: {
          en: "It enters the AWS network wherever your ISP hands it over, and rides the AWS backbone the rest of the way.",
          ja: "ISP が AWS に引き渡した地点で AWS ネットワークに入り、以降は AWS のバックボーンを走ります。",
        },
        at: 2,
      },
      {
        name: {
          en: "Public endpoint (S3, APIs, ALB)",
          ja: "パブリックエンドポイント (S3・API・ALB)",
        },
        say: {
          en: "It arrives at a public endpoint. TLS is the only thing that kept it private.",
          ja: "パブリックエンドポイントに到着。中身を守っていたのは TLS だけです。",
        },
        at: 3,
      },
    ],
    specs: [
      { k: BW, v: { en: "Whatever your ISP gives you", ja: "ISP 契約次第" } },
      { k: ENC, v: { en: "Only if the app uses TLS", ja: "アプリが TLS なら" } },
      { k: LEAD, v: { en: "Already there", ja: "既にある" } },
      { k: COST, v: { en: "Data transfer out", ja: "データ転送 (OUT)" } },
    ],
  },
  {
    id: "vpn",
    shield: "VPN",
    color: "var(--r-vpn)",
    kind: "overlay",
    name: { en: "Site-to-Site VPN", ja: "Site-to-Site VPN" },
    tagline: {
      en: "Two IPsec tunnels from your router to AWS, usually across the internet. Up in minutes; each tunnel has a fixed ceiling.",
      ja: "社内ルーターから AWS へ IPsec トンネル 2 本。普通はインターネット越し。数分で開通、ただしトンネルごとに上限が固定。",
    },
    section: "vpn",
    stops: [
      {
        name: {
          en: "Customer gateway (your router)",
          ja: "カスタマーゲートウェイ (自社ルーター)",
        },
        say: {
          en: "Your router wraps the packet in IPsec (ESP) and addresses it to one tunnel's outside IP. The wrapping eats about 54 bytes, so the inner MTU drops to 1446 at best.",
          ja: "自社ルーターがパケットを IPsec (ESP) で包み、トンネルの外側 IP 宛てに送ります。包む分だけ削られ、内側の MTU は最大でも 1446。",
        },
        at: 0,
      },
      {
        name: { en: "Internet (or DX)", ja: "インターネット (または DX)" },
        say: {
          en: "The encrypted packet crosses the internet like any other. With a Private IP VPN it rides a Direct Connect transit VIF instead.",
          ja: "暗号化されたパケットは普通にインターネットを渡ります。プライベート IP VPN なら代わりに Direct Connect のトランジット VIF を通ります。",
        },
        at: 1,
      },
      {
        name: {
          en: "VGW / Transit Gateway / Cloud WAN",
          ja: "VGW / Transit Gateway / Cloud WAN",
        },
        say: {
          en: "AWS decrypts it at the tunnel endpoint on your gateway. Each standard tunnel tops out at 1.25 Gbps; large tunnels (TGW and Cloud WAN only) at 5 Gbps.",
          ja: "ゲートウェイのトンネル終端で AWS が復号。標準トンネルは 1 本 1.25 Gbps、広帯域幅トンネル (TGW と Cloud WAN のみ) は 5 Gbps が上限。",
        },
        at: 3,
      },
      {
        name: { en: "VPC", ja: "VPC" },
        say: {
          en: "The plain packet is routed into the VPC. Your subnet's route table must point back at the gateway for the reply.",
          ja: "復号されたパケットが VPC にルーティングされます。返りのためにサブネットのルートテーブルがゲートウェイを向いている必要があります。",
        },
        at: 5,
      },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "1.25 Gbps per tunnel (large: 5 Gbps)",
          ja: "1 トンネル 1.25 Gbps (広帯域幅トンネル: 5 Gbps)",
        },
      },
      { k: ENC, v: { en: "Yes, IPsec", ja: "はい (IPsec)" } },
      { k: LEAD, v: { en: "Minutes", ja: "数分" } },
      { k: COST, v: { en: "Connection-hours + data out", ja: "接続時間 + データ転送" } },
    ],
  },
  {
    id: "dx",
    shield: "DX",
    color: "var(--r-dx)",
    kind: "underlay",
    name: { en: "Direct Connect", ja: "Direct Connect" },
    tagline: {
      en: "A physical port on AWS's router in a colocation building, reached by your own circuit. Private and steady, but you have to order it.",
      ja: "コロケーション施設にある AWS ルーターの物理ポートに、自前の回線でつなぐ。閉域で安定、ただし発注と工事が要る。",
    },
    section: "dx",
    stops: [
      {
        name: { en: "Your router", ja: "自社ルーター" },
        say: {
          en: "Your router sends the packet on a VLAN toward Direct Connect. It is not encrypted unless you add MACsec or IPsec.",
          ja: "自社ルーターが VLAN に載せて Direct Connect へ送ります。MACsec か IPsec を足さない限り暗号化はされません。",
        },
        at: 0,
      },
      {
        name: { en: "Carrier circuit", ja: "通信事業者の回線" },
        say: {
          en: "A carrier's circuit carries it to the colocation building. AWS does not provide this part; you or a partner do.",
          ja: "通信事業者の回線がコロケーション施設まで運びます。この区間は AWS ではなく自社かパートナーが用意します。",
        },
        at: 1,
      },
      {
        name: {
          en: "DX location (cross connect)",
          ja: "DX ロケーション (クロスコネクト)",
        },
        say: {
          en: "A fiber patch (the cross connect) hands it to AWS's Direct Connect router. From here it is on the AWS backbone.",
          ja: "ファイバーのパッチ (クロスコネクト) で AWS の Direct Connect ルーターへ。ここから先は AWS のバックボーン。",
        },
        at: 2,
      },
      {
        name: {
          en: "VIF → DX gateway / VGW / TGW",
          ja: "VIF → DX ゲートウェイ / VGW / TGW",
        },
        say: {
          en: "The virtual interface (VIF) it arrived on decides where it can go: a private or transit VIF lands on a gateway in front of your VPCs.",
          ja: "届いた仮想インターフェイス (VIF) で行き先が決まります。プライベート / トランジット VIF は VPC 前段のゲートウェイに着地。",
        },
        at: 3,
      },
      {
        name: { en: "VPC", ja: "VPC" },
        say: {
          en: "It reaches the VPC with up to 9001-byte jumbo frames on a private VIF (8500 through a transit VIF and TGW).",
          ja: "VPC に到着。プライベート VIF なら最大 9001 バイトのジャンボフレーム (トランジット VIF と TGW 経由は 8500)。",
        },
        at: 5,
      },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "50 Mbps to 400 Gbps per connection (400G not in Japan)",
          ja: "1 接続 50 Mbps〜400 Gbps (400G は日本未提供)",
        },
      },
      {
        k: ENC,
        v: { en: "No (MACsec or IPsec optional)", ja: "いいえ (MACsec / IPsec は任意)" },
      },
      {
        k: LEAD,
        v: {
          en: "Days (hosted) to months (carrier circuit)",
          ja: "数日 (ホスト型)〜数か月 (回線工事)",
        },
      },
      {
        k: COST,
        v: { en: "Port-hours + cheaper data out", ja: "ポート時間 + 割安なデータ転送" },
      },
    ],
  },
  {
    id: "sdwan",
    shield: "SD",
    color: "var(--r-sdwan)",
    kind: "overlay",
    name: { en: "SD-WAN and Connect", ja: "SD-WAN と Connect" },
    tagline: {
      en: "Your SD-WAN fabric extended into AWS: GRE + BGP to Transit Gateway Connect or Cloud WAN, or a virtual appliance in a VPC.",
      ja: "自社の SD-WAN を AWS まで延長。Transit Gateway Connect / Cloud WAN へ GRE + BGP、または VPC 内の仮想アプライアンス。",
    },
    section: "sdwan",
    stops: [
      {
        name: { en: "SD-WAN edge at the branch", ja: "拠点の SD-WAN エッジ" },
        say: {
          en: "The branch's SD-WAN box puts the packet into the vendor's own overlay tunnel.",
          ja: "拠点の SD-WAN 機器が、ベンダー独自のオーバーレイトンネルにパケットを入れます。",
        },
        at: 0,
      },
      {
        name: { en: "Internet or DX", ja: "インターネット or DX" },
        say: {
          en: "The overlay rides whatever transport you have, often several at once.",
          ja: "オーバーレイは手持ちのどの回線にも乗ります。複数を同時に使うことも多い。",
        },
        at: 1,
      },
      {
        name: {
          en: "TGW Connect / Cloud WAN Connect",
          ja: "TGW Connect / Cloud WAN Connect",
        },
        say: {
          en: "A virtual SD-WAN appliance in AWS hands traffic to the hub over GRE with BGP. Each GRE peer carries up to 5 Gbps, four peers per Connect attachment.",
          ja: "AWS 上の仮想 SD-WAN アプライアンスが GRE + BGP でハブに渡します。GRE ピア 1 つで最大 5 Gbps、Connect アタッチメントあたり 4 ピア。",
        },
        at: 3,
      },
      {
        name: { en: "VPC", ja: "VPC" },
        say: {
          en: "The hub routes it to the VPC like any other attachment.",
          ja: "ハブが他のアタッチメントと同じように VPC へルーティングします。",
        },
        at: 5,
      },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "5 Gbps per GRE peer, up to 4 peers",
          ja: "GRE ピアあたり 5 Gbps、最大 4 ピア",
        },
      },
      {
        k: ENC,
        v: {
          en: "Vendor overlay usually is; GRE is not",
          ja: "ベンダーのオーバーレイ次第。GRE 自体は非暗号",
        },
      },
      { k: LEAD, v: { en: "Days", ja: "数日" } },
      {
        k: COST,
        v: {
          en: "Attachments + appliance + licences",
          ja: "アタッチメント + アプライアンス + ライセンス",
        },
      },
    ],
  },
  {
    id: "people",
    shield: "P",
    color: "var(--r-people)",
    kind: "service",
    name: { en: "People, not sites", ja: "拠点でなく「人」" },
    tagline: {
      en: "For a laptop rather than a building: Client VPN, Verified Access, Session Manager, EC2 Instance Connect Endpoint, WorkSpaces.",
      ja: "建物ではなくノート PC 単位で: Client VPN、Verified Access、Session Manager、EC2 Instance Connect Endpoint、WorkSpaces。",
    },
    section: "people",
    stops: [
      {
        name: { en: "Laptop + corporate IdP", ja: "PC + 社内 IdP" },
        say: {
          en: "The person signs in with your identity provider. Identity, not the building they sit in, decides what they can reach.",
          ja: "社員が社内 IdP でサインイン。どこに座っているかではなく「誰か」で行ける先が決まります。",
        },
        at: 0,
      },
      {
        name: { en: "Internet", ja: "インターネット" },
        say: {
          en: "The connection crosses the internet inside TLS (Verified Access) or an OpenVPN tunnel (Client VPN).",
          ja: "TLS (Verified Access) か OpenVPN トンネル (Client VPN) に包まれてインターネットを渡ります。",
        },
        at: 1,
      },
      {
        name: {
          en: "Client VPN / Verified Access / SSM",
          ja: "Client VPN / Verified Access / SSM",
        },
        say: {
          en: "An AWS-managed front door checks who it is (and, with Verified Access, the device) before letting anything through.",
          ja: "AWS マネージドの入口が、通す前に「誰か」(Verified Access ならデバイスも) を確認します。",
        },
        at: 3,
      },
      {
        name: { en: "One app or one instance", ja: "特定のアプリ / インスタンス" },
        say: {
          en: "The person reaches only what the policy allows: one app, one port, one instance. Not the whole network.",
          ja: "ポリシーで許された先だけに届きます。アプリ 1 つ、ポート 1 つ、インスタンス 1 台。ネットワーク全体ではない。",
        },
        at: 5,
      },
    ],
    specs: [
      {
        k: BW,
        v: { en: "Client VPN: 50 Mbps per user", ja: "Client VPN: 1 ユーザー 50 Mbps" },
      },
      { k: ENC, v: { en: "Yes (TLS / OpenVPN)", ja: "はい (TLS / OpenVPN)" } },
      { k: LEAD, v: { en: "Hours", ja: "数時間" } },
      {
        k: COST,
        v: { en: "Endpoint-hours + per connection", ja: "エンドポイント時間 + 接続単位" },
      },
    ],
  },
  {
    id: "private",
    shield: "PL",
    color: "var(--r-private)",
    kind: "service",
    name: { en: "AWS services, privately", ja: "AWS サービスへ閉域で" },
    tagline: {
      en: "Reaching S3 or an AWS API without the internet: an interface endpoint (PrivateLink) at the far end of your VPN or DX.",
      ja: "S3 や AWS API へインターネットを通らずに: VPN / DX の先にインターフェイスエンドポイント (PrivateLink)。",
    },
    section: "private",
    stops: [
      {
        name: { en: "On-prem client", ja: "オンプレのクライアント" },
        say: {
          en: "An on-prem server calls an AWS API. It only takes the private road if DNS hands it the endpoint's private IP.",
          ja: "オンプレのサーバーが AWS API を呼びます。DNS がエンドポイントのプライベート IP を返したときだけ閉域を通ります。",
        },
        at: 0,
      },
      {
        name: { en: "VPN or DX", ja: "VPN か DX" },
        say: {
          en: "It travels your existing private path into a VPC.",
          ja: "既存の閉域経路で VPC に入ります。",
        },
        at: 1,
      },
      {
        name: { en: "VPC", ja: "VPC" },
        say: {
          en: "Gateway endpoints would stop here: they only work for traffic that starts inside the VPC.",
          ja: "ゲートウェイエンドポイントならここで行き止まり。VPC 内から出た通信にしか効きません。",
        },
        at: 3,
      },
      {
        name: {
          en: "Interface endpoint → AWS service",
          ja: "インターフェイスエンドポイント → AWS サービス",
        },
        say: {
          en: "An interface endpoint is a network interface with a private IP in your subnet. The service answers behind it.",
          ja: "インターフェイスエンドポイントはサブネット内のプライベート IP を持つ ENI。その裏でサービスが応答します。",
        },
        at: 5,
      },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "10 Gbps per AZ, scales to 100",
          ja: "AZ あたり 10 Gbps、100 まで自動拡張",
        },
      },
      { k: ENC, v: { en: "TLS to the service", ja: "サービスまで TLS" } },
      { k: LEAD, v: { en: "Minutes (after VPN/DX)", ja: "数分 (VPN/DX があれば)" } },
      {
        k: COST,
        v: { en: "Endpoint AZ-hours + per GB", ja: "エンドポイントの AZ 時間 + GB 単価" },
      },
    ],
  },
  {
    id: "dns",
    shield: "DNS",
    color: "var(--r-dns)",
    kind: "service",
    name: { en: "Hybrid DNS", ja: "ハイブリッド DNS" },
    tagline: {
      en: "The road is useless if names don't resolve onto it. Route 53 VPC Resolver endpoints bridge your DNS and the VPC's, in both directions.",
      ja: "名前がその道に解決されなければ道は使われない。Route 53 VPC Resolver のエンドポイントが社内 DNS と VPC の DNS を双方向につなぐ。",
    },
    section: "dns",
    stops: [
      {
        name: {
          en: "On-prem DNS (conditional forwarder)",
          ja: "社内 DNS (条件付きフォワーダー)",
        },
        say: {
          en: "Your DNS server forwards queries for AWS-hosted zones to the inbound endpoint's fixed IPs, not to the VPC's .2 address.",
          ja: "社内 DNS が AWS 側ゾーンへの問い合わせを、インバウンドエンドポイントの固定 IP へ転送。VPC の .2 ではありません。",
        },
        at: 0,
      },
      {
        name: { en: "VPN or DX", ja: "VPN か DX" },
        say: {
          en: "The query rides the same private path as the traffic will.",
          ja: "問い合わせも、本番の通信と同じ閉域経路を通ります。",
        },
        at: 1,
      },
      {
        name: {
          en: "VPC Resolver inbound endpoint",
          ja: "VPC Resolver インバウンドエンドポイント",
        },
        say: {
          en: "The inbound endpoint answers as if the query came from inside that VPC, so private hosted zones and endpoint names resolve. Up to 10,000 UDP queries per second per IP.",
          ja: "インバウンドエンドポイントは VPC 内からの問い合わせとして答えるので、プライベートホストゾーンやエンドポイント名が引けます。IP あたり最大 10,000 UDP クエリ/秒。",
        },
        at: 5,
      },
      {
        name: { en: "Answer: a private IP", ja: "答え: プライベート IP" },
        say: {
          en: "The answer is a private IP, so the next connection takes your private road instead of the internet.",
          ja: "返ってくるのはプライベート IP。次の接続はインターネットではなく閉域を通ります。",
        },
        at: 5,
      },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "Up to 10,000 UDP queries/s per endpoint IP",
          ja: "エンドポイント IP あたり最大 10,000 UDP クエリ/秒",
        },
      },
      { k: ENC, v: { en: "Optional DoH", ja: "DoH は任意" } },
      { k: LEAD, v: { en: "Minutes", ja: "数分" } },
      {
        k: COST,
        v: { en: "ENI-hours + per million queries", ja: "ENI 時間 + 100 万クエリ単価" },
      },
    ],
  },
  {
    id: "edge",
    shield: "E",
    color: "var(--r-edge)",
    kind: "underlay",
    name: {
      en: "AWS in your building, and bulk data",
      ja: "社内に AWS を置く・大量データ",
    },
    tagline: {
      en: "Bring AWS to you instead: Outposts in your data center over a service link, Local Zones nearby, and DataSync or offline transfer for moving data.",
      ja: "逆に AWS を手元に: データセンターの Outposts (サービスリンク経由)、近くの Local Zones、データ移送の DataSync やオフライン転送。",
    },
    section: "edge",
    stops: [
      {
        name: { en: "Outposts rack in your DC", ja: "自社 DC の Outposts ラック" },
        say: {
          en: "EC2 instances run in a rack in your own data center, part of a VPC in the parent Region.",
          ja: "自社データセンター内のラックで EC2 が動きます。親リージョンの VPC の一部として。",
        },
        at: 0,
      },
      {
        name: {
          en: "Local gateway (to your LAN)",
          ja: "ローカルゲートウェイ (社内 LAN へ)",
        },
        say: {
          en: "Traffic to your LAN goes out the local gateway and never leaves the building.",
          ja: "社内 LAN 向けの通信はローカルゲートウェイから出て、建物の外に出ません。",
        },
        at: 0,
      },
      {
        name: {
          en: "Service link (DX or internet)",
          ja: "サービスリンク (DX or インターネット)",
        },
        say: {
          en: "The service link is AWS-managed encrypted VPN tunnels back to the Region, riding whatever transport you provide. It needs 1500-byte MTU end to end.",
          ja: "サービスリンクは AWS 管理の暗号化 VPN トンネルで、用意した回線に乗ってリージョンへ戻ります。経路全体で 1500 バイトの MTU が必要。",
        },
        at: 1,
      },
      {
        name: { en: "Parent Region", ja: "親リージョン" },
        say: {
          en: "Control plane and traffic to the rest of the VPC reach the Region. Lose the service link and you lose management.",
          ja: "コントロールプレーンと VPC の他部分への通信がリージョンに届きます。サービスリンクが切れると管理ができなくなります。",
        },
        at: 2,
      },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "Service link: 500 Mbps+ recommended",
          ja: "サービスリンク: 500 Mbps 以上推奨",
        },
      },
      { k: ENC, v: { en: "Service link is encrypted", ja: "サービスリンクは暗号化" } },
      {
        k: LEAD,
        v: { en: "Hardware order and install", ja: "ハードウェアの発注と設置" },
      },
      {
        k: COST,
        v: { en: "The Outposts capacity you order", ja: "発注した Outposts の容量" },
      },
    ],
  },
];

export const ROUTE: Record<RouteId, Route> = Object.fromEntries(
  ROUTES.map((r) => [r.id, r]),
) as Record<RouteId, Route>;

export type Zone = "you" | "between" | "aws";

/** Which band of the map a stop sits in: your network, the road between, or AWS. */
export function zoneOf(route: Route, stop: Stop): Zone {
  if (stop.at === 0) return "you";
  if (route.id === "edge") return stop.at === 1 ? "between" : "aws";
  if (route.id === "internet") return stop.at === 1 ? "between" : "aws";
  return stop.at <= 2 ? "between" : "aws";
}
