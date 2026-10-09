import type { L } from "@/i18n/lang";
import type { RouteId } from "@/data/routes";

/**
 * The decision tree from docs/13-design-patterns.md ("Codeable rules"), as a
 * pure function. Earlier rules win where they compete.
 */

export interface Answers {
  who: "sites" | "people" | "both";
  /** For people. */
  need: "full" | "apps" | "nodata" | "admins";
  sdwan: boolean;
  /** Sustained bandwidth per site. */
  bw: "low" | "mid" | "high";
  /** What the transport may be. */
  transport: "internet" | "steady" | "closed";
  manySmallSites: boolean;
  farFromRegion: boolean;
  vpcs: "one" | "many";
  regions: "one" | "several";
  encrypt: boolean;
  critical: boolean;
  overlap: boolean;
}

export const DEFAULTS: Answers = {
  who: "sites",
  need: "full",
  sdwan: false,
  bw: "low",
  transport: "internet",
  manySmallSites: false,
  farFromRegion: false,
  vpcs: "one",
  regions: "one",
  encrypt: false,
  critical: true,
  overlap: false,
};

export type RecId =
  | "clientVpn"
  | "verifiedAccess"
  | "workspaces"
  | "ssm"
  | "sdwan"
  | "concentrator"
  | "vpnVgw"
  | "vpnTgw"
  | "largeTunnel"
  | "accelerated"
  | "dxSingleRegion"
  | "dxMultiRegion"
  | "macsec"
  | "privateIpVpn"
  | "closed"
  | "overlap"
  | "resilMax"
  | "resilHigh";

export interface Rec {
  id: RecId;
  pattern?: "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7";
  routes: RouteId[];
}

export type AntiId =
  | "singleDx"
  | "sameLocation"
  | "dxEncrypted"
  | "dxgwHub"
  | "moreSpecificBackup"
  | "s3Gateway"
  | "publicDns"
  | "vgwPerVpc"
  | "staticVpnFirewall"
  | "mixedMtu"
  | "overlapLater";

export interface Plan {
  recs: Rec[];
  avoid: AntiId[];
}

export function advise(a: Answers): Plan {
  const recs: Rec[] = [];
  const avoid = new Set<AntiId>();

  if (a.who !== "sites") {
    // Rules 1-4: people.
    const people: Record<Answers["need"], Rec> = {
      full: { id: "clientVpn", pattern: "P6", routes: ["people"] },
      apps: { id: "verifiedAccess", pattern: "P6", routes: ["people"] },
      nodata: { id: "workspaces", pattern: "P6", routes: ["people"] },
      admins: { id: "ssm", pattern: "P6", routes: ["people", "private"] },
    };
    recs.push(people[a.need]);
  }

  let usesDx = false;
  if (a.who !== "people") {
    if (a.sdwan) {
      // Rule 5.
      recs.push({ id: "sdwan", pattern: "P4", routes: ["sdwan"] });
    } else if (a.transport === "internet" && a.bw !== "high") {
      if (a.manySmallSites) {
        // Rule 6: 25+ sites under 100 Mbps each, on a Transit Gateway.
        recs.push({ id: "concentrator", routes: ["vpn"] });
      } else if (a.bw === "mid") {
        // Rule 9.
        recs.push({ id: "largeTunnel", routes: ["vpn"] });
      } else if (a.vpcs === "one") {
        // Rule 7.
        recs.push({ id: "vpnVgw", pattern: "P1", routes: ["vpn"] });
        avoid.add("staticVpnFirewall");
      } else {
        // Rule 8.
        recs.push({ id: "vpnTgw", routes: ["vpn"] });
        avoid.add("staticVpnFirewall");
      }
      // Rule 10: accelerated VPN cannot be combined with large tunnels.
      if (a.farFromRegion && a.bw === "low")
        recs.push({ id: "accelerated", routes: ["vpn"] });
    } else {
      // Rule 11: steady latency, more than 5 Gbps, or no internet at all.
      usesDx = true;
    }
  }

  if (usesDx) {
    // Rules 12-13.
    recs.push(
      a.regions === "one"
        ? { id: "dxSingleRegion", pattern: "P2", routes: ["dx", "vpn"] }
        : { id: "dxMultiRegion", pattern: "P3", routes: ["dx"] },
    );
    // Rule 14.
    if (a.encrypt) {
      recs.push(
        a.bw === "high"
          ? { id: "macsec", routes: ["dx"] }
          : { id: "privateIpVpn", routes: ["dx", "vpn"] },
      );
      avoid.add("dxEncrypted");
    }
    // Rule 17.
    recs.push({ id: a.critical ? "resilMax" : "resilHigh", routes: ["dx"] });
    avoid.add("singleDx");
    if (a.critical) avoid.add("sameLocation");
    avoid.add("moreSpecificBackup");
    avoid.add("mixedMtu");
    if (a.vpcs === "many") avoid.add("vgwPerVpc");
    if (a.regions === "several") avoid.add("dxgwHub");
  }

  // Rule 15.
  if (a.transport === "closed") {
    recs.push({ id: "closed", pattern: "P5", routes: ["private", "dns"] });
    avoid.add("s3Gateway");
    avoid.add("publicDns");
  }

  // Rule 16.
  if (a.overlap) {
    recs.push({ id: "overlap", pattern: "P7", routes: ["private"] });
    avoid.add("overlapLater");
  }

  return { recs, avoid: [...avoid] };
}

