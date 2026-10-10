import type { L } from "@/i18n/lang";
import type { Product, Question } from "./chooser";

/** The People route colour: used only for things on that route. */
export const C = "var(--r-people)";

export interface Row {
  id: Product;
  name: string;
  who: L;
  wire: L;
  reach: L;
  inbound: L;
  cost: L;
}

/** docs/07-user-access.md, "At a glance", with Tokyo prices. */
export const ROWS: Row[] = [
  {
    id: "clientvpn",
    name: "AWS Client VPN",
    who: {
      en: "Anyone with the AWS VPN Client or an OpenVPN client",
      ja: "AWS VPN Client か OpenVPN クライアントを持つ人",
    },
    wire: {
      en: "OpenVPN (TLS), UDP or TCP, port 443 or 1194",
      ja: "OpenVPN (TLS)、UDP か TCP、443 か 1194 番",
    },
    reach: {
      en: "Whole networks you authorize, on-prem included",
      ja: "許可したネットワーク全体 (オンプレも)",
    },
    inbound: {
      en: "Targets allow the endpoint ENIs",
      ja: "宛先はエンドポイント ENI を許可",
    },
    cost: {
      en: "$0.15 per subnet association-hour + $0.05 per connection-hour",
      ja: "サブネット関連付け 1 時間 $0.15 + 接続 1 時間 $0.05",
    },
  },
  {
    id: "ava",
    name: "AWS Verified Access",
    who: {
      en: "Users signed in through your IdP, optionally with device posture",
      ja: "IdP で認証した利用者 (端末の状態 (ポスチャ) も確認可)",
    },
    wire: {
      en: "HTTPS; TCP/SSH/RDP via the Connectivity Client",
      ja: "HTTPS。TCP/SSH/RDP は Connectivity Client 経由",
    },
    reach: { en: "One application per endpoint", ja: "エンドポイントごとに 1 アプリ" },
    inbound: { en: "App never exposed publicly", ja: "アプリは公開しない" },
    cost: {
      en: "$0.35 per HTTP app-hour (+$0.02/GB); $0.26 per TCP endpoint-hour + $0.001 per connection beyond 100 per endpoint-hour",
      ja: "HTTP アプリ 1 時間 $0.35 (+$0.02/GB)。TCP エンドポイント 1 時間 $0.26 + エンドポイント 1 時間あたり 100 接続を超えた分 1 接続 $0.001",
    },
  },
  {
    id: "ssm",
    name: "Session Manager",
    who: {
      en: "IAM principals (console or CLI + plugin)",
      ja: "IAM プリンシパル (コンソール / CLI + プラグイン)",
    },
    wire: {
      en: "HTTPS/WebSocket to ssmmessages; the agent dials out",
      ja: "ssmmessages への HTTPS/WebSocket。エージェントが外へ接続",
    },
    reach: {
      en: "A shell, or port forwarding through a node",
      ja: "シェル、またはノード経由のポートフォワード",
    },
    inbound: { en: "None", ja: "不要" },
    cost: {
      en: "Free on EC2; $0.05 per session on hybrid nodes (from 2026-09-30)",
      ja: "EC2 は無料。ハイブリッドノードは 1 セッション $0.05 (2026-09-30〜)",
    },
  },
  {
    id: "eice",
    name: "EC2 Instance Connect Endpoint",
    who: {
      en: "IAM principals with SSH or RDP clients",
      ja: "SSH / RDP クライアントを使う IAM プリンシパル",
    },
    wire: {
      en: "WebSocket tunnel to the endpoint, then TCP in the VPC",
      ja: "エンドポイントへの WebSocket トンネル、VPC 内は TCP",
    },
    reach: {
      en: "Instances' private IPs (SSH, RDP)",
      ja: "インスタンスのプライベート IP (SSH・RDP)",
    },
    inbound: { en: "Target allows the endpoint", ja: "宛先はエンドポイントを許可" },
    cost: {
      en: "No extra charge (cross-AZ data transfer applies)",
      ja: "追加料金なし (AZ 間転送料は発生)",
    },
  },
  {
    id: "workspaces",
    name: "WorkSpaces family",
    who: {
      en: "Anyone with a client or a browser",
      ja: "クライアントかブラウザがあれば誰でも",
    },
    wire: {
      en: "Streaming protocol or HTTPS; only pixels leave AWS",
      ja: "ストリーミングプロトコルか HTTPS。AWS から出るのは画面だけ",
    },
    reach: {
      en: "Whatever the desktop in AWS can reach",
      ja: "AWS 内のデスクトップから届く範囲",
    },
    inbound: { en: "None to your workloads", ja: "ワークロード側は不要" },
    cost: { en: "Per user per month, or per hour", ja: "ユーザー月額、または時間課金" },
  },
  {
    id: "bastion",
    name: "Bastion host",
    who: {
      en: "Anyone with SSH/RDP keys and network reach",
      ja: "SSH/RDP の鍵とネットワーク到達性がある人",
    },
    wire: { en: "SSH (22) or RDP (3389)", ja: "SSH (22) か RDP (3389)" },
    reach: { en: "Whatever the bastion can reach", ja: "踏み台から届く範囲" },
    inbound: {
      en: "Yes: SSH/RDP open on the bastion",
      ja: "必要: 踏み台に SSH/RDP を開放",
    },
    cost: {
      en: "EC2 hours + public IPv4 ($0.005/h)",
      ja: "EC2 時間 + パブリック IPv4 ($0.005/時)",
    },
  },
];

