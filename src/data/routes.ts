import type { L } from "@/i18n/lang";

export type RouteId =
  "internet" | "vpn" | "dx" | "sdwan" | "people" | "private" | "dns" | "edge";

/** What the route is made of: a road you lay, a tunnel through someone
 * else's road, or a service that rides on top of either. */
export type Kind = "underlay" | "overlay" | "service";

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
  stops: L[];
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
      { en: "Office proxy / firewall", ja: "社内プロキシ / FW" },
      { en: "ISP", ja: "ISP" },
      { en: "AWS edge", ja: "AWS エッジ" },
      {
        en: "Public endpoint (S3, APIs, ALB)",
        ja: "パブリックエンドポイント (S3・API・ALB)",
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
      en: "Two IPsec tunnels from your router to AWS, usually across the internet. Up in an afternoon; each tunnel is capped.",
      ja: "社内ルーターから AWS へ IPsec トンネル 2 本。普通はインターネット越し。半日で開通、トンネルごとに上限あり。",
    },
    section: "vpn",
    stops: [
      {
        en: "Customer gateway (your router)",
        ja: "カスタマーゲートウェイ (自社ルーター)",
      },
      { en: "Internet (or DX)", ja: "インターネット (または DX)" },
      {
        en: "VGW / Transit Gateway / Cloud WAN",
        ja: "VGW / Transit Gateway / Cloud WAN",
      },
      { en: "VPC", ja: "VPC" },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "1.25 Gbps per tunnel (5 Gbps large tunnels)",
          ja: "1 トンネル 1.25 Gbps (大容量トンネルは 5 Gbps)",
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
      en: "A physical port on AWS's router in a colocation building, reached by your own circuit. Private, steady, and weeks to order.",
      ja: "コロケーション施設にある AWS ルーターの物理ポートに、自前の回線でつなぐ。閉域で安定、ただし調達に数週間。",
    },
    section: "dx",
    stops: [
      { en: "Your router", ja: "自社ルーター" },
      { en: "Carrier circuit", ja: "通信事業者の回線" },
      { en: "DX location (cross connect)", ja: "DX ロケーション (クロスコネクト)" },
      { en: "VIF → DX gateway / VGW / TGW", ja: "VIF → DX ゲートウェイ / VGW / TGW" },
      { en: "VPC", ja: "VPC" },
    ],
    specs: [
      {
        k: BW,
        v: { en: "50 Mbps to 400 Gbps per connection", ja: "1 接続 50 Mbps〜400 Gbps" },
      },
      {
        k: ENC,
        v: { en: "No (MACsec or IPsec optional)", ja: "いいえ (MACsec / IPsec は任意)" },
      },
      { k: LEAD, v: { en: "Weeks to months", ja: "数週間〜数か月" } },
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
      { en: "SD-WAN edge at the branch", ja: "拠点の SD-WAN エッジ" },
      { en: "Internet or DX", ja: "インターネット or DX" },
      { en: "Virtual appliance in a VPC", ja: "VPC 内の仮想アプライアンス" },
      { en: "TGW Connect / Cloud WAN Connect", ja: "TGW Connect / Cloud WAN Connect" },
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
      { en: "Laptop + corporate IdP", ja: "PC + 社内 IdP" },
      { en: "Internet", ja: "インターネット" },
      {
        en: "Client VPN / Verified Access / SSM",
        ja: "Client VPN / Verified Access / SSM",
      },
      { en: "One app or one instance", ja: "特定のアプリ / インスタンス" },
    ],
    specs: [
      { k: BW, v: { en: "Per user", ja: "ユーザー単位" } },
      { k: ENC, v: { en: "Yes (TLS / OpenVPN)", ja: "はい (TLS / OpenVPN)" } },
      { k: LEAD, v: { en: "Hours", ja: "数時間" } },
      {
        k: COST,
        v: {
          en: "Endpoint-hours + per user or connection",
          ja: "エンドポイント時間 + ユーザー / 接続単位",
        },
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
      en: "Reaching S3 or an AWS API without the internet: interface endpoints (PrivateLink) at the end of your VPN or DX, or a public VIF.",
      ja: "S3 や AWS API へインターネットを通らずに: VPN / DX の先にインターフェイスエンドポイント (PrivateLink)、またはパブリック VIF。",
    },
    section: "private",
    stops: [
      { en: "On-prem client", ja: "オンプレのクライアント" },
      { en: "VPN or DX", ja: "VPN か DX" },
      { en: "VPC", ja: "VPC" },
      { en: "Interface endpoint (ENI)", ja: "インターフェイスエンドポイント (ENI)" },
      { en: "AWS service", ja: "AWS サービス" },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "10 Gbps per AZ, bursts to 100",
          ja: "AZ あたり 10 Gbps、最大 100 までバースト",
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
      en: "The road is useless if names don't resolve onto it. Route 53 Resolver endpoints bridge your DNS and the VPC's, in both directions.",
      ja: "名前がその道に解決されなければ道は使われない。Route 53 Resolver エンドポイントが社内 DNS と VPC の DNS を双方向につなぐ。",
    },
    section: "dns",
    stops: [
      { en: "On-prem DNS server", ja: "社内 DNS サーバー" },
      { en: "Conditional forwarder", ja: "条件付きフォワーダー" },
      { en: "VPN or DX", ja: "VPN か DX" },
      { en: "Resolver inbound endpoint", ja: "Resolver インバウンドエンドポイント" },
      {
        en: "Private hosted zone / endpoint DNS",
        ja: "プライベートホストゾーン / エンドポイントの DNS",
      },
    ],
    specs: [
      {
        k: BW,
        v: {
          en: "Up to 10,000 queries/s per ENI",
          ja: "ENI あたり最大 10,000 クエリ/秒",
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
      en: "Bring AWS to you instead: Outposts in your data center over a service link, Local Zones nearby, and DataSync or Snowball for moving data.",
      ja: "逆に AWS を手元に: データセンターの Outposts (サービスリンク経由)、近くの Local Zones、データ移送の DataSync や Snowball。",
    },
    section: "edge",
    stops: [
      { en: "Outposts rack in your DC", ja: "自社 DC の Outposts ラック" },
      { en: "Local gateway (to your LAN)", ja: "ローカルゲートウェイ (社内 LAN へ)" },
      {
        en: "Service link (DX or internet)",
        ja: "サービスリンク (DX or インターネット)",
      },
      { en: "Parent Region", ja: "親リージョン" },
    ],
    specs: [
      { k: BW, v: { en: "LAN speed locally", ja: "ローカルは LAN 速度" } },
      { k: ENC, v: { en: "Service link is encrypted", ja: "サービスリンクは暗号化" } },
      { k: LEAD, v: { en: "Weeks (hardware)", ja: "数週間 (ハードウェア)" } },
      { k: COST, v: { en: "Capacity commitment", ja: "容量のコミット" } },
    ],
  },
];

export const ROUTE: Record<RouteId, Route> = Object.fromEntries(
  ROUTES.map((r) => [r.id, r]),
) as Record<RouteId, Route>;