export const REC: Record<RecId, { title: L; why: L }> = {
  clientVpn: {
    title: { en: "AWS Client VPN", ja: "AWS Client VPN" },
    why: {
      en: "Full network reach for laptops, legacy protocols included. Attach it natively to a Transit Gateway (since 2026-04) when more than one VPC is behind it. Verified Access is the alternative for HTTP(S) and TCP apps.",
      ja: "PC からネットワーク全体へ (レガシーなプロトコルも)。VPC が複数なら Transit Gateway にネイティブ接続 (2026-04〜)。HTTP(S)・TCP アプリだけなら Verified Access も選択肢。",
    },
  },
  verifiedAccess: {
    title: { en: "AWS Verified Access", ja: "AWS Verified Access" },
    why: {
      en: "Zero trust per application: each request is checked against identity and device posture. HTTP(S) and, since 2025-02, TCP, SSH and RDP. Not a general network.",
      ja: "アプリ単位のゼロトラスト。リクエストごとに ID とデバイスの状態で判定。HTTP(S) と、2025-02 からは TCP・SSH・RDP も。ネットワーク全体ではない。",
    },
  },
  workspaces: {
    title: {
      en: "Amazon WorkSpaces or AppStream 2.0",
      ja: "Amazon WorkSpaces / AppStream 2.0",
    },
    why: {
      en: "Only pixels leave AWS, so data never reaches the laptop.",
      ja: "AWS から出るのは画面だけなので、データが PC に届かない。",
    },
  },
  ssm: {
    title: {
      en: "AWS Systems Manager Session Manager",
      ja: "AWS Systems Manager Session Manager",
    },
    why: {
      en: "Operators reach instances with no inbound ports, authorized by IAM and logged. In a closed network it needs SSM interface endpoints.",
      ja: "インバウンドポートなしでインスタンスへ。IAM で認可しログも残る。閉域なら SSM のインターフェイスエンドポイントが必要。",
    },
  },
  sdwan: {
    title: {
      en: "SD-WAN into Transit Gateway Connect or Cloud WAN Connect",
      ja: "SD-WAN を Transit Gateway Connect / Cloud WAN Connect へ",
    },
    why: {
      en: "GRE + BGP, 5 Gbps per Connect peer, up to four peers. Transport is a VPC or a DX attachment. Cloud WAN tunnel-less Connect drops GRE for appliances in a VPC. GRE is not encryption: rely on the SD-WAN fabric.",
      ja: "GRE + BGP、Connect ピアあたり 5 Gbps、最大 4 ピア。トランスポートは VPC か DX アタッチメント。VPC 内アプライアンスなら Cloud WAN のトンネルレス Connect で GRE 不要。GRE は暗号化ではないので SD-WAN 側で暗号化。",
    },
  },
  concentrator: {
    title: {
      en: "Site-to-Site VPN Concentrator on a Transit Gateway",
      ja: "Transit Gateway の Site-to-Site VPN Concentrator",
    },
    why: {
      en: "Built for many small sites: up to 100 sites per concentrator at 100 Mbps each, 5 Gbps shared. Transit Gateway only.",
      ja: "小規模拠点が多数の場合向け。1 コンセントレーターで最大 100 拠点、拠点あたり 100 Mbps、合計 5 Gbps。Transit Gateway 専用。",
    },
  },
  vpnVgw: {
    title: {
      en: "Site-to-Site VPN to a virtual private gateway",
      ja: "仮想プライベートゲートウェイへの Site-to-Site VPN",
    },
    why: {
      en: "Two tunnels in different AZs with BGP. 1.25 Gbps per tunnel and no ECMP on a VGW. Move to a Transit Gateway when the second VPC arrives.",
      ja: "AZ の異なる 2 トンネルを BGP で。トンネルあたり 1.25 Gbps、VGW では ECMP なし。2 つ目の VPC ができたら Transit Gateway へ。",
    },
  },
  vpnTgw: {
    title: {
      en: "Site-to-Site VPN to a Transit Gateway",
      ja: "Transit Gateway への Site-to-Site VPN",
    },
    why: {
      en: "One VPN reaches every attached VPC. Turn on VPN ECMP with BGP to add tunnels for more bandwidth.",
      ja: "1 本の VPN で接続中の全 VPC へ。BGP で VPN ECMP を有効にすればトンネルを足して帯域を増やせる。",
    },
  },
  largeTunnel: {
    title: { en: "Large bandwidth tunnels (5 Gbps)", ja: "大容量トンネル (5 Gbps)" },
    why: {
      en: "5 Gbps per tunnel on a Transit Gateway or Cloud WAN. Not on a VGW, and not combinable with accelerated VPN.",
      ja: "Transit Gateway か Cloud WAN でトンネルあたり 5 Gbps。VGW では使えず、高速化 VPN とも併用不可。",
    },
  },
  accelerated: {
    title: { en: "Accelerated Site-to-Site VPN", ja: "高速化 Site-to-Site VPN" },
    why: {
      en: "Enters the AWS backbone at the edge nearest the site via Global Accelerator. Transit Gateway only; choose it at creation.",
      ja: "Global Accelerator で拠点に一番近いエッジから AWS のバックボーンへ。Transit Gateway 専用、作成時にしか選べない。",
    },
  },
  dxSingleRegion: {
    title: {
      en: "Direct Connect + DX gateway + Transit Gateway, VPN as backup",
      ja: "Direct Connect + DX ゲートウェイ + Transit Gateway、VPN をバックアップに",
    },
    why: {
      en: "Transit VIFs from two DX locations to one DX gateway, associated with a Transit Gateway, plus a BGP VPN on the same Transit Gateway. Advertise the same prefixes on both. Hosted connections below 1 Gbps, dedicated from 1 Gbps.",
      ja: "2 つの DX ロケーションからトランジット VIF を 1 つの DX ゲートウェイへ、それを Transit Gateway に関連付け、同じ Transit Gateway に BGP VPN を。両方で同じプレフィックスを広告。1 Gbps 未満はホスト型、1 Gbps からは専有型。",
    },
  },
  dxMultiRegion: {
    title: {
      en: "DX gateway + Cloud WAN, or DX gateway + a Transit Gateway per Region",
      ja: "DX ゲートウェイ + Cloud WAN、またはリージョンごとの Transit Gateway",
    },
    why: {
      en: "A DX gateway is global, but it does not pass traffic between Regions: use Transit Gateway peering or Cloud WAN (native DX gateway attachment since 2024-11) for east-west.",
      ja: "DX ゲートウェイはグローバルだが、リージョン間の通信は中継しない。東西の通信は Transit Gateway ピアリングか Cloud WAN (2024-11 から DX ゲートウェイを直接アタッチ可能) で。",
    },
  },
  macsec: {
    title: {
      en: "MACsec on dedicated 10/100/400 Gbps",
      ja: "専有型 10/100/400 Gbps で MACsec",
    },
    why: {
      en: "Line-rate layer-2 encryption between your router and the AWS device, at selected DX locations only. Direct Connect is not encrypted by default.",
      ja: "自社ルーターと AWS 機器の間をラインレートで L2 暗号化。対応 DX ロケーションのみ。Direct Connect はデフォルトでは暗号化されない。",
    },
  },
  privateIpVpn: {
    title: {
      en: "Private IP VPN over a transit VIF",
      ja: "トランジット VIF 上のプライベート IP VPN",
    },
    why: {
      en: "IPsec with private outside addresses over Direct Connect, landing on a Transit Gateway. Works at any speed, 1.25 Gbps per tunnel with ECMP.",
      ja: "Direct Connect 上で、外側もプライベートアドレスの IPsec を Transit Gateway へ。速度を問わず使え、トンネルあたり 1.25 Gbps、ECMP 可。",
    },
  },
  closed: {
    title: {
      en: "Closed network: no internet anywhere",
      ja: "閉域: どこにもインターネットを使わない",
    },
    why: {
      en: "No internet gateway (enforce with VPC Block Public Access), interface endpoints for every AWS API you call (S3 interface, not gateway), and Route 53 Resolver inbound and outbound endpoints for DNS.",
      ja: "インターネットゲートウェイなし (VPC Block Public Access で強制)、呼び出す AWS API すべてにインターフェイスエンドポイント (S3 もゲートウェイ型ではなくインターフェイス型)、DNS には Route 53 Resolver のインバウンド/アウトバウンドエンドポイント。",
    },
  },
  overlap: {
    title: {
      en: "Expose services, not networks",
      ja: "ネットワークでなくサービスを公開",
    },
    why: {
      en: "PrivateLink or VPC Lattice resource configurations first, a private NAT gateway second, re-IP from an IPAM plan in the long run. No hub can route between identical CIDRs.",
      ja: "まず PrivateLink か VPC Lattice のリソース設定、次にプライベート NAT ゲートウェイ、長期的には IPAM 計画で再採番。同一 CIDR 間はどのハブもルーティングできない。",
    },
  },
  resilMax: {
    title: { en: "Maximum resiliency (99.99% SLA)", ja: "最大回復性 (SLA 99.99%)" },
    why: {
      en: "Separate connections on separate devices in at least two DX locations.",
      ja: "少なくとも 2 つの DX ロケーションで、別々のデバイスに別々の接続。",
    },
  },
  resilHigh: {
    title: { en: "High resiliency (99.9% SLA)", ja: "高回復性 (SLA 99.9%)" },
    why: {
      en: "Two connections in more than one DX location. A single connection's SLA is 95%.",
      ja: "複数の DX ロケーションに 2 本の接続。接続 1 本だけの SLA は 95%。",
    },
  },
};