export const QUESTION: Record<Question, L> = {
  manyNetworks: {
    en: "Does the person need network-level access to many address ranges, including on-prem?",
    ja: "その人は、オンプレを含む多数のアドレス範囲にネットワークレベルで入る必要がある?",
  },
  adminToServer: {
    en: "Is it an admin reaching a server?",
    ja: "管理者がサーバーに入る用途?",
  },
  dataMayLeave: {
    en: "May corporate data leave AWS and land on the device?",
    ja: "社内データが AWS の外 (端末) に出てもよい?",
  },
};

/** What a Session Manager session actually does, one step at a time. */
export const SSM_STEPS: L[] = [
  {
    en: "The SSM Agent on the instance dials out over HTTPS 443 to ssm and ssmmessages. The instance has no inbound rule at all; it needs either an internet path (public IP or NAT) or interface endpoints.",
    ja: "インスタンスの SSM Agent が ssm と ssmmessages へ HTTPS 443 で外向きに接続。インスタンスに受信ルールは一切不要。インターネットへの経路 (パブリック IP か NAT) かインターフェイスエンドポイントが必要です。",
  },
  {
    en: "You sign in through IAM Identity Center (federated from your corporate IdP) and get temporary credentials.",
    ja: "社内 IdP とフェデレーションした IAM Identity Center でサインインし、一時的な認証情報を得ます。",
  },
  {
    en: "Your CLI calls ssm:StartSession. IAM policy decides whether you may open a session on this node.",
    ja: "CLI が ssm:StartSession を呼びます。このノードにセッションを開けるかは IAM ポリシーが決めます。",
  },
  {
    en: "Your laptop also dials out: a WebSocket to ssmmessages. Both sides are now connected outward to the same AWS service.",
    ja: "PC も外向きに ssmmessages へ WebSocket を張ります。これで両側が同じ AWS サービスへ外向きにつながった状態。",
  },
  {
    en: "ssmmessages joins the two outbound connections. Shell bytes flow over TLS (1.3 by default), optionally with your own KMS key.",
    ja: "ssmmessages が 2 本の外向き接続をつなぎます。シェルのデータは TLS (デフォルト 1.3) で流れ、KMS キーで追加暗号化も可能。",
  },
  {
    en: "CloudTrail records the API calls; full session logs can go to S3 or CloudWatch Logs. Idle sessions end after 20 minutes by default.",
    ja: "API 呼び出しは CloudTrail に記録。セッションの全ログは S3 や CloudWatch Logs へ。アイドルはデフォルト 20 分で切断。",
  },
];
