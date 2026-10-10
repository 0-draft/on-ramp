import type { L } from "@/i18n/lang";

export interface Term {
  en: string;
  /** Japanese name in AWS docs/console where verified, else common usage. */
  ja: string;
  /** True when the Japanese name was found on a docs.aws.amazon.com/ja_jp page. */
  verified: boolean;
  def: L;
  confused?: L;
}

export interface Group {
  name: L;
  terms: Term[];
}

/** docs/16-glossary.md */
export const GLOSSARY: Group[] = [
  {
    name: { en: "Connectivity and underlay", ja: "接続とアンダーレイ" },
    terms: [
      {
        en: "Hybrid network",
        ja: "ハイブリッドネットワーク",
        verified: false,
        def: {
          en: "One network spanning AWS and on-premises sites",
          ja: "AWS とオンプレミス拠点にまたがる 1 つのネットワーク",
        },
        confused: { en: "Multicloud", ja: "マルチクラウド" },
      },
      {
        en: "AWS Site-to-Site VPN",
        ja: "AWS Site-to-Site VPN",
        verified: true,
        def: {
          en: "Managed IPsec connection (two tunnels) between your gateway device and a VGW, TGW or Cloud WAN",
          ja: "自社のゲートウェイ機器と VGW・TGW・Cloud WAN を結ぶマネージド IPsec 接続 (トンネル 2 本)",
        },
        confused: { en: "Client VPN", ja: "Client VPN" },
      },
      {
        en: "VPN connection",
        ja: "VPN 接続",
        verified: true,
        def: {
          en: "One Site-to-Site VPN resource; always two tunnels to two AWS endpoints",
          ja: "Site-to-Site VPN のリソース 1 つ。必ず 2 つの AWS エンドポイントへのトンネル 2 本",
        },
        confused: { en: "VPN tunnel", ja: "VPN トンネル" },
      },
      {
        en: "VPN tunnel",
        ja: "VPN トンネル",
        verified: true,
        def: {
          en: "One IPsec path; 1.25 Gbps standard, 5 Gbps large",
          ja: "IPsec の経路 1 本。標準 1.25 Gbps、広帯域幅 5 Gbps",
        },
        confused: { en: "VPN connection", ja: "VPN 接続" },
      },
      {
        en: "Customer gateway",
        ja: "カスタマーゲートウェイ",
        verified: true,
        def: {
          en: "The AWS resource that describes your on-prem VPN device (IP, ASN, certificate)",
          ja: "オンプレの VPN 機器を「記述する」AWS リソース (IP・ASN・証明書)",
        },
        confused: { en: "Customer gateway device", ja: "カスタマーゲートウェイデバイス" },
      },
      {
        en: "Customer gateway device",
        ja: "カスタマーゲートウェイデバイス",
        verified: true,
        def: {
          en: "The physical or software router or firewall on your side",
          ja: "自社側の物理またはソフトウェアのルーター・ファイアウォール",
        },
        confused: { en: "Customer gateway", ja: "カスタマーゲートウェイ" },
      },
      {
        en: "Accelerated Site-to-Site VPN",
        ja: "高速 Site-to-Site VPN 接続 (高速 VPN)",
        verified: true,
        def: {
          en: "VPN that enters AWS at the nearest Global Accelerator edge; Transit Gateway only (including the VPN Concentrator), not VGW or Cloud WAN",
          ja: "最寄りの Global Accelerator エッジから AWS に入る VPN。Transit Gateway 専用 (VPN コンセントレータを含む。VGW と Cloud WAN は不可)",
        },
        confused: { en: "Large bandwidth tunnel", ja: "広帯域幅トンネル" },
      },
      {
        en: "Large bandwidth tunnel",
        ja: "広帯域幅トンネル (LBT)",
        verified: false,
        def: {
          en: "VPN tunnel option of up to 5 Gbps (2025-11); TGW or Cloud WAN only",
          ja: "最大 5 Gbps の VPN トンネルオプション (2025-11)。TGW / Cloud WAN 専用",
        },
        confused: { en: "Accelerated VPN", ja: "高速 VPN" },
      },
      {
        en: "VPN Concentrator",
        ja: "Site-to-Site VPN コンセントレータ",
        verified: true,
        def: {
          en: "Puts many low-bandwidth sites behind one TGW attachment (2025-11)",
          ja: "多数の低帯域拠点を 1 つの TGW アタッチメントにまとめる機能 (2025-11)",
        },
        confused: {
          en: "The VGW, which Japanese docs also call a VPN concentrator. The 2025-11 product is the Site-to-Site VPN Concentrator; the VGW is not it",
          ja: "VGW (日本語ドキュメントでは VGW も「VPN コンセントレータ」と呼ぶ。2025-11 の製品は Site-to-Site VPN コンセントレータで、VGW とは別物)",
        },
      },
      {
        en: "Private IP VPN",
        ja: "プライベート IP VPN",
        verified: false,
        def: {
          en: "IPsec VPN over a DX transit VIF using private outside addresses; requires TGW",
          ja: "DX のトランジット VIF 上でプライベートアドレスを使う IPsec VPN。TGW が必要",
        },
        confused: { en: "VPN over a public VIF", ja: "パブリック VIF 上の VPN" },
      },
      {
        en: "AWS Direct Connect",
        ja: "AWS Direct Connect",
        verified: true,
        def: {
          en: "Private Ethernet connection from your network to AWS at a DX location",
          ja: "DX ロケーションで自社ネットワークと AWS を結ぶ専用イーサネット接続",
        },
        confused: { en: "Site-to-Site VPN", ja: "Site-to-Site VPN" },
      },
      {
        en: "Direct Connect location",
        ja: "Direct Connect ロケーション",
        verified: true,
        def: {
          en: "Colocation building where AWS DX routers live and cross connects happen",
          ja: "AWS の DX ルーターが置かれ、クロスコネクトを行うコロケーション施設",
        },
        confused: { en: "AWS Region", ja: "AWS リージョン" },
      },
      {
        en: "Dedicated connection",
        ja: "専用接続",
        verified: true,
        def: {
          en: "A physical port (1/10/100/400 Gbps) allocated to you",
          ja: "自社に割り当てられた物理ポート (1/10/100/400 Gbps)",
        },
        confused: { en: "Hosted connection", ja: "ホスト接続" },
      },
      {
        en: "Hosted connection",
        ja: "ホスト接続",
        verified: true,
        def: {
          en: "Partner-provisioned logical connection, 50 Mbps to 25 Gbps, one VIF",
          ja: "パートナーが提供する論理接続。50 Mbps〜25 Gbps、VIF は 1 つ",
        },
        confused: { en: "Hosted VIF", ja: "ホスト VIF" },
      },
      {
        en: "Cross connect",
        ja: "クロスコネクト",
        verified: false,
        def: {
          en: "The cable inside the colocation building between your (or your carrier's) equipment and the AWS port",
          ja: "コロケーション施設内で自社 (または通信事業者) の機器と AWS ポートを結ぶケーブル",
        },
        confused: { en: "Direct Connect connection", ja: "Direct Connect 接続" },
      },
      {
        en: "LOA-CFA",
        ja: "LOA-CFA",
        verified: true,
        def: {
          en: "Letter of Authorization and Connecting Facility Assignment, which authorizes the cross connect",
          ja: "クロスコネクトを許可する書類 (Letter of Authorization and Connecting Facility Assignment)",
        },
      },
      {
        en: "Link aggregation group (LAG)",
        ja: "リンク集約グループ (LAG)",
        verified: true,
        def: {
          en: "Same-speed dedicated connections on one AWS device at one location, bundled as one",
          ja: "1 ロケーションの同一 AWS 機器上にある同速度の専用接続を 1 本に束ねたもの",
        },
        confused: { en: "ECMP across locations", ja: "ロケーション間の ECMP" },
      },
      {
        en: "Virtual interface (VIF)",
        ja: "仮想インターフェイス (VIF)",
        verified: true,
        def: {
          en: "A VLAN plus a BGP session on a DX connection",
          ja: "DX 接続上の VLAN と BGP セッション",
        },
        confused: { en: "VPN tunnel", ja: "VPN トンネル" },
      },
      {
        en: "Private VIF",
        ja: "プライベート仮想インターフェイス (プライベート VIF)",
        verified: true,
        def: {
          en: "VIF to a VGW or DX gateway for VPC private IPs (MTU 1500 or 9001)",
          ja: "VGW か DX ゲートウェイへの VIF。VPC のプライベート IP 用 (MTU 1500 / 9001)",
        },
        confused: { en: "Transit VIF", ja: "トランジット VIF" },
      },
      {
        en: "Public VIF",
        ja: "パブリック仮想インターフェイス (パブリック VIF)",
        verified: true,
        def: {
          en: "VIF to AWS public IP ranges (S3, APIs)",
          ja: "AWS のパブリック IP 範囲 (S3・API) への VIF",
        },
        confused: { en: "The internet", ja: "インターネット" },
      },
      {
        en: "Transit VIF",
        ja: "トランジット仮想インターフェイス (トランジット VIF)",
        verified: true,
        def: {
          en: "VIF to a DX gateway associated with TGW or Cloud WAN (MTU 1500 or 8500)",
          ja: "TGW / Cloud WAN と関連付けた DX ゲートウェイへの VIF (MTU 1500 / 8500)",
        },
        confused: { en: "Private VIF", ja: "プライベート VIF" },
      },
      {
        en: "MACsec",
        ja: "MACsec",
        verified: true,
        def: {
          en: "IEEE 802.1AE line-rate layer 2 encryption between your router and the AWS DX router; needs a dedicated port, and covers a carrier circuit only if it is Layer 2 transparent",
          ja: "自社ルーターと AWS DX ルーター間の IEEE 802.1AE によるワイヤーレートの L2 暗号化。専用接続が必要で、通信事業者の回線区間はレイヤー 2 透過のときだけ対象",
        },
        confused: { en: "IPsec", ja: "IPsec" },
      },
      {
        en: "Direct Connect SiteLink",
        ja: "SiteLink",
        verified: false,
        def: {
          en: "Routes traffic between your DX locations over the AWS backbone, bypassing Regions",
          ja: "リージョンを経由せず AWS バックボーンで DX ロケーション間を結ぶ",
        },
        confused: { en: "Transit Gateway peering", ja: "Transit Gateway ピアリング" },
      },
      {
        en: "Resiliency Toolkit",
        ja: "Resiliency Toolkit",
        verified: false,
        def: {
          en: "DX ordering wizard with Maximum, High, and Development and test models; a single connection is the fourth (95% SLA) layout",
          ja: "最大・高・開発/テストの冗長モデルを選べる DX の発注ウィザード。単一接続が 4 つ目の構成 (SLA 95%)",
        },
        confused: { en: "Failover testing", ja: "フェイルオーバーテスト" },
      },
      {
        en: "AWS Interconnect – last mile",
        ja: "AWS Interconnect - last mile",
        verified: false,
        def: {
          en: "Managed partner last-mile connection, 1–100 Gbps, MACsec on",
          ja: "パートナーによるマネージドなラストマイル接続。1〜100 Gbps、MACsec 有効",
        },
        confused: { en: "Hosted connection", ja: "ホスト接続" },
      },
      {
        en: "AWS Interconnect – multicloud",
        ja: "AWS Interconnect - multicloud",
        verified: false,
        def: {
          en: "Managed private layer 3 link between AWS and another cloud",
          ja: "AWS と他クラウドを結ぶマネージドな閉域 L3 接続",
        },
        confused: { en: "VPN to another cloud", ja: "他クラウドへの VPN" },
      },
      {
        en: "Closed network",
        ja: "閉域網 / 閉域接続",
        verified: false,
        def: {
          en: "Japanese industry term for a private carrier network that avoids the internet; on AWS usually DX plus no internet egress",
          ja: "インターネットを通らない通信事業者の閉域ネットワークを指す業界用語。AWS では多くの場合 DX + インターネット出口なし",
        },
        confused: { en: "Encrypted network", ja: "暗号化されたネットワーク" },
      },
      {
        en: "BGP / ASN",
        ja: "BGP / 自律システム番号 (ASN)",
        verified: true,
        def: {
          en: "Dynamic routing protocol, and the number that identifies each side",
          ja: "動的ルーティングプロトコルと、各側を識別する番号",
        },
        confused: { en: "Static routing", ja: "静的ルーティング" },
      },
    ],
  },
  {
    name: { en: "AWS-side hubs and gateways", ja: "AWS 側のハブとゲートウェイ" },
    terms: [
      {
        en: "Virtual private gateway (VGW)",
        ja: "仮想プライベートゲートウェイ (VGW)",
        verified: true,
        def: {
          en: "VPN and DX termination for exactly one VPC",
          ja: "1 つの VPC 専用の VPN / DX 終端",
        },
        confused: { en: "Transit Gateway", ja: "Transit Gateway" },
      },
      {
        en: "Direct Connect gateway (DXGW)",
        ja: "Direct Connect ゲートウェイ (DX ゲートウェイ)",
        verified: true,
        def: {
          en: "Global, route-only object linking VIFs to VGWs, TGWs or Cloud WAN; does not forward between its associations (VIF to VIF only with SiteLink)",
          ja: "VIF と VGW・TGW・Cloud WAN を結ぶグローバルな経路専用オブジェクト。関連付け同士の転送はしない (VIF 同士は SiteLink 有効時のみ)",
        },
        confused: { en: "Transit Gateway", ja: "Transit Gateway" },
      },
      {
        en: "Allowed prefixes",
        ja: "許可されたプレフィックス",
        verified: false,
        def: {
          en: "List on a DX gateway association that defines what is advertised to on-prem",
          ja: "DX ゲートウェイの関連付けで、オンプレへ広告する経路を決めるリスト",
        },
        confused: { en: "VPC CIDR", ja: "VPC CIDR" },
      },
      {
        en: "Transit Gateway (TGW)",
        ja: "Transit Gateway (トランジットゲートウェイ)",
        verified: true,
        def: {
          en: "Regional layer 3 hub for VPC, VPN, DX, Connect and peering attachments",
          ja: "VPC・VPN・DX・Connect・ピアリングをつなぐリージョンの L3 ハブ",
        },
        confused: { en: "Direct Connect gateway", ja: "Direct Connect ゲートウェイ" },
      },
      {
        en: "Attachment",
        ja: "アタッチメント",
        verified: true,
        def: {
          en: "One connection of a VPC, VPN, DX gateway, Connect or peer to a TGW or Cloud WAN",
          ja: "VPC・VPN・DX ゲートウェイ・Connect・ピアを TGW / Cloud WAN につなぐ 1 本の接続",
        },
        confused: { en: "Association", ja: "関連付け" },
      },
      {
        en: "TGW route table",
        ja: "Transit Gateway ルートテーブル",
        verified: true,
        def: { en: "A routing domain inside a TGW", ja: "TGW 内のルーティングドメイン" },
        confused: { en: "VPC route table", ja: "VPC のルートテーブル" },
      },
      {
        en: "Association",
        ja: "関連付け",
        verified: true,
        def: {
          en: "The one TGW route table (or, since 2026-07, policy table) an attachment uses for lookups",
          ja: "アタッチメントが参照する TGW ルートテーブル 1 つ (2026-07 からはポリシーテーブルも可)",
        },
        confused: { en: "Propagation", ja: "ルート伝播" },
      },
      {
        en: "Propagation",
        ja: "ルート伝播 (伝達)",
        verified: true,
        def: {
          en: "An attachment installs its routes into one or more TGW route tables",
          ja: "アタッチメントが自分の経路を 1 つ以上の TGW ルートテーブルに書き込むこと",
        },
        confused: { en: "Association", ja: "関連付け" },
      },
      {
        en: "Connect attachment",
        ja: "Transit Gateway Connect アタッチメント",
        verified: true,
        def: {
          en: "GRE + BGP attachment for SD-WAN appliances over a VPC or DX transport",
          ja: "VPC か DX を土台に SD-WAN アプライアンスをつなぐ GRE + BGP のアタッチメント",
        },
        confused: { en: "VPN attachment", ja: "VPN アタッチメント" },
      },
      {
        en: "Peering attachment",
        ja: "ピアリングアタッチメント",
        verified: true,
        def: {
          en: "TGW-to-TGW link, typically between Regions",
          ja: "TGW 同士の接続。主にリージョン間",
        },
        confused: { en: "VPC peering", ja: "VPC ピアリング" },
      },
      {
        en: "Appliance mode",
        ja: "アプライアンスモード",
        verified: true,
        def: {
          en: "Keeps both directions of a flow in one AZ for stateful inspection VPCs",
          ja: "ステートフルインスペクション用 VPC で、フローの往復を同じ AZ に保つ",
        },
      },
      {
        en: "ECMP",
        ja: "等コストマルチパス (ECMP)",
        verified: true,
        def: {
          en: "Spreads traffic over equal routes; TGW yes, VGW no",
          ja: "同等の経路に通信を分散。TGW は可、VGW は不可",
        },
        confused: { en: "LAG", ja: "LAG" },
      },
      {
        en: "Policy-based routing",
        ja: "ポリシーベースルーティング",
        verified: false,
        def: {
          en: "TGW policy-table rules that pick a route table by source or destination CIDR, port or protocol; traffic matching no rule is dropped (2026-07)",
          ja: "送信元・宛先 CIDR、ポート、プロトコルでルートテーブルを選ぶ TGW のポリシーテーブルのルール。どのルールにも一致しない通信は破棄 (2026-07)",
        },
        confused: { en: "Route table association", ja: "ルートテーブルの関連付け" },
      },
      {
        en: "AWS Cloud WAN",
        ja: "AWS Cloud WAN",
        verified: false,
        def: {
          en: "Managed global WAN defined by a core network policy",
          ja: "コアネットワークポリシーで定義するマネージドなグローバル WAN",
        },
        confused: { en: "Transit Gateway", ja: "Transit Gateway" },
      },
      {
        en: "Core network",
        ja: "コアネットワーク",
        verified: false,
        def: {
          en: "The AWS-managed part of a Cloud WAN global network",
          ja: "Cloud WAN グローバルネットワークのうち AWS が管理する部分",
        },
        confused: { en: "Global network", ja: "グローバルネットワーク" },
      },
      {
        en: "Core network edge",
        ja: "コアネットワークエッジ",
        verified: false,
        def: {
          en: "Per-Region Cloud WAN router managed by AWS",
          ja: "AWS が管理するリージョンごとの Cloud WAN ルーター",
        },
        confused: { en: "Transit Gateway", ja: "Transit Gateway" },
      },
      {
        en: "Segment",
        ja: "セグメント",
        verified: false,
        def: {
          en: "Isolated routing domain in Cloud WAN",
          ja: "Cloud WAN 内で分離されたルーティングドメイン",
        },
        confused: { en: "TGW route table", ja: "TGW ルートテーブル" },
      },
      {
        en: "Service insertion",
        ja: "サービス挿入",
        verified: false,
        def: {
          en: "Cloud WAN policy that steers traffic through firewalls (network function groups)",
          ja: "通信をファイアウォール (ネットワーク機能グループ) に通す Cloud WAN のポリシー",
        },
        confused: { en: "Appliance mode", ja: "アプライアンスモード" },
      },
      {
        en: "VPN CloudHub",
        ja: "VPN CloudHub",
        verified: false,
        def: {
          en: "Hub-and-spoke between several VPN sites through one VGW",
          ja: "1 つの VGW を介した複数 VPN 拠点間のハブ & スポーク",
        },
        confused: { en: "Transit Gateway", ja: "Transit Gateway" },
      },
    ],
  },
  {
    name: { en: "Inside the VPC and DNS", ja: "VPC 内と DNS" },
    terms: [
      {
        en: "Route table",
        ja: "ルートテーブル",
        verified: true,
        def: {
          en: "Per-subnet routing rules; longest prefix wins, then static over propagated",
          ja: "サブネットごとのルーティング規則。最長一致が勝ち、次に静的が伝播より優先",
        },
        confused: { en: "TGW route table", ja: "TGW ルートテーブル" },
      },
      {
        en: "Internet gateway",
        ja: "インターネットゲートウェイ",
        verified: true,
        def: {
          en: "VPC attachment for public internet traffic",
          ja: "パブリックなインターネット通信のための VPC アタッチメント",
        },
        confused: { en: "NAT gateway", ja: "NAT ゲートウェイ" },
      },
      {
        en: "Private NAT gateway",
        ja: "プライベート NAT ゲートウェイ",
        verified: false,
        def: {
          en: "NAT to private addresses, used for overlapping CIDRs",
          ja: "プライベートアドレスへの NAT。CIDR 重複の対策に",
        },
        confused: { en: "NAT gateway", ja: "NAT ゲートウェイ" },
      },
      {
        en: "VPC peering connection",
        ja: "VPC ピアリング接続",
        verified: true,
        def: {
          en: "One-to-one VPC link; not transitive, no edge-to-edge routing",
          ja: "VPC 同士の 1 対 1 接続。推移的でなく、エッジ間ルーティングもできない",
        },
        confused: { en: "Transit Gateway", ja: "Transit Gateway" },
      },
      {
        en: "VPC Block Public Access",
        ja: "VPC Block Public Access",
        verified: false,
        def: {
          en: "Account or Region control that overrides routes and blocks IGW traffic",
          ja: "ルートに優先して IGW 通信を遮断するアカウント / リージョン単位の制御",
        },
        confused: { en: "Network ACL", ja: "ネットワーク ACL" },
      },
      {
        en: "VPC Encryption Controls",
        ja: "VPC 暗号化コントロール",
        verified: false,
        def: {
          en: "Monitor or enforce encryption in transit for VPC traffic (2025-11)",
          ja: "VPC 通信の暗号化を監視または強制 (2025-11)",
        },
        confused: { en: "MACsec", ja: "MACsec" },
      },
      {
        en: "Gateway endpoint",
        ja: "ゲートウェイエンドポイント",
        verified: true,
        def: {
          en: "Route-table target for S3 or DynamoDB; not usable from on-prem",
          ja: "S3 / DynamoDB 向けのルートテーブルのターゲット。オンプレからは使えない",
        },
        confused: { en: "Interface endpoint", ja: "インターフェイスエンドポイント" },
      },
      {
        en: "Interface endpoint",
        ja: "インターフェイスエンドポイント",
        verified: true,
        def: {
          en: "ENI with a private IP for an AWS or partner service; reachable from on-prem",
          ja: "AWS / パートナーのサービス用にプライベート IP を持つ ENI。オンプレから届く",
        },
        confused: { en: "Gateway endpoint", ja: "ゲートウェイエンドポイント" },
      },
      {
        en: "Endpoint service",
        ja: "エンドポイントサービス",
        verified: true,
        def: {
          en: "Your NLB- or GWLB-backed service exposed through PrivateLink",
          ja: "NLB / GWLB を背にして PrivateLink で公開する自社サービス",
        },
        confused: { en: "Interface endpoint", ja: "インターフェイスエンドポイント" },
      },
      {
        en: "Resource gateway / resource configuration",
        ja: "リソースゲートウェイ / リソース設定",
        verified: true,
        def: {
          en: "PrivateLink and Lattice constructs to share a database, domain or IP, including on-prem (2024-12)",
          ja: "DB・ドメイン・IP (オンプレ含む) を共有する PrivateLink / Lattice の仕組み (2024-12)",
        },
        confused: { en: "Endpoint service", ja: "エンドポイントサービス" },
      },
      {
        en: "Resource endpoint / service network endpoint",
        ja: "リソースエンドポイント / サービスネットワークエンドポイント",
        verified: true,
        def: {
          en: "Consumer-side endpoints for one resource or a whole Lattice service network",
          ja: "1 つのリソース、または Lattice サービスネットワーク全体への利用側エンドポイント",
        },
        confused: { en: "Interface endpoint", ja: "インターフェイスエンドポイント" },
      },
      {
        en: "Amazon VPC Lattice",
        ja: "Amazon VPC Lattice",
        verified: false,
        def: {
          en: "Application-layer service networking across VPCs and accounts",
          ja: "VPC・アカウントをまたぐアプリケーション層のサービスネットワーク",
        },
        confused: { en: "Transit Gateway", ja: "Transit Gateway" },
      },
      {
        en: "Route 53 VPC Resolver",
        ja: "Route 53 VPC Resolver",
        verified: true,
        def: {
          en: 'Built-in VPC DNS at VPC base + 2; renamed from "Route 53 Resolver" in 2025-11',
          ja: "VPC のベース + 2 にある組み込み DNS。2025-11 に「Route 53 Resolver」から改名",
        },
        confused: { en: "Global Resolver", ja: "Global Resolver" },
      },
      {
        en: "Inbound endpoint",
        ja: "インバウンドエンドポイント (VPC Resolver)",
        verified: true,
        def: {
          en: "IPs in your VPC that on-prem DNS can forward to",
          ja: "オンプレの DNS が転送先にできる、VPC 内の IP",
        },
        confused: { en: "Outbound endpoint", ja: "アウトバウンドエンドポイント" },
      },
      {
        en: "Outbound endpoint",
        ja: "アウトバウンドエンドポイント (VPC Resolver)",
        verified: true,
        def: {
          en: "The Resolver's way out to on-prem DNS, driven by Resolver rules",
          ja: "Resolver ルールに従ってオンプレ DNS へ問い合わせる出口",
        },
        confused: { en: "Inbound endpoint", ja: "インバウンドエンドポイント" },
      },
      {
        en: "Resolver rule",
        ja: "Resolver ルール / 転送ルール",
        verified: true,
        def: {
          en: "Per-domain forwarding instruction for outbound endpoints",
          ja: "アウトバウンドエンドポイント用のドメインごとの転送指示",
        },
        confused: { en: "Private hosted zone", ja: "プライベートホストゾーン" },
      },
      {
        en: "Private hosted zone",
        ja: "プライベートホストゾーン",
        verified: true,
        def: {
          en: "Route 53 zone visible only to associated VPCs",
          ja: "関連付けた VPC からだけ見える Route 53 のゾーン",
        },
        confused: { en: "Public hosted zone", ja: "パブリックホストゾーン" },
      },
      {
        en: "Route 53 Profiles",
        ja: "Route 53 Profiles",
        verified: false,
        def: {
          en: "Shareable bundle of private hosted zones, Resolver rules, DNS Firewall rule groups and interface endpoint DNS for many VPCs (2024-04)",
          ja: "プライベートホストゾーン・Resolver ルール・DNS Firewall ルールグループ・インターフェイスエンドポイントの DNS を多数の VPC へ共有する束 (2024-04)",
        },
        confused: { en: "Resolver rule sharing", ja: "Resolver ルールの共有" },
      },
      {
        en: "Route 53 Global Resolver",
        ja: "Route 53 Global Resolver",
        verified: false,
        def: {
          en: "Anycast resolver for authorized clients anywhere (GA 2026-03)",
          ja: "許可された端末がどこからでも使えるエニーキャストのリゾルバー (2026-03 GA)",
        },
        confused: { en: "VPC Resolver", ja: "VPC Resolver" },
      },
    ],
  },
  {
    name: { en: "People and data paths", ja: "人とデータの経路" },
    terms: [
      {
        en: "AWS Client VPN",
        ja: "AWS Client VPN",
        verified: true,
        def: {
          en: "Managed OpenVPN-based remote access for users",
          ja: "OpenVPN ベースのマネージドなリモートアクセス",
        },
        confused: { en: "Site-to-Site VPN", ja: "Site-to-Site VPN" },
      },
      {
        en: "Client VPN endpoint",
        ja: "Client VPN エンドポイント",
        verified: true,
        def: {
          en: "The server-side resource users connect to",
          ja: "利用者が接続するサーバー側のリソース",
        },
        confused: { en: "VPC endpoint", ja: "VPC エンドポイント" },
      },
      {
        en: "Target network",
        ja: "ターゲットネットワーク",
        verified: true,
        def: {
          en: "Subnet (or, since 2026-04, TGW) a Client VPN endpoint is associated with",
          ja: "Client VPN エンドポイントを関連付けるサブネット (2026-04 からは TGW も)",
        },
        confused: { en: "Client CIDR", ja: "クライアント CIDR" },
      },
      {
        en: "Authorization rule",
        ja: "承認ルール",
        verified: true,
        def: {
          en: "Which networks a user group may reach through Client VPN",
          ja: "Client VPN 経由でユーザーグループが届いてよいネットワーク",
        },
        confused: { en: "Security group", ja: "セキュリティグループ" },
      },
      {
        en: "Split tunnel",
        ja: "スプリットトンネル (モード)",
        verified: true,
        def: {
          en: "Only the routes in the endpoint's route table go through the VPN (they can include on-premises); everything else uses the local internet",
          ja: "エンドポイントのルートテーブルにある経路 (オンプレも含められる) だけを VPN に通し、それ以外は端末のインターネットへ",
        },
        confused: { en: "Full tunnel", ja: "フルトンネル" },
      },
      {
        en: "AWS Verified Access",
        ja: "AWS Verified Access",
        verified: true,
        def: {
          en: "Per-application zero-trust access with identity and device policies",
          ja: "ID と端末のポリシーによる、アプリ単位のゼロトラストアクセス",
        },
        confused: { en: "Client VPN", ja: "Client VPN" },
      },
      {
        en: "Trust provider",
        ja: "信頼プロバイダー",
        verified: true,
        def: {
          en: "Identity or device-posture source for Verified Access",
          ja: "Verified Access に ID や端末状態を渡す提供元",
        },
        confused: { en: "Identity provider", ja: "ID プロバイダー" },
      },
      {
        en: "Verified Access endpoint / group",
        ja: "Verified Access エンドポイント / グループ",
        verified: true,
        def: {
          en: "An application, and a set of applications sharing a policy",
          ja: "1 つのアプリと、ポリシーを共有するアプリの集まり",
        },
        confused: { en: "Client VPN endpoint", ja: "Client VPN エンドポイント" },
      },
      {
        en: "Session Manager",
        ja: "Session Manager",
        verified: false,
        def: {
          en: "IAM-authorized shell and port forwarding with no inbound ports",
          ja: "IAM で認可するシェルとポートフォワード。受信ポート不要",
        },
        confused: { en: "Bastion host", ja: "踏み台サーバー" },
      },
      {
        en: "AWS Outposts",
        ja: "AWS Outposts",
        verified: false,
        def: {
          en: "AWS-managed racks on-prem, tied to a parent Region by a service link",
          ja: "オンプレに置く AWS 管理のラック。サービスリンクで親リージョンにつながる",
        },
        confused: { en: "Local Zones", ja: "Local Zones" },
      },
    ],
  },
];

/** Width- and case-insensitive: "ＴＧＷ" from a Japanese IME finds "TGW". */
const norm = (x: string) => x.normalize("NFKC").toLowerCase();

/** Match on either name, the definition or the confusable. */
export function matches(term: Term, q: string): boolean {
  const s = norm(q.trim());
  if (!s) return true;
  return [
    term.en,
    term.ja,
    term.def.en,
    term.def.ja,
    term.confused?.en ?? "",
    term.confused?.ja ?? "",
  ].some((x) => norm(x).includes(s));
}
