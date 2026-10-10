# Glossary

This glossary covers about 60 terms used across the research set. Each entry gives the English name, the Japanese name used in AWS documentation or the console, a one-line definition, and the term it is most often confused with. Verified as of 2026-10-10. Japanese names marked **✓** were checked against the `docs.aws.amazon.com/ja_jp/` page listed under Sources. Note that AWS marks those pages as machine-translated and says the English version takes precedence. Names marked **–** were not found on a Japanese AWS page during this research. For those, the column shows the commonly used katakana or keeps the English, and the site should show it as unverified.

## Connectivity and underlay

| English | 日本語 | JA | Definition | Often confused with |
| --- | --- | --- | --- | --- |
| Hybrid network | ハイブリッドネットワーク | – | One network spanning AWS and on-premises sites (whitepaper definition) | Multicloud |
| AWS Site-to-Site VPN | AWS Site-to-Site VPN / Site-to-Site VPN 接続 | ✓ | Managed IPsec connection (two tunnels) between your gateway device and a VGW, TGW or Cloud WAN | Client VPN |
| VPN connection | VPN 接続 | ✓ | One Site-to-Site VPN resource; always two tunnels to two AWS endpoints | VPN tunnel |
| VPN tunnel | VPN トンネル | ✓ | One IPsec security association path; 1.25 Gbps standard, 5 Gbps large | VPN connection |
| Customer gateway | カスタマーゲートウェイ | ✓ | The AWS resource that *describes* your on-premises VPN device (IP, ASN, certificate) | Customer gateway device |
| Customer gateway device | カスタマーゲートウェイデバイス | ✓ | The physical or software router or firewall on your side | Customer gateway |
| Accelerated Site-to-Site VPN | 高速 Site-to-Site VPN 接続 (高速 VPN) | ✓ | VPN that enters AWS at the nearest Global Accelerator edge; Transit Gateway only (including the VPN Concentrator), not VGW or Cloud WAN | Large bandwidth tunnel |
| Large bandwidth tunnel | 広帯域幅トンネル (LBT) | – | Site-to-Site VPN tunnel option of up to 5 Gbps (2025-11); TGW or Cloud WAN only | Accelerated VPN |
| VPN Concentrator | Site-to-Site VPN コンセントレータ | ✓ | Site-to-Site VPN feature that puts many low-bandwidth sites behind one TGW attachment (2025-11) | The VGW, which the Japanese docs also describe as the "VPN コンセントレータ" on the AWS side |
| Private IP VPN | プライベート IP VPN (ja doc title: 「AWS Site-to-Site VPN を使用したプライベート IP Direct Connect」) | – | IPsec VPN over a DX transit VIF using private outside addresses; requires TGW | Public VIF VPN |
| AWS Direct Connect | AWS Direct Connect | ✓ | Private Ethernet connection from your network to AWS at a DX location | Site-to-Site VPN |
| Direct Connect location | Direct Connect ロケーション | ✓ | Colocation facility where AWS DX routers live and cross connects happen | AWS Region |
| Dedicated connection | 専用接続 | ✓ | Physical port (1/10/100/400 Gbps) allocated to you | Hosted connection |
| Hosted connection | ホスト接続 (ホスト型接続 also appears) | ✓ | Partner-provisioned logical connection, 50 Mbps–25 Gbps, one VIF | Hosted VIF |
| Cross connect | クロスコネクト | – | Physical cable inside the colocation facility between your (or your carrier's) equipment and the AWS port | Direct Connect connection |
| LOA-CFA | LOA-CFA (英語のまま) | ✓ | Letter of Authorization and Connecting Facility Assignment, which authorizes the cross connect | — |
| Link aggregation group (LAG) | リンク集約グループ (LAG) | ✓ | Bundle of same-speed dedicated connections on one AWS device at one location, acting as one | ECMP across locations |
| Virtual interface (VIF) | 仮想インターフェイス | ✓ | VLAN plus BGP session on a DX connection | VPN tunnel |
| Private VIF | プライベート仮想インターフェイス | ✓ | VIF to a VGW or DXGW for VPC private IPs (MTU 1500/9001) | Transit VIF |
| Public VIF | パブリック仮想インターフェイス | ✓ | VIF to AWS public IP ranges (S3, APIs) | Internet |
| Transit VIF | トランジット仮想インターフェイス | ✓ | VIF to a DXGW associated with TGW or Cloud WAN (MTU 1500/8500) | Private VIF |
| MACsec | MACsec | ✓ | IEEE 802.1AE line-rate L2 encryption between your router and the AWS DX router; needs a dedicated port, and covers a carrier circuit only if it is Layer 2 transparent | IPsec |
| Direct Connect SiteLink | SiteLink | – | Routes traffic between your DX locations over the AWS backbone, bypassing Regions | Transit Gateway peering |
| Resiliency Toolkit | Resiliency Toolkit / 回復性ツールキット (表記未確認) | – | DX ordering wizard: Maximum, High, and Development and test models; a single connection is the fourth (95% SLA) layout | Failover testing |
| AWS Interconnect – last mile | AWS Interconnect - last mile | – | Managed partner last-mile connection, 1–100 Gbps, MACsec on by default | Hosted connection |
| AWS Interconnect – multicloud | AWS Interconnect - multicloud | – | Managed private L3 link between AWS and another cloud | Site-to-Site VPN to another cloud |
| Closed network | 閉域網 / 閉域接続 | – | Japanese industry term for a private carrier network that does not touch the internet; on AWS it usually means DX plus no internet egress | Encrypted network |
| BGP / ASN | BGP / 自律システム番号 (ASN) | ✓ | Dynamic routing protocol and the number that identifies each side; DXGW and TGW ASNs must differ | Static routing |

## AWS-side hubs and gateways

| English | 日本語 | JA | Definition | Often confused with |
| --- | --- | --- | --- | --- |
| Virtual private gateway (VGW) | 仮想プライベートゲートウェイ | ✓ | VPN/DX termination for exactly one VPC | Transit Gateway |
| Direct Connect gateway (DXGW) | Direct Connect ゲートウェイ | ✓ | Global, route-only object linking VIFs to VGWs, TGWs or Cloud WAN; does not forward between its associations | Transit Gateway |
| Allowed prefixes | 許可されたプレフィックス (表記未確認) | – | List on a DXGW association that defines what is advertised to on-premises | VPC CIDR |
| Transit Gateway (TGW) | Transit Gateway (トランジットゲートウェイ) | ✓ | Regional L3 hub for VPCs, VPN, DX, Connect and peering attachments | Direct Connect gateway |
| Attachment | アタッチメント | ✓ | One connection of a VPC, VPN, DXGW, Connect or peer to a TGW or Cloud WAN | Association |
| TGW route table | Transit Gateway ルートテーブル | ✓ | Routing domain inside a TGW | VPC route table |
| Association | 関連付け | ✓ | The one TGW route table (or, since 2026-07, policy table) an attachment uses for lookups | Propagation |
| Propagation | ルート伝播 (ルート伝達 also appears) | ✓ | Attachment installs its routes into one or more TGW route tables | Association |
| Connect attachment | Transit Gateway Connect アタッチメント | ✓ | GRE + BGP attachment for SD-WAN appliances over a VPC or DX transport | VPN attachment |
| Peering attachment | ピアリングアタッチメント | ✓ | TGW-to-TGW link, typically between Regions | VPC peering |
| Appliance mode | アプライアンスモード | ✓ | Keeps both directions of a flow in one AZ for stateful inspection VPCs | — |
| ECMP | 等コストマルチパス (ECMP) ルーティング | ✓ | Spreads traffic over equal routes; TGW yes, VGW no | LAG |
| Policy-based routing | ポリシーベースルーティング (表記未確認) | – | TGW policy-table rules that pick a route table by source or destination CIDR, port or protocol; traffic matching no rule is dropped (2026-07) | Route table association |
| AWS Cloud WAN | AWS Cloud WAN | – | Managed global WAN defined by a core network policy | Transit Gateway |
| Core network | コアネットワーク | – | The AWS-managed part of a Cloud WAN global network | Global network |
| Core network edge | コアネットワークエッジ | – | Per-Region Cloud WAN router managed by AWS | Transit Gateway |
| Segment | セグメント | – | Isolated routing domain in Cloud WAN | TGW route table |
| Service insertion | サービス挿入 | – | Cloud WAN policy that steers traffic through firewalls (network function groups) | Appliance mode |
| VPN CloudHub | VPN CloudHub | – | Hub-and-spoke between several VPN sites through one VGW | Transit Gateway |

## Inside the VPC and DNS

| English | 日本語 | JA | Definition | Often confused with |
| --- | --- | --- | --- | --- |
| Route table | ルートテーブル | ✓ | Per-subnet routing rules; longest prefix wins, then static over propagated | TGW route table |
| Internet gateway | インターネットゲートウェイ | ✓ | VPC attachment for public internet traffic | NAT gateway |
| Private NAT gateway | プライベート NAT ゲートウェイ | – | NAT to private addresses, used for overlapping CIDRs | NAT gateway |
| VPC peering connection | VPC ピアリング接続 | ✓ | One-to-one VPC link; not transitive, no edge-to-edge routing | Transit Gateway |
| VPC Block Public Access | VPC Block Public Access (表記未確認) | – | Account or Region control that overrides routes and blocks IGW traffic | Network ACL |
| VPC Encryption Controls | VPC 暗号化コントロール (表記未確認) | – | Monitor or enforce encryption in transit for VPC traffic (2025-11) | MACsec |
| Gateway endpoint | ゲートウェイエンドポイント | ✓ | Route-table target for S3 or DynamoDB; not usable from on-premises | Interface endpoint |
| Interface endpoint | インターフェイスエンドポイント | ✓ | ENI with a private IP for an AWS or partner service; reachable from on-premises | Gateway endpoint |
| Endpoint service | エンドポイントサービス | ✓ | Your NLB/GWLB-backed service exposed through PrivateLink | Interface endpoint |
| Resource gateway / resource configuration | リソースゲートウェイ / リソース設定 | ✓ | PrivateLink + Lattice constructs to share a database, domain or IP, including on-premises (2024-12) | Endpoint service |
| Resource endpoint / service network endpoint | リソースエンドポイント / サービスネットワークエンドポイント | ✓ | Consumer-side endpoints for one resource or a whole Lattice service network | Interface endpoint |
| Amazon VPC Lattice | Amazon VPC Lattice | – | Application-layer service networking across VPCs and accounts | Transit Gateway |
| Route 53 VPC Resolver | Route 53 VPC Resolver / VPC リゾルバー | ✓ | Built-in VPC DNS at VPC+2; renamed from "Route 53 Resolver" in 2025-11 | Global Resolver |
| Inbound endpoint | インバウンドエンドポイント (VPC Resolver) | ✓ | IPs in your VPC that on-premises DNS can forward to | Outbound endpoint |
| Outbound endpoint | アウトバウンドエンドポイント (VPC Resolver) | ✓ | Resolver's way out to on-premises DNS, driven by Resolver rules | Inbound endpoint |
| Resolver rule | Resolver ルール / 転送ルール | ✓ | Per-domain forwarding instruction for outbound endpoints | Private hosted zone |
| Private hosted zone | プライベートホストゾーン | ✓ | Route 53 zone visible only to associated VPCs | Public hosted zone |
| Route 53 Profiles | Route 53 Profiles (表記未確認) | – | Shareable bundle of PHZs, Resolver rules, DNS Firewall rule groups and interface endpoint DNS for many VPCs (2024-04) | Resolver rule sharing |
| Route 53 Global Resolver | Route 53 Global Resolver | – | Anycast resolver for authorized clients anywhere (GA 2026-03) | VPC Resolver |

## People and data paths

| English | 日本語 | JA | Definition | Often confused with |
| --- | --- | --- | --- | --- |
| AWS Client VPN | AWS Client VPN / クライアント VPN | ✓ | Managed OpenVPN-based remote access for users | Site-to-Site VPN |
| Client VPN endpoint | Client VPN エンドポイント | ✓ | The server-side resource users connect to | VPC endpoint |
| Target network | ターゲットネットワーク | ✓ | Subnet (or, since 2026-04, TGW) a Client VPN endpoint is associated with | Client CIDR |
| Authorization rule | 承認ルール (認可ルール also appears) | ✓ | Which networks a user group may reach through Client VPN | Security group |
| Split tunnel | スプリットトンネルモード | ✓ | Only the routes in the endpoint's route table go through the VPN (they can include on-premises); everything else uses the local internet | Full tunnel |
| AWS Verified Access | AWS Verified Access | ✓ | Per-application zero-trust access with identity and device policies | Client VPN |
| Trust provider | 信頼プロバイダー | ✓ | Identity or device-posture source for Verified Access | Identity provider |
| Verified Access endpoint / group | Verified Access エンドポイント / グループ | ✓ | An application, and a set of applications sharing a policy | Client VPN endpoint |
| Session Manager | Session Manager | – | IAM-authorized shell and port forwarding with no inbound ports | Bastion host |
| AWS Outposts | AWS Outposts | – | AWS-managed racks on-premises, tied to a parent Region by a service link | Local Zones |

## Sources

- <https://docs.aws.amazon.com/ja_jp/vpn/latest/s2svpn/how_it_works.html>
- <https://docs.aws.amazon.com/ja_jp/vpn/latest/s2svpn/private-ip-dx.html>
- <https://docs.aws.amazon.com/ja_jp/directconnect/latest/UserGuide/Welcome.html>
- <https://docs.aws.amazon.com/ja_jp/directconnect/latest/UserGuide/lags.html>
- <https://docs.aws.amazon.com/ja_jp/directconnect/latest/UserGuide/direct-connect-gateways-intro.html>
- <https://docs.aws.amazon.com/ja_jp/vpc/latest/tgw/how-transit-gateways-work.html>
- <https://docs.aws.amazon.com/ja_jp/vpc/latest/privatelink/concepts.html>
- <https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/resolver.html>
- <https://docs.aws.amazon.com/ja_jp/vpn/latest/clientvpn-admin/how-it-works.html>
- <https://docs.aws.amazon.com/ja_jp/verified-access/latest/ug/how-it-works.html>
- <https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/how-it-works.html>
- <https://docs.aws.amazon.com/network-manager/latest/cloudwan/what-is-cloudwan.html>
- <https://docs.aws.amazon.com/whitepapers/latest/hybrid-connectivity/hybrid-connectivity.html>
- <https://docs.aws.amazon.com/directconnect/latest/UserGuide/WorkingWithVirtualInterfaces.html>
- <https://docs.aws.amazon.com/directconnect/latest/UserGuide/resiliency_toolkit.html>
- <https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-limits.html>
- <https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-route-53-global-resolver-secure-anycast-dns-resolution-preview/>
- <https://aws.amazon.com/blogs/networking-and-content-delivery/selecting-the-right-aws-private-connectivity-options-a-decision-framework/>
