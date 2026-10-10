import type { L } from "@/i18n/lang";

/**
 * Hybrid DNS lookups, hop by hop, from the worked flows in
 * docs/10-hybrid-dns.md. Each scenario is a short sequence of messages
 * between participants, ending in an answer (or in a failure).
 */

export type Party =
  | "host"
  | "corpDns"
  | "inbound"
  | "resolver"
  | "zone"
  | "ec2"
  | "outbound"
  | "base2"
  | "publicDns";

export interface PartyInfo {
  name: L;
  addr?: string;
  side: "onprem" | "aws" | "internet";
}

export const PARTIES: Record<Party, PartyInfo> = {
  host: {
    name: { en: "On-prem host", ja: "オンプレのホスト" },
    addr: "10.10.1.20",
    side: "onprem",
  },
  corpDns: {
    name: { en: "Corp DNS", ja: "社内 DNS" },
    addr: "10.10.0.53",
    side: "onprem",
  },
  inbound: {
    name: { en: "Inbound endpoint", ja: "インバウンド EP" },
    addr: "10.0.1.10",
    side: "aws",
  },
  resolver: {
    name: { en: "VPC Resolver", ja: "VPC Resolver" },
    addr: "10.0.0.2",
    side: "aws",
  },
  zone: { name: { en: "Private zone", ja: "プライベートゾーン" }, side: "aws" },
  ec2: { name: { en: "EC2", ja: "EC2" }, addr: "10.0.3.7", side: "aws" },
  outbound: {
    name: { en: "Outbound endpoint", ja: "アウトバウンド EP" },
    addr: "10.0.1.20",
    side: "aws",
  },
  base2: {
    name: { en: "VPC .2 resolver", ja: "VPC の .2 リゾルバー" },
    addr: "10.0.0.2",
    side: "aws",
  },
  publicDns: { name: { en: "Public DNS", ja: "パブリック DNS" }, side: "internet" },
};

export type Kind = "query" | "answer" | "local" | "fail";

export interface Hop {
  from: Party;
  to: Party;
  kind: Kind;
  /** Short label drawn on the arrow. */
  label: L;
  /** Full caption shown under the diagram for this step. */
  caption: L;
}

export type ScenarioId = "endpoint" | "phz" | "outbound" | "base2" | "noForwarder";

export interface Scenario {
  id: ScenarioId;
  label: L;
  question: string;
  parties: Party[];
  hops: Hop[];
  /** Final answer the asker gets (an address, or words to translate), or
   * null when the lookup fails. */
  answer: L | string | null;
  outcome: L;
  ok: boolean;
}

const fwd = (to: Party, caption: L): Hop => ({
  from: "corpDns",
  to,
  kind: "query",
  label: { en: "forward", ja: "転送" },
  caption,
});

