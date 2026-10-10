import type { L } from "@/i18n/lang";

/** Which road a launch belongs to. "hub" has no route of its own on the map. */
export type Family =
  "vpn" | "dx" | "hub" | "sdwan" | "private" | "dns" | "people" | "edge";

export interface Launch {
  /** YYYY-MM-DD, or YYYY-MM when only the month is confirmed. */
  date: string;
  family: Family;
  title: L;
  why: L;
  url: string;
}

const W = "https://aws.amazon.com/about-aws/whats-new/";

/** docs/15-timeline.md, in date order. */
const RAW: Launch[] = [
  {
    date: "2023-06-13",
    family: "people",
    title: { en: "EC2 Instance Connect Endpoint", ja: "EC2 Instance Connect Endpoint" },
    why: {
      en: "SSH/RDP to private instances with IAM, no bastion and no public IP",
      ja: "踏み台もパブリック IP もなしで、IAM でプライベートなインスタンスへ SSH/RDP",
    },
    url: "https://aws.amazon.com/blogs/compute/secure-connectivity-from-public-to-private-introducing-ec2-instance-connect-endpoint-june-13-2023/",
  },
  {
    date: "2024-04-24",
    family: "dx",
    title: { en: "25 Gbps hosted connections", ja: "25 Gbps のホスト接続" },
    why: {
      en: "Partner-delivered capacity up to 25 Gbps without a dedicated port",
      ja: "専用ポートなしでパートナー経由 25 Gbps まで",
    },
    url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/limits.html",
  },
  {
    date: "2025-07-08",
    family: "vpn",
    title: {
      en: "Site-to-Site VPN with IPv6 outer tunnel IPs",
      ja: "Site-to-Site VPN の外側トンネル IP が IPv6 に対応",
    },
    why: { en: "IPv6 underlay for VPN tunnels", ja: "VPN トンネルの下回りに IPv6" },
    url: `${W}2025/07/aws-site-to-site-vpn-supports-ipv6-addresses-outer-tunnel-ips/`,
  },
  {
    date: "2025-07",
    family: "dx",
    title: {
      en: "MACsec on partner interconnects",
      ja: "パートナーのインターコネクトで MACsec",
    },
    why: {
      en: "Encrypts the AWS-to-partner hop for hosted connections, not your circuit to the partner",
      ja: "ホスト接続の AWS〜パートナー区間を暗号化。パートナーまでの自社回線は対象外",
    },
    url: `${W}2025/07/aws-direct-connect-extends-macsec-support-partner-interconnects/`,
  },
  {
    date: "2025-11",
    family: "vpn",
    title: { en: "Site-to-Site VPN with eero", ja: "eero による Site-to-Site VPN" },
    why: {
      en: "Zero-touch VPN for small sites (US)",
      ja: "小規模拠点向けのゼロタッチ VPN (米国)",
    },
    url: `${W}2025/11/site-to-site-vpn-eero-simplify-remote-connectivity/`,
  },
  {
    date: "2025-11-19",
    family: "hub",
    title: { en: "Regional NAT gateway", ja: "リージョナル NAT ゲートウェイ" },
    why: {
      en: "One NAT gateway that spans AZs, no public subnet needed",
      ja: "AZ をまたぐ 1 つの NAT ゲートウェイ。パブリックサブネット不要",
    },
    url: `${W}2025/11/aws-nat-gateway-regional-availability/`,
  },
  {
    date: "2026-08",
    family: "dx",
    title: {
      en: "Interconnect – multicloud with Azure (preview)",
      ja: "Interconnect – multicloud の Azure 対応 (プレビュー)",
    },
    why: { en: "Third partner cloud", ja: "3 社目のパートナークラウド" },
    url: `${W}2026/08/aws-announces-AWS-interconnect-multicloud-microsoft-azure-preview/`,
  },
  {
    date: "2026-09-18",
    family: "private",
    title: {
      en: "PrivateLink tunnel endpoints",
      ja: "PrivateLink トンネルエンドポイント",
    },
    why: {
      en: "One endpoint reaches a whole shared CIDR range, including on-premises",
      ja: "1 つのエンドポイントで共有された CIDR 範囲全体 (オンプレ含む) へ",
    },
    url: `${W}2026/9/privatelink-tunnel-endpoint/`,
  },
  {
    date: "2009-08-25",
    family: "vpn",
    title: { en: "Amazon VPC with IPsec VPN", ja: "Amazon VPC と IPsec VPN" },
    why: {
      en: "The first hybrid path: VPC was VPN-only at launch",
      ja: "最初のハイブリッド経路。VPC は当初 VPN 接続専用だった",
    },
    url: "https://aws.amazon.com/blogs/aws/introducing-amazon-virtual-private-cloud-vpc/",
  },
  {
    date: "2011-08-03",
    family: "dx",
    title: { en: "AWS Direct Connect", ja: "AWS Direct Connect" },
    why: {
      en: "Dedicated connections into AWS; one location, 1 and 10 Gbps",
      ja: "専用接続で AWS へ。1 ロケーション、1 / 10 Gbps から",
    },
    url: `${W}2011/08/03/Announcing-AWS-Direct-Connect/`,
  },
  {
    date: "2014-03-24",
    family: "hub",
    title: { en: "VPC peering", ja: "VPC ピアリング" },
    why: {
      en: "VPC-to-VPC links, but not transitive",
      ja: "VPC 同士の接続。ただし推移的ではない",
    },
    url: `${W}2014/03/24/announcing-vpc-peering/`,
  },
  {
    date: "2015-05-11",
    family: "private",
    title: { en: "S3 gateway endpoints", ja: "S3 ゲートウェイエンドポイント" },
    why: {
      en: "Private S3 from inside a VPC; not reachable from on-prem",
      ja: "VPC 内から閉域で S3 へ。オンプレからは届かない",
    },
    url: `${W}2015/05/introducing-amazon-vpc-endpoints-for-amazon-s3/`,
  },
  {
    date: "2017-11-01",
    family: "dx",
    title: { en: "Direct Connect gateway", ja: "Direct Connect ゲートウェイ" },
    why: {
      en: "One DX connection reaches VPCs in any Region (except China)",
      ja: "1 本の DX で全リージョン (中国を除く) の VPC へ",
    },
    url: `${W}2017/11/aws-direct-connect-enables-global-access`,
  },
  {
    date: "2017-11-28",
    family: "private",
    title: {
      en: "PrivateLink for your own services",
      ja: "自社サービス向け PrivateLink",
    },
    why: {
      en: "Private service endpoints reachable from on-prem over DX/VPN",
      ja: "DX / VPN からも届く閉域のサービスエンドポイント",
    },
    url: `${W}2017/11/aws-privatelink-now-available-for-customer-and-partner-services/`,
  },
  {
    date: "2017-11-29",
    family: "hub",
    title: { en: "Inter-Region VPC peering", ja: "リージョン間 VPC ピアリング" },
    why: { en: "Cross-Region private links", ja: "リージョンをまたぐ閉域接続" },
    url: `${W}2017/11/announcing-support-for-inter-region-vpc-peering`,
  },
  {
    date: "2018-09-11",
    family: "people",
    title: { en: "Session Manager", ja: "Session Manager" },
    why: {
      en: "Admin access with no inbound ports or bastions",
      ja: "受信ポートも踏み台も不要な管理アクセス",
    },
    url: `${W}2018/09/introducing-aws-systems-manager-session-manager/`,
  },
  {
    date: "2018-11-19",
    family: "dns",
    title: {
      en: "Route 53 Resolver endpoints (now VPC Resolver)",
      ja: "Route 53 Resolver エンドポイント (現 VPC Resolver)",
    },
    why: {
      en: "Managed hybrid DNS forwarding in both directions",
      ja: "双方向のハイブリッド DNS 転送をマネージドで",
    },
    url: `${W}2018/11/amazon-route-53-announces-resolver-with-support-for-dns-resolution-over-direct-connect-and-vpn/`,
  },
  {
    date: "2018-11-26",
    family: "hub",
    title: { en: "AWS Transit Gateway", ja: "AWS Transit Gateway" },
    why: {
      en: "A Regional hub replaces VPC meshes and transit VPCs",
      ja: "VPC のメッシュやトランジット VPC を置き換えるリージョンのハブ",
    },
    url: `${W}2018/11/introducing-aws-transit-gateway`,
  },
  {
    date: "2018-12-19",
    family: "people",
    title: { en: "AWS Client VPN", ja: "AWS Client VPN" },
    why: {
      en: "Managed OpenVPN remote access",
      ja: "マネージドな OpenVPN リモートアクセス",
    },
    url: "https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-aws-client-vpn-to-securely-access-aws-and-on-premises-resources/",
  },
  {
    date: "2019-04",
    family: "dx",
    title: {
      en: "Direct Connect to Transit Gateway (transit VIF)",
      ja: "Direct Connect から Transit Gateway へ (トランジット VIF)",
    },
    why: {
      en: "DX to many VPCs through one hub",
      ja: "1 つのハブ経由で DX から多数の VPC へ",
    },
    url: `${W}2019/09/aws-direct-connect-support-for-aws-transit-gateway-is-now-available-in-six-additional-regions`,
  },
  {
    date: "2019-12-03",
    family: "vpn",
    title: { en: "Accelerated Site-to-Site VPN", ja: "高速 Site-to-Site VPN" },
    why: {
      en: "VPN enters the AWS backbone at the nearest edge",
      ja: "最寄りのエッジから AWS バックボーンに入る VPN",
    },
    url: `${W}2019/12/announcing-accelerated-site-to-site-vpn-for-improved-vpn-performance/`,
  },
  {
    date: "2019-12-03",
    family: "hub",
    title: {
      en: "Transit Gateway inter-Region peering",
      ja: "Transit Gateway のリージョン間ピアリング",
    },
    why: {
      en: "Hub-to-hub across Regions on the AWS backbone",
      ja: "AWS バックボーン上でリージョン間のハブをつなぐ",
    },
    url: `${W}2019/12/aws-transit-gateway-supports-inter-region-peering`,
  },
  {
    date: "2019-12-03",
    family: "edge",
    title: { en: "AWS Outposts GA", ja: "AWS Outposts GA" },
    why: {
      en: "AWS racks on-prem, linked back by a service link",
      ja: "AWS のラックを自社に。サービスリンクでリージョンへ",
    },
    url: `${W}2019/12/announcing-general-availability-of-aws-outposts`,
  },
  {
    date: "2020-02-05",
    family: "people",
    title: {
      en: "AWS Client VPN desktop client",
      ja: "AWS Client VPN デスクトップクライアント",
    },
    why: {
      en: "No third-party OpenVPN client needed",
      ja: "サードパーティの OpenVPN クライアントが不要に",
    },
    url: `${W}2020/02/introducing-the-desktop-client-for-aws-client-vpn`,
  },
  {
    date: "2020-11-11",
    family: "hub",
    title: { en: "Gateway Load Balancer", ja: "Gateway Load Balancer" },
    why: {
      en: "Inline inspection appliances for hybrid traffic",
      ja: "ハイブリッド通信をインライン検査するアプライアンス",
    },
    url: `${W}2020/11/introducing-aws-gateway-load-balancer`,
  },
  {
    date: "2020-12-10",
    family: "sdwan",
    title: { en: "Transit Gateway Connect", ja: "Transit Gateway Connect" },
    why: {
      en: "Native SD-WAN integration with GRE + BGP",
      ja: "GRE + BGP による SD-WAN のネイティブ統合",
    },
    url: `${W}2020/12/introducing-aws-transit-gateway-connect-to-simplify-sd-wan-branch-connectivity`,
  },
  {
    date: "2021-03-31",
    family: "dx",
    title: { en: "MACsec on dedicated DX", ja: "専用 DX の MACsec" },
    why: {
      en: "Line-rate L2 encryption on the DX hop",
      ja: "DX 区間をワイヤーレートで L2 暗号化",
    },
    url: `${W}2021/03/aws-direct-connect-announces-macsec-encryption-for-dedicated-10gbps-and-100gbps-connections-at-select-locations/`,
  },
  {
    date: "2021-12-01",
    family: "dx",
    title: { en: "Direct Connect SiteLink", ja: "Direct Connect SiteLink" },
    why: {
      en: "Site-to-site over the AWS backbone, bypassing Regions",
      ja: "リージョンを経由せず AWS バックボーンで拠点間通信",
    },
    url: `${W}2021/12/aws-direct-connect-sitelink`,
  },
  {
    date: "2021-12",
    family: "hub",
    title: { en: "AWS Cloud WAN preview", ja: "AWS Cloud WAN プレビュー" },
    why: {
      en: "A policy-driven global network",
      ja: "ポリシーで定義するグローバルネットワーク",
    },
    url: "https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-aws-cloud-wan-preview/",
  },
  {
    date: "2022-06-22",
    family: "vpn",
    title: {
      en: "Private IP VPN over Direct Connect",
      ja: "Direct Connect 上の Private IP VPN",
    },
    why: {
      en: "IPsec over a transit VIF with private addresses",
      ja: "トランジット VIF 上でプライベートアドレスの IPsec",
    },
    url: `${W}2022/06/aws-site-vpn-introduces-private-ip-security-privacy`,
  },
  {
    date: "2022-07-12",
    family: "hub",
    title: { en: "AWS Cloud WAN GA", ja: "AWS Cloud WAN GA" },
    why: {
      en: "Global hub with segments and central policy",
      ja: "セグメントと中央ポリシーを持つグローバルハブ",
    },
    url: `${W}2022/07/general-availability-aws-cloud-wan/`,
  },
  {
    date: "2023-03-31",
    family: "private",
    title: { en: "Amazon VPC Lattice GA", ja: "Amazon VPC Lattice GA" },
    why: {
      en: "Service-to-service networking across VPCs and accounts",
      ja: "VPC やアカウントをまたぐサービス間ネットワーク",
    },
    url: "https://aws.amazon.com/blogs/aws/introducing-vpc-lattice-simplify-networking-for-service-to-service-communication-preview/",
  },
  {
    date: "2023-04-28",
    family: "people",
    title: { en: "AWS Verified Access GA", ja: "AWS Verified Access GA" },
    why: {
      en: "VPN-less, per-app zero-trust access",
      ja: "VPN 不要、アプリ単位のゼロトラストアクセス",
    },
    url: `${W}2023/04/aws-verified-access-generally-available/`,
  },
  {
    date: "2023-10-24",
    family: "sdwan",
    title: {
      en: "Cloud WAN tunnel-less Connect",
      ja: "Cloud WAN のトンネルレス Connect",
    },
    why: {
      en: "SD-WAN appliances in a VPC without GRE or IPsec",
      ja: "GRE も IPsec もなしで VPC 内の SD-WAN アプライアンスと接続",
    },
    url: `${W}2023/10/aws-cloud-wan-tunnel-less-high-performant-global-sd-wans/`,
  },
  {
    date: "2024-04-22",
    family: "dns",
    title: { en: "Route 53 Profiles", ja: "Route 53 Profiles" },
    why: {
      en: "Share DNS settings across VPCs and accounts",
      ja: "DNS 設定を VPC・アカウント間で共有",
    },
    url: `${W}2024/04/amazon-route-53-profiles/`,
  },
  {
    date: "2024-06-11",
    family: "hub",
    title: { en: "Cloud WAN service insertion", ja: "Cloud WAN サービス挿入" },
    why: {
      en: "Inspection written into the core network policy",
      ja: "検査をコアネットワークのポリシーに記述",
    },
    url: `${W}2024/06/aws-cloud-wan-service-insertion`,
  },
  {
    date: "2024-07-01",
    family: "dx",
    title: { en: "400 Gbps dedicated DX", ja: "400 Gbps 専用 DX" },
    why: { en: "The largest single port", ja: "最大の単一ポート" },
    url: `${W}2024/07/aws-direct-connect-native-400-gbps-dedicated-connections-select-locations/`,
  },
  {
    date: "2024-11-19",
    family: "private",
    title: { en: "VPC Block Public Access", ja: "VPC Block Public Access" },
    why: {
      en: "Authoritatively block IGW traffic for closed-network designs",
      ja: "IGW 通信を強制的に遮断。閉域設計の助けに",
    },
    url: `${W}2024/11/block-public-access-amazon-virtual-private-cloud`,
  },
  {
    date: "2024-11-25",
    family: "dx",
    title: {
      en: "Cloud WAN native DX gateway attachment",
      ja: "Cloud WAN に DX ゲートウェイを直接アタッチ",
    },
    why: {
      en: "DX straight into Cloud WAN, no TGW in between",
      ja: "TGW を挟まず DX を Cloud WAN へ",
    },
    url: `${W}2024/11/aws-cloud-wan-on-premises-connectivity-direct-connect/`,
  },
  {
    date: "2024-11-26",
    family: "private",
    title: {
      en: "Cross-Region PrivateLink (endpoint services)",
      ja: "リージョン間 PrivateLink (エンドポイントサービス)",
    },
    why: {
      en: "Interface endpoints to services in other Regions",
      ja: "他リージョンのサービスへインターフェイスエンドポイントで",
    },
    url: `${W}2024/11/aws-privatelink-across-region-connectivity`,
  },
  {
    date: "2024-12-01",
    family: "private",
    title: {
      en: "PrivateLink access to VPC resources",
      ja: "PrivateLink で VPC リソースへアクセス",
    },
    why: {
      en: "Share a database or IP, even on-prem, without an NLB",
      ja: "NLB なしで DB や IP (オンプレも) を共有",
    },
    url: `${W}2024/12/access-vpc-resources-aws-privatelink`,
  },
  {
    date: "2025-01-22",
    family: "people",
    title: { en: "Client VPN concurrent connections", ja: "Client VPN 同時接続" },
    why: {
      en: "Several VPN profiles at once on one device",
      ja: "1 台で複数プロファイルを同時に",
    },
    url: `${W}2025/01/aws-client-vpn-concurrent-vpn-connections`,
  },
  {
    date: "2025-02-06",
    family: "people",
    title: {
      en: "Verified Access for TCP, SSH, RDP",
      ja: "Verified Access が TCP・SSH・RDP に対応",
    },
    why: {
      en: "Zero-trust access to databases and servers",
      ja: "DB やサーバーへのゼロトラストアクセス",
    },
    url: `${W}2025/02/aws-verified-access-zero-trust-resources-non-https-protocols/`,
  },
  {
    date: "2025-06-24",
    family: "dns",
    title: {
      en: "Resolver endpoints: DNS delegation",
      ja: "Resolver エンドポイントの DNS 委任",
    },
    why: {
      en: "NS delegation instead of conditional forwarding",
      ja: "条件付き転送の代わりに NS 委任",
    },
    url: `${W}2025/06/amazon-route-53-resolver-endpoints-dns-delegation-private-hosted-zones/`,
  },
  {
    date: "2025-08-26",
    family: "people",
    title: { en: "Client VPN to IPv6 workloads", ja: "Client VPN が IPv6 に対応" },
    why: {
      en: "IPv6-only and dual-stack endpoints",
      ja: "IPv6 専用・デュアルスタックのエンドポイント",
    },
    url: `${W}2025/08/aws-client-vpn-connectivity-ipv6-resources/`,
  },
  {
    date: "2025-11-12",
    family: "vpn",
    title: { en: "5 Gbps VPN tunnels", ja: "5 Gbps の VPN トンネル" },
    why: {
      en: "4× per-tunnel bandwidth without ECMP",
      ja: "ECMP なしでトンネル帯域 4 倍",
    },
    url: `${W}2025/11/aws-site-to-site-vpn-5-gbps-bandwidth-tunnels/`,
  },
  {
    date: "2025-11-19",
    family: "vpn",
    title: {
      en: "Site-to-Site VPN Concentrator",
      ja: "Site-to-Site VPN コンセントレータ",
    },
    why: {
      en: "Many small sites on one TGW attachment",
      ja: "多数の小拠点を 1 つの TGW アタッチメントに",
    },
    url: `${W}2025/11/aws-site-to-site-vpn-concentrator/`,
  },
  {
    date: "2025-11-30",
    family: "dx",
    title: {
      en: "Interconnect – multicloud (preview)",
      ja: "Interconnect – multicloud (プレビュー)",
    },
    why: {
      en: "Managed private links to other clouds",
      ja: "他クラウドへのマネージド閉域接続",
    },
    url: `${W}2025/11/preview-aws-interconnect-multicloud/`,
  },
  {
    date: "2025-11-21",
    family: "hub",
    title: { en: "TGW Flexible Cost Allocation", ja: "TGW の柔軟なコスト配分" },
    why: {
      en: "Bill data processing to source, destination or a central account",
      ja: "データ処理料を送信元・宛先・中央アカウントに配分",
    },
    url: `${W}2025/11/aws-transit-gateway-flexible-cost-allocation/`,
  },
  {
    date: "2025-11-20",
    family: "hub",
    title: { en: "Cloud WAN Routing Policy", ja: "Cloud WAN ルーティングポリシー" },
    why: {
      en: "Filtering, summarization and BGP attributes in policy",
      ja: "フィルター・集約・BGP 属性をポリシーで",
    },
    url: `${W}2025/11/aws-cloud-wan-routing-policy/`,
  },
  {
    date: "2025-11-19",
    family: "private",
    title: {
      en: "Cross-Region PrivateLink for AWS services",
      ja: "AWS サービスのリージョン間 PrivateLink",
    },
    why: {
      en: "Reach some AWS services in another Region privately",
      ja: "一部の AWS サービスに他リージョンから閉域で",
    },
    url: `${W}2025/11/aws-privatelink-cross-region-connectivity-aws-services/`,
  },
  {
    date: "2025-11-30",
    family: "dns",
    title: {
      en: "Route 53 Global Resolver (preview); Resolver renamed VPC Resolver",
      ja: "Route 53 Global Resolver (プレビュー)。Resolver は VPC Resolver に改名",
    },
    why: {
      en: "Anycast resolver for clients anywhere",
      ja: "どこからでも使えるエニーキャストのリゾルバー",
    },
    url: `${W}2025/11/amazon-route-53-global-resolver-secure-anycast-dns-resolution-preview/`,
  },
  {
    date: "2025-11-21",
    family: "private",
    title: { en: "VPC Encryption Controls", ja: "VPC 暗号化コントロール" },
    why: {
      en: "Audit and enforce encryption in transit (free until 2026-03)",
      ja: "通信の暗号化を監査・強制 (2026-03 まで無料)",
    },
    url: `${W}2025/11/aws-vpc-encryption-controls/`,
  },
  {
    date: "2025-11-30",
    family: "dx",
    title: {
      en: "Interconnect – last mile (gated preview)",
      ja: "Interconnect – last mile (限定プレビュー)",
    },
    why: {
      en: "Managed last-mile private circuits from the console",
      ja: "コンソールからラストマイルの閉域回線を",
    },
    url: `${W}2025/11/gated-preview-interconnect-last-mile/`,
  },
  {
    date: "2025-12-18",
    family: "dx",
    title: { en: "DX resilience testing with AWS FIS", ja: "AWS FIS で DX の障害テスト" },
    why: { en: "Inject BGP failures on VIFs", ja: "VIF に BGP 障害を注入" },
    url: `${W}2025/12/direct-connect-resilience-testing-fault-injection-service/`,
  },
  {
    date: "2026-01-07",
    family: "people",
    title: { en: "Client VPN Quickstart", ja: "Client VPN クイックスタート" },
    why: { en: "An endpoint from three inputs", ja: "3 項目でエンドポイント作成" },
    url: `${W}2026/01/aws-client-vpn-onboarding-quickstart-setup/`,
  },
  {
    date: "2026-03-09",
    family: "dns",
    title: { en: "Route 53 Global Resolver GA", ja: "Route 53 Global Resolver GA" },
    why: {
      en: "Anycast DNS with filtering for remote clients",
      ja: "リモート端末向けフィルター付きエニーキャスト DNS",
    },
    url: `${W}2026/03/amazon-route-53-global-resolver/`,
  },
  {
    date: "2026-03",
    family: "dx",
    title: {
      en: "Direct Connect in CloudFormation",
      ja: "Direct Connect の CloudFormation 対応",
    },
    why: {
      en: "Connections, VIFs, DX gateways and LAGs as code",
      ja: "接続・VIF・DX ゲートウェイ・LAG をコードで",
    },
    url: `${W}2026/03/aws-direct-connect-supports-aws-cloudformation/`,
  },
  {
    date: "2026-03-01",
    family: "private",
    title: {
      en: "VPC Encryption Controls becomes paid",
      ja: "VPC 暗号化コントロールが有料化",
    },
    why: {
      en: "A cost line for compliance designs",
      ja: "コンプライアンス設計のコスト項目に",
    },
    url: `${W}2026/03/vpc-encryption-controls-pricing/`,
  },
  {
    date: "2026-04-13",
    family: "dx",
    title: { en: "Interconnect – last mile GA", ja: "Interconnect – last mile GA" },
    why: {
      en: "Lumen, US; 1–100 Gbps with MACsec by default",
      ja: "Lumen・米国。1〜100 Gbps、MACsec がデフォルト",
    },
    url: `${W}2026/04/aws-announces-ga-AWS-interconnect-last-mile/`,
  },
  {
    date: "2026-04-14",
    family: "dx",
    title: { en: "Interconnect – multicloud GA", ja: "Interconnect – multicloud GA" },
    why: { en: "Google Cloud first", ja: "まずは Google Cloud から" },
    url: `${W}2026/04/aws-announces-ga-AWS-interconnect-multicloud/`,
  },
  {
    date: "2026-04-23",
    family: "people",
    title: {
      en: "Client VPN on Transit Gateway",
      ja: "Client VPN を Transit Gateway に直結",
    },
    why: {
      en: "No intermediate VPC; real client IPs preserved",
      ja: "中継 VPC 不要、クライアントの実 IP を保持",
    },
    url: `${W}2026/04/aws-client-vpn-transit-gateway/`,
  },
  {
    date: "2026-05-06",
    family: "vpn",
    title: {
      en: "Change VPN tunnel bandwidth in place",
      ja: "VPN トンネル帯域をその場で変更",
    },
    why: {
      en: "Standard ↔ large without new tunnel IPs",
      ja: "トンネル IP を変えずに標準 ↔ 広帯域幅",
    },
    url: `${W}2026/05/aws-site-to-site-vpn-modify-bandwidth/`,
  },
  {
    date: "2026-05-07",
    family: "dns",
    title: {
      en: "Resolver endpoints: DNS64 and IPv6 forwarding",
      ja: "Resolver エンドポイントの DNS64・IPv6 転送",
    },
    why: {
      en: "IPv6-only on-prem clients reach IPv4 services",
      ja: "IPv6 専用のオンプレ端末が IPv4 サービスへ",
    },
    url: `${W}2026/05/amazon-route-53-resolver-ipv6/`,
  },
  {
    date: "2026-05",
    family: "private",
    title: {
      en: "VPC Lattice: private domain-name targets",
      ja: "VPC Lattice: プライベートなドメイン名ターゲット",
    },
    why: {
      en: "Share privately resolved names, such as on-prem ones",
      ja: "オンプレなど非公開で解決される名前を共有",
    },
    url: `${W}2026/05/amazon-vpc-lattice/`,
  },
  {
    date: "2026-05",
    family: "dx",
    title: {
      en: "Interconnect – multicloud with OCI (preview)",
      ja: "Interconnect – multicloud が OCI に (プレビュー)",
    },
    why: {
      en: "Second partner cloud after Google Cloud",
      ja: "Google Cloud に続く 2 社目のパートナークラウド",
    },
    url: `${W}2026/05/aws-announces-AWS-interconnect-multicloud-oci-preview/`,
  },
  {
    date: "2026-06-30",
    family: "dx",
    title: {
      en: "Interconnect – last mile with AT&T (preview)",
      ja: "Interconnect – last mile が AT&T に (プレビュー)",
    },
    why: { en: "A second last-mile partner", ja: "2 社目のラストマイルパートナー" },
    url: `${W}2026/06/aws-announces-AWS-interconnect-last-mile-ATT-gated-preview/`,
  },
  {
    date: "2026-07-30",
    family: "hub",
    title: {
      en: "Transit Gateway policy-based routing",
      ja: "Transit Gateway のポリシーベースルーティング",
    },
    why: {
      en: "Steer by source, port or protocol, e.g. DX vs VPN per app",
      ja: "送信元・ポート・プロトコルで振り分け (アプリごとに DX と VPN など)",
    },
    url: `${W}2026/07/aws-transit-gateway-policy-based-routing/`,
  },
  {
    date: "2026-07-30",
    family: "dx",
    title: { en: "DX BGP route visibility", ja: "DX の BGP 経路の可視化" },
    why: {
      en: "See accepted and advertised routes in the console",
      ja: "受信・広告している経路をコンソールで確認",
    },
    url: `${W}2026/07/aws-direct-connect-bgp-visibility/`,
  },
  {
    date: "2026-07-29",
    family: "dx",
    title: {
      en: "Interconnect – multicloud with OCI GA",
      ja: "Interconnect – multicloud の OCI 対応 GA",
    },
    why: { en: "In us-east-1", ja: "us-east-1 で" },
    url: `${W}2026/07/aws-announces-AWS-interconnect-multicloud-OCI-GA/`,
  },
  {
    date: "2026-07",
    family: "private",
    title: {
      en: "VPC Encryption Controls declarative policies",
      ja: "VPC 暗号化コントロールの宣言型ポリシー",
    },
    why: { en: "Organization-wide enforcement", ja: "組織全体で強制" },
    url: `${W}2026/07/vpc-encryption-controls-declarative-controls/`,
  },
  {
    date: "2026-08-20",
    family: "dx",
    title: {
      en: "DX inbound prefix controls; limit 100 → 1,000",
      ja: "DX の受信プレフィックス制御、上限 100 → 1,000",
    },
    why: { en: "Removes summarization workarounds", ja: "経路集約の回避策が不要に" },
    url: `${W}2026/08/aws-direct-connect-new-prefix-controls/`,
  },
  {
    date: "2026-08-13",
    family: "people",
    title: {
      en: "Client VPN client v6 with CLI",
      ja: "Client VPN クライアント v6 と CLI",
    },
    why: {
      en: "A scriptable, centrally managed VPN client",
      ja: "スクリプト化・集中管理できる VPN クライアント",
    },
    url: `${W}2026/08/aws-client-vpn-cli/`,
  },
  {
    date: "2026-09-15",
    family: "dx",
    title: { en: "Direct Connect flat-rate pricing", ja: "Direct Connect の定額料金" },
    why: {
      en: "No per-GB data transfer within the tier; a free second port in a pair",
      ja: "枠内は GB 課金なし。ペアの 2 ポート目は無料",
    },
    url: `${W}2026/09/aws-direct-connect-announces-flat-rate-pricing/`,
  },
  {
    date: "2026-10-05",
    family: "people",
    title: {
      en: "Client VPN device posture",
      ja: "Client VPN の端末の状態 (ポスチャ) 評価",
    },
    why: {
      en: "CrowdStrike, Jamf and JumpCloud checks move into the VPN",
      ja: "CrowdStrike・Jamf・JumpCloud のチェックが VPN に",
    },
    url: `${W}2026/10/aws-client-vpn-device-posture/`,
  },
];

/** Month-only dates sort after exact dates in the same month. */
const sortKey = (d: string) => (d.length === 7 ? `${d}-99` : d);

/** docs/15-timeline.md, in date order. */
export const LAUNCHES: Launch[] = [...RAW].sort((a, b) =>
  sortKey(a.date) < sortKey(b.date) ? -1 : sortKey(a.date) > sortKey(b.date) ? 1 : 0,
);

export function byYear(list: Launch[]): [string, Launch[]][] {
  const m = new Map<string, Launch[]>();
  for (const l of list) {
    const y = l.date.slice(0, 4);
    m.set(y, [...(m.get(y) ?? []), l]);
  }
  return [...m.entries()];
}

/** The first month of the late-2025 wave that changed most answers. */
export const RECENT_FROM = "2025-11";

/**
 * What the timeline shows: one road family (or all), either the recent wave
 * or everything since 2009.
 */
export function filterLaunches(
  list: Launch[],
  family: Family | "all",
  recentOnly: boolean,
): Launch[] {
  return list.filter(
    (l) =>
      (family === "all" || l.family === family) && (!recentOnly || l.date >= RECENT_FROM),
  );
}