export const ANTI: Record<AntiId, { title: L; fix: L }> = {
  singleDx: {
    title: { en: "One DX connection, no backup", ja: "DX 1 本、バックアップなし" },
    fix: {
      en: "Two DX locations, or DX plus a VPN on the same Transit Gateway.",
      ja: "DX ロケーションを 2 つに、または同じ Transit Gateway に DX + VPN。",
    },
  },
  sameLocation: {
    title: {
      en: "Two DX connections in the same location",
      ja: "同じロケーションに DX 2 本",
    },
    fix: {
      en: "A location failure takes both down. Use the Maximum model.",
      ja: "ロケーション障害で両方落ちる。最大回復性モデルを。",
    },
  },
  dxEncrypted: {
    title: { en: "Treating DX as encrypted", ja: "DX を暗号化済みと考える" },
    fix: {
      en: "It is private, not encrypted. MACsec, Private IP VPN or TLS.",
      ja: "閉域だが暗号化ではない。MACsec、プライベート IP VPN、TLS を。",
    },
  },
  dxgwHub: {
    title: {
      en: "Using a DX gateway as a VPC-to-VPC hub",
      ja: "DX ゲートウェイを VPC 間のハブにする",
    },
    fix: {
      en: "It does not forward between its associations. Use Transit Gateway or Cloud WAN.",
      ja: "関連付け同士は中継しない。Transit Gateway か Cloud WAN を。",
    },
  },
  moreSpecificBackup: {
    title: {
      en: "More specific prefixes over the backup VPN",
      ja: "バックアップ VPN でより細かいプレフィックスを広告",
    },
    fix: {
      en: "Longest prefix wins first, so the backup becomes primary. Advertise identical prefixes.",
      ja: "最長一致が先に効き、バックアップが主経路になる。同じプレフィックスを広告。",
    },
  },
  s3Gateway: {
    title: {
      en: "S3 gateway endpoint for on-prem clients",
      ja: "オンプレから S3 ゲートウェイエンドポイントを使う",
    },
    fix: {
      en: "Gateway endpoints work only inside the VPC. Use the S3 interface endpoint.",
      ja: "ゲートウェイ型は VPC 内専用。S3 のインターフェイスエンドポイントを。",
    },
  },
  publicDns: {
    title: { en: "Private link, public DNS", ja: "経路は閉域、DNS は公開のまま" },
    fix: {
      en: "Clients resolve public IPs and leave through the internet. Forward to a Resolver inbound endpoint.",
      ja: "パブリック IP に解決されインターネットへ出てしまう。Resolver インバウンドエンドポイントへ転送を。",
    },
  },
  vgwPerVpc: {
    title: {
      en: "A VGW and a private VIF per VPC",
      ja: "VPC ごとに VGW とプライベート VIF",
    },
    fix: {
      en: "Does not scale and has no VPC-to-VPC routing. DX gateway + Transit Gateway.",
      ja: "スケールせず VPC 間ルーティングもない。DX ゲートウェイ + Transit Gateway を。",
    },
  },
  staticVpnFirewall: {
    title: { en: "Static VPN on a stateful firewall", ja: "ステートフル FW で静的 VPN" },
    fix: {
      en: "Asymmetric tunnels drop return traffic. Use BGP.",
      ja: "トンネルが非対称になり戻り通信が落ちる。BGP を。",
    },
  },
  mixedMtu: {
    title: {
      en: "8500 on DX, 1446 on VPN, ICMP blocked",
      ja: "DX は 8500、VPN は 1446、ICMP は遮断",
    },
    fix: {
      en: "Large packets black-hole on failover. Clamp MSS on premises.",
      ja: "フェイルオーバー時に大きいパケットが消える。オンプレで MSS クランプを。",
    },
  },
  overlapLater: {
    title: { en: 'Overlapping CIDRs "fixed later"', ja: "CIDR 重複を「後で直す」" },
    fix: {
      en: "Every hub forbids or complicates overlap. Plan with IPAM now.",
      ja: "どのハブも重複を禁止するか複雑にする。今 IPAM で計画を。",
    },
  },
};
