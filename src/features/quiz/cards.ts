import type { L } from "@/i18n/lang";

export interface QuizCard {
  claim: L;
  fact: boolean;
  why: L;
  /** Section that explains it. */
  to: string;
  /** Where the same myth is untangled in more depth elsewhere. */
  deeper?: string;
}

const CC_MYTHS = "https://0-draft.github.io/cross-connect/#myths";

/** Each card is a confusion point from the research, with its documented answer. */
export const CARDS: QuizCard[] = [
  {
    claim: {
      en: '"Direct Connect encrypts our traffic."',
      ja: "「Direct Connect なら通信は暗号化される」",
    },
    fact: false,
    why: {
      en: "AWS docs: Direct Connect does not encrypt traffic in transit by default. Add MACsec (one hop) or an IPsec VPN over DX (gateway to gateway).",
      ja: "AWS ドキュメントの通り、Direct Connect はデフォルトでは暗号化しません。MACsec (1 区間) か DX 上の IPsec VPN (ゲートウェイ間) を追加します。",
    },
    to: "dx",
    deeper: CC_MYTHS,
  },
  {
    claim: {
      en: '"Our S3 gateway endpoint lets the data center reach S3 over DX."',
      ja: "「S3 のゲートウェイエンドポイントがあれば、DC から DX 経由で S3 に届く」",
    },
    fact: false,
    why: {
      en: "Gateway endpoints are reachable only from inside the VPC, not from on-prem, peering or a TGW. On-prem needs an interface endpoint.",
      ja: "ゲートウェイエンドポイントは VPC 内からしか使えず、オンプレ・ピアリング・TGW からは届きません。オンプレからはインターフェイスエンドポイントが必要。",
    },
    to: "private",
  },
  {
    claim: {
      en: '"Interface endpoints can be reached from on-prem over DX or VPN."',
      ja: "「インターフェイスエンドポイントにはオンプレから DX / VPN で届く」",
    },
    fact: true,
    why: {
      en: "An interface endpoint is an ENI with a private IP in your subnet, so anything routed into the VPC can reach it, as long as DNS points there.",
      ja: "インターフェイスエンドポイントはサブネット内のプライベート IP を持つ ENI なので、VPC へルーティングされていれば届きます。DNS がそこを指していることが条件。",
    },
    to: "private",
  },
  {
    claim: {
      en: '"Two VPCs on one DX gateway can talk to each other through it."',
      ja: "「同じ DX ゲートウェイにつないだ VPC 同士は、そこを通って通信できる」",
    },
    fact: false,
    why: {
      en: "A DX gateway only hands out routes between your VIFs and its associated gateways. Direct communication between the VPCs associated with it is not supported.",
      ja: "DX ゲートウェイは VIF と関連付けたゲートウェイの間で経路を配るだけ。関連付けた VPC 同士の直接通信はサポートされません。",
    },
    to: "hubs",
    deeper: CC_MYTHS,
  },
  {
    claim: {
      en: '"On a Transit Gateway, a static VPN route beats DX for the same prefix."',
      ja: "「Transit Gateway では、同じプレフィックスなら静的 VPN の経路が DX に勝つ」",
    },
    fact: true,
    why: {
      en: "A VPN static route is a static route in the TGW route table, and static outranks every propagated route, DX included. Use a BGP VPN as the DX backup.",
      ja: "VPN の静的ルートは TGW ルートテーブルでは「静的ルート」扱いで、DX を含むすべての伝播ルートに勝ちます。DX のバックアップには BGP VPN を。",
    },
    to: "routing",
  },
  {
    claim: {
      en: '"On a Transit Gateway we must prepend the backup VPN, or it will beat DX."',
      ja: "「Transit Gateway ではバックアップ VPN をプリペンドしないと DX に勝ってしまう」",
    },
    fact: false,
    why: {
      en: "TGW compares route type before AS_PATH, so DX already wins over a BGP VPN for the same prefix. Prepending matters on Cloud WAN, which compares AS_PATH first.",
      ja: "TGW は AS_PATH より先に経路の種類を比べるので、同じプレフィックスなら DX が BGP VPN に勝ちます。プリペンドが効くのは AS_PATH を先に比べる Cloud WAN。",
    },
    to: "routing",
  },
  {
    claim: {
      en: '"A more specific route learned from on-prem overrides the VPC\'s local route."',
      ja: "「オンプレから学んだより細かい経路は、VPC の local ルートより優先される」",
    },
    fact: false,
    why: {
      en: "The local route always wins against propagated routes, even more specific ones. Only static routes to middleboxes may be more specific than local.",
      ja: "local ルートは、たとえより細かくても伝播ルートには必ず勝ちます。local より細かくできるのはミドルボックス宛ての静的ルートだけ。",
    },
    to: "routing",
  },
  {
    claim: {
      en: '"One Site-to-Site VPN tunnel can fill our 10 Gbps internet line."',
      ja: "「Site-to-Site VPN 1 トンネルで 10 Gbps 回線を使い切れる」",
    },
    fact: false,
    why: {
      en: "A standard tunnel tops out at 1.25 Gbps and a large tunnel at 5 Gbps. Going faster takes ECMP across tunnels on a TGW or Cloud WAN, and one flow still uses one tunnel.",
      ja: "標準トンネルは 1.25 Gbps、広帯域幅トンネルでも 5 Gbps が上限。それ以上は TGW / Cloud WAN でトンネル間の ECMP が必要で、それでも 1 フローは 1 トンネル。",
    },
    to: "vpn",
  },
  {
    claim: {
      en: '"A virtual private gateway load-balances across our two VPN connections."',
      ja: "「仮想プライベートゲートウェイは 2 本の VPN 接続に負荷分散してくれる」",
    },
    fact: false,
    why: {
      en: "A VGW picks one tunnel across all its VPN connections for egress. There is no ECMP on a VGW.",
      ja: "VGW は全 VPN 接続の中から送信用に 1 トンネルだけを選びます。VGW に ECMP はありません。",
    },
    to: "vpn",
  },
  {
    claim: {
      en: '"Site-to-Site VPN carries jumbo frames if DX does."',
      ja: "「DX がジャンボフレームなら Site-to-Site VPN も通せる」",
    },
    fact: false,
    why: {
      en: "VPN tops out at an MTU of 1,446 (MSS 1,406), with no jumbo frames and no path MTU discovery. Big packets can vanish after a failover from DX to VPN.",
      ja: "VPN の MTU は最大 1,446 (MSS 1,406)。ジャンボフレームもパス MTU 検出 (PMTUD) もありません。DX から VPN へ切り替わった途端に大きなパケットが消えることも。",
    },
    to: "mtu",
  },
  {
    claim: {
      en: '"Session Manager needs port 22 open on the instance."',
      ja: "「Session Manager にはインスタンスの 22 番ポート開放が必要」",
    },
    fact: false,
    why: {
      en: "No inbound port at all. The SSM Agent connects outward over HTTPS 443 to ssm and ssmmessages, through a NAT path or interface endpoints.",
      ja: "受信ポートは一切不要。SSM Agent が NAT 経路かインターフェイスエンドポイント経由で、ssm と ssmmessages へ HTTPS 443 で外向きに接続します。",
    },
    to: "people",
  },
  {
    claim: {
      en: '"On-prem DNS can just forward to the VPC\'s .2 resolver."',
      ja: "「社内 DNS から VPC の .2 リゾルバーへそのまま転送すればいい」",
    },
    fact: false,
    why: {
      en: "The VPC base+2 resolver is not reachable from on-prem over VPN or DX, and forwarding to it is unsupported. That's what Route 53 VPC Resolver inbound endpoints are for.",
      ja: "VPC の「ベース + 2」リゾルバーにはオンプレから VPN / DX で届かず、そこへの転送はサポート外。そのために Route 53 VPC Resolver のインバウンドエンドポイントがあります。",
    },
    to: "dns",
  },
  {
    claim: {
      en: '"New AWS accounts can still order a Snowball Edge."',
      ja: "「新しい AWS アカウントでも Snowball Edge を注文できる」",
    },
    fact: false,
    why: {
      en: "Since 2025-11-07 Snowball Edge is not offered to new customers. AWS points them to DataSync, Data Transfer Terminal or partners.",
      ja: "2025-11-07 以降、Snowball Edge は新規顧客に提供されていません。AWS は DataSync・Data Transfer Terminal・パートナーを案内しています。",
    },
    to: "edge",
  },
];