export const SCENARIOS: Scenario[] = [
  {
    id: "endpoint",
    label: { en: "On-prem → AWS API endpoint", ja: "オンプレ → AWS API エンドポイント" },
    question: "ec2.ap-northeast-1.amazonaws.com",
    parties: ["host", "corpDns", "inbound", "resolver", "zone"],
    answer: "10.0.1.15, 10.0.2.15",
    ok: true,
    outcome: {
      en: "The host now sends HTTPS to 10.0.1.15 over DX or VPN, to the interface endpoint. DNS chose the road.",
      ja: "ホストは DX / VPN 越しに 10.0.1.15 (インターフェイスエンドポイント) へ HTTPS を送ります。道を選んだのは DNS でした。",
    },
    hops: [
      {
        from: "host",
        to: "corpDns",
        kind: "query",
        label: { en: "A? ec2…", ja: "A? ec2…" },
        caption: {
          en: "The host asks its usual corporate DNS server for ec2.ap-northeast-1.amazonaws.com.",
          ja: "ホストがいつもの社内 DNS に ec2.ap-northeast-1.amazonaws.com を問い合わせます。",
        },
      },
      fwd("inbound", {
        en: "A conditional forwarder for exactly that name matches, so corp DNS forwards the query over DX or VPN (UDP 53) to the VPC Resolver inbound endpoint's IP.",
        ja: "まさにその名前の条件付きフォワーダーに一致し、社内 DNS はクエリを DX / VPN 越し (UDP 53) に Resolver インバウンドエンドポイントの IP へ転送します。",
      }),
      {
        from: "inbound",
        to: "resolver",
        kind: "query",
        label: { en: "in VPC context", ja: "VPC 内の扱いで" },
        caption: {
          en: "The inbound endpoint hands the query to VPC Resolver, which answers as if the question came from inside the hub VPC.",
          ja: "インバウンドエンドポイントはクエリを VPC Resolver に渡し、Resolver はハブ VPC の中から聞かれたかのように答えます。",
        },
      },
      {
        from: "resolver",
        to: "zone",
        kind: "query",
        label: { en: "lookup", ja: "参照" },
        caption: {
          en: "Private DNS on the interface endpoint attached a hidden AWS-managed private zone to this VPC. Resolver looks there.",
          ja: "インターフェイスエンドポイントのプライベート DNS が、この VPC に AWS 管理の隠れたプライベートゾーンを付けています。Resolver はそこを引きます。",
        },
      },
      {
        from: "zone",
        to: "resolver",
        kind: "answer",
        label: { en: "10.0.1.15 …", ja: "10.0.1.15 …" },
        caption: {
          en: "The zone answers with the endpoint's private IPs, one per AZ.",
          ja: "ゾーンはエンドポイントのプライベート IP (AZ ごとに 1 つ) を返します。",
        },
      },
      {
        from: "resolver",
        to: "inbound",
        kind: "answer",
        label: { en: "10.0.1.15 …", ja: "10.0.1.15 …" },
        caption: {
          en: "VPC Resolver hands the answer back to the inbound endpoint.",
          ja: "VPC Resolver が答えをインバウンドエンドポイントに返します。",
        },
      },
      {
        from: "inbound",
        to: "corpDns",
        kind: "answer",
        label: { en: "10.0.1.15 …", ja: "10.0.1.15 …" },
        caption: {
          en: "The inbound endpoint replies to corp DNS over DX or VPN.",
          ja: "インバウンドエンドポイントが DX / VPN 越しに社内 DNS へ応答します。",
        },
      },
      {
        from: "corpDns",
        to: "host",
        kind: "answer",
        label: { en: "10.0.1.15 …", ja: "10.0.1.15 …" },
        caption: {
          en: "Corp DNS caches it for the TTL and answers the host: 10.0.1.15, 10.0.2.15.",
          ja: "社内 DNS は TTL の間キャッシュし、ホストに 10.0.1.15, 10.0.2.15 と答えます。",
        },
      },
    ],
  },
  {
    id: "phz",
    label: {
      en: "On-prem → private hosted zone",
      ja: "オンプレ → プライベートホストゾーン",
    },
    question: "db.aws.corp.example.com",
    parties: ["host", "corpDns", "inbound", "resolver", "zone"],
    answer: "10.0.3.25",
    ok: true,
    outcome: {
      en: "The private hosted zone must be associated with the inbound endpoint's VPC (directly or through a Route 53 Profile), or the answer is NXDOMAIN. Since June 2025 a delegation-type inbound endpoint lets corp DNS follow an NS record instead of a forwarder.",
      ja: "プライベートホストゾーンはインバウンドエンドポイントの VPC に関連付ける (直接か Route 53 Profile 経由) 必要があり、なければ NXDOMAIN。2025 年 6 月からはインバウンド委任エンドポイントで、フォワーダーの代わりに NS レコードをたどらせることもできます。",
    },
    hops: [
      {
        from: "host",
        to: "corpDns",
        kind: "query",
        label: { en: "A? db.aws…", ja: "A? db.aws…" },
        caption: {
          en: "The host asks corp DNS for db.aws.corp.example.com.",
          ja: "ホストが社内 DNS に db.aws.corp.example.com を問い合わせます。",
        },
      },
      fwd("inbound", {
        en: "Corp DNS has a conditional forwarder for aws.corp.example.com pointing at the inbound endpoint IPs, and forwards over DX or VPN.",
        ja: "社内 DNS には aws.corp.example.com をインバウンドエンドポイントの IP へ向ける条件付きフォワーダーがあり、DX / VPN 越しに転送します。",
      }),
      {
        from: "inbound",
        to: "resolver",
        kind: "query",
        label: { en: "in VPC context", ja: "VPC 内の扱いで" },
        caption: {
          en: "VPC Resolver takes the query in the context of the inbound endpoint's VPC.",
          ja: "VPC Resolver がインバウンドエンドポイントの VPC の立場でクエリを受けます。",
        },
      },
      {
        from: "resolver",
        to: "zone",
        kind: "query",
        label: { en: "lookup", ja: "参照" },
        caption: {
          en: "The private hosted zone aws.corp.example.com is associated with that VPC, so Resolver looks it up.",
          ja: "プライベートホストゾーン aws.corp.example.com がその VPC に関連付いているので、Resolver が参照します。",
        },
      },
      {
        from: "zone",
        to: "resolver",
        kind: "answer",
        label: { en: "10.0.3.25", ja: "10.0.3.25" },
        caption: {
          en: "The zone answers 10.0.3.25.",
          ja: "ゾーンが 10.0.3.25 と答えます。",
        },
      },
      {
        from: "resolver",
        to: "inbound",
        kind: "answer",
        label: { en: "10.0.3.25", ja: "10.0.3.25" },
        caption: {
          en: "VPC Resolver hands the answer back to the inbound endpoint.",
          ja: "VPC Resolver が答えをインバウンドエンドポイントに返します。",
        },
      },
      {
        from: "inbound",
        to: "corpDns",
        kind: "answer",
        label: { en: "10.0.3.25", ja: "10.0.3.25" },
        caption: {
          en: "The inbound endpoint replies to corp DNS over DX or VPN.",
          ja: "インバウンドエンドポイントが DX / VPN 越しに社内 DNS へ応答します。",
        },
      },
      {
        from: "corpDns",
        to: "host",
        kind: "answer",
        label: { en: "10.0.3.25", ja: "10.0.3.25" },
        caption: {
          en: "The host gets 10.0.3.25.",
          ja: "ホストは 10.0.3.25 を受け取ります。",
        },
      },
    ],
  },
  {
    id: "outbound",
    label: { en: "EC2 → corp name", ja: "EC2 → 社内の名前" },
    question: "app.corp.example.com",
    parties: ["ec2", "resolver", "outbound", "corpDns"],
    answer: "10.10.5.30",
    ok: true,
    outcome: {
      en: "On-prem firewalls must allow DNS from the outbound endpoint's IPs: corp DNS never sees the EC2 instance's own address.",
      ja: "オンプレのファイアウォールはアウトバウンドエンドポイントの IP からの DNS を許可すること。社内 DNS には EC2 自身のアドレスは見えません。",
    },
    hops: [
      {
        from: "ec2",
        to: "resolver",
        kind: "query",
        label: { en: "A? app.corp…", ja: "A? app.corp…" },
        caption: {
          en: "The instance asks VPC Resolver at 10.0.0.2 for app.corp.example.com.",
          ja: "インスタンスが 10.0.0.2 の VPC Resolver に app.corp.example.com を問い合わせます。",
        },
      },
      {
        from: "resolver",
        to: "resolver",
        kind: "local",
        label: { en: "rule match", ja: "ルール一致" },
        caption: {
          en: "The most specific matching rule is a forwarding rule for corp.example.com, associated with this VPC (or shared through AWS RAM or a Profile).",
          ja: "最も具体的に一致するのは、この VPC に関連付けた (または AWS RAM や Profile で共有された) corp.example.com の転送ルール。",
        },
      },
      {
        from: "resolver",
        to: "outbound",
        kind: "query",
        label: { en: "forward", ja: "転送" },
        caption: {
          en: "Resolver sends the query out through the rule's outbound endpoint.",
          ja: "Resolver はルールに指定されたアウトバウンドエンドポイントからクエリを送り出します。",
        },
      },
      {
        from: "outbound",
        to: "corpDns",
        kind: "query",
        label: { en: "from 10.0.1.20", ja: "10.0.1.20 から" },
        caption: {
          en: "The query reaches corp DNS at 10.10.0.53 over DX or VPN, sourced from the outbound endpoint ENI 10.0.1.20.",
          ja: "クエリは DX / VPN 越しに 10.10.0.53 の社内 DNS へ。送信元はアウトバウンドエンドポイントの ENI 10.0.1.20。",
        },
      },
      {
        from: "corpDns",
        to: "outbound",
        kind: "answer",
        label: { en: "10.10.5.30", ja: "10.10.5.30" },
        caption: {
          en: "Corp DNS answers 10.10.5.30.",
          ja: "社内 DNS が 10.10.5.30 と答えます。",
        },
      },
      {
        from: "outbound",
        to: "resolver",
        kind: "answer",
        label: { en: "10.10.5.30", ja: "10.10.5.30" },
        caption: {
          en: "The answer comes back to VPC Resolver.",
          ja: "答えが VPC Resolver に戻ります。",
        },
      },
      {
        from: "resolver",
        to: "ec2",
        kind: "answer",
        label: { en: "10.10.5.30", ja: "10.10.5.30" },
        caption: {
          en: "The instance gets 10.10.5.30, cached for the TTL.",
          ja: "インスタンスは 10.10.5.30 を受け取り、TTL の間キャッシュされます。",
        },
      },
    ],
  },
  {
    id: "base2",
    label: { en: "Broken: forward to .2", ja: "失敗: .2 へ転送" },
    question: "db.aws.corp.example.com",
    parties: ["host", "corpDns", "base2"],
    answer: null,
    ok: false,
    outcome: {
      en: "The VPC's base+2 resolver is not reachable from on-prem over VPN or Direct Connect, and AWS calls forwarding to it unsupported, with unstable results. That is exactly the gap inbound endpoints fill.",
      ja: "VPC の「ベース + 2」リゾルバーは VPN / Direct Connect 越しのオンプレからは到達できず、AWS もそこへの転送は非サポートで結果が不安定になると明言しています。この穴を埋めるのがインバウンドエンドポイントです。",
    },
    hops: [
      {
        from: "host",
        to: "corpDns",
        kind: "query",
        label: { en: "A? db.aws…", ja: "A? db.aws…" },
        caption: {
          en: "The host asks corp DNS for db.aws.corp.example.com.",
          ja: "ホストが社内 DNS に db.aws.corp.example.com を問い合わせます。",
        },
      },
      {
        from: "corpDns",
        to: "base2",
        kind: "fail",
        label: { en: "forward ✕", ja: "転送 ✕" },
        caption: {
          en: "Someone pointed the forwarder at 10.0.0.2, the VPC's built-in resolver. It is not reachable over DX or VPN, so the query goes nowhere.",
          ja: "誰かがフォワーダーを VPC 内蔵のリゾルバー 10.0.0.2 に向けていました。DX / VPN 越しには届かないので、クエリは行き場を失います。",
        },
      },
      {
        from: "corpDns",
        to: "host",
        kind: "fail",
        label: { en: "SERVFAIL", ja: "SERVFAIL" },
        caption: {
          en: "Corp DNS times out and returns a failure to the host.",
          ja: "社内 DNS はタイムアウトし、ホストに失敗を返します。",
        },
      },
    ],
  },
  {
    id: "noForwarder",
    label: { en: "Leak: no forwarder", ja: "漏れ: フォワーダーなし" },
    question: "ec2.ap-northeast-1.amazonaws.com",
    parties: ["host", "corpDns", "publicDns"],
    answer: { en: "public IPs", ja: "パブリック IP" },
    ok: false,
    outcome: {
      en: "You get an answer, just the wrong one: public IPs. The traffic then leaves over the internet (or a public VIF) and never touches the interface endpoint you paid for.",
      ja: "答えは返る、ただし間違った答え: パブリック IP。通信はインターネット (またはパブリック VIF) へ出ていき、費用をかけたインターフェイスエンドポイントを一切通りません。",
    },
    hops: [
      {
        from: "host",
        to: "corpDns",
        kind: "query",
        label: { en: "A? ec2…", ja: "A? ec2…" },
        caption: {
          en: "The host asks corp DNS for ec2.ap-northeast-1.amazonaws.com.",
          ja: "ホストが社内 DNS に ec2.ap-northeast-1.amazonaws.com を問い合わせます。",
        },
      },
      {
        from: "corpDns",
        to: "publicDns",
        kind: "query",
        label: { en: "recurse", ja: "再帰問い合わせ" },
        caption: {
          en: "There is no conditional forwarder, so corp DNS resolves the name on the internet like any other.",
          ja: "条件付きフォワーダーがないので、社内 DNS は他の名前と同じくインターネットで解決します。",
        },
      },
      {
        from: "publicDns",
        to: "corpDns",
        kind: "answer",
        label: { en: "public IPs", ja: "パブリック IP" },
        caption: {
          en: "Public DNS returns the service's public IPs. The private DNS records exist only inside the VPC.",
          ja: "パブリック DNS はサービスのパブリック IP を返します。プライベート DNS のレコードは VPC の中にしかありません。",
        },
      },
      {
        from: "corpDns",
        to: "host",
        kind: "answer",
        label: { en: "public IPs", ja: "パブリック IP" },
        caption: {
          en: "The host gets public IPs.",
          ja: "ホストはパブリック IP を受け取ります。",
        },
      },
    ],
  },
];

export const SCENARIO: Record<ScenarioId, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
) as Record<ScenarioId, Scenario>;
