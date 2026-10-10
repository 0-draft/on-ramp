import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import {
  Callout,
  DataTable,
  MetaphorLimit,
  Section,
  Sources,
  Spec,
} from "@/components/ui";
import { HopWalk } from "./HopWalk";
import { PolicyLab } from "./PolicyLab";

const FACTS: { k: L; v: L }[] = [
  {
    k: { en: "Minimum TLS on AWS APIs", ja: "AWS API の最低 TLS" },
    v: { en: "TLS 1.2 (since 2024-02-27)", ja: "TLS 1.2 (2024-02-27 以降)" },
  },
  {
    k: { en: "Data in from the internet", ja: "インターネットからの受信" },
    v: { en: "Free", ja: "無料" },
  },
  {
    k: { en: "Data out, Tokyo, first 10 TB", ja: "送信 (東京、最初の 10 TB)" },
    v: { en: "USD 0.114/GB", ja: "USD 0.114/GB" },
  },
  {
    k: { en: "NAT gateway, Tokyo", ja: "NAT ゲートウェイ (東京)" },
    v: { en: "USD 0.062/h + 0.062/GB", ja: "USD 0.062/時 + 0.062/GB" },
  },
  {
    k: { en: "Public IPv4 address", ja: "パブリック IPv4 アドレス" },
    v: { en: "USD 0.005/h, in use or idle", ja: "USD 0.005/時 (使用中・未使用とも)" },
  },
  {
    k: { en: "End-to-end SLA across ISPs", ja: "ISP をまたぐ SLA" },
    v: { en: "None", ja: "なし" },
  },
];

const DOORS: { name: string; what: L; note: L }[] = [
  {
    name: "ALB / NLB",
    what: {
      en: "Regional public entry with security groups and TLS",
      ja: "セキュリティグループと TLS 付きのリージョンの入口",
    },
    note: {
      en: "Allow your office CIDRs in the security group (60 inbound rules by default)",
      ja: "セキュリティグループでオフィスの CIDR を許可 (既定でインバウンド 60 ルール)",
    },
  },
  {
    name: "CloudFront VPC origins",
    what: {
      en: "Edge in front of an ALB, NLB or EC2 in a private subnet (since 2024-11-20)",
      ja: "プライベートサブネットの ALB・NLB・EC2 の前にエッジ (2024-11-20 以降)",
    },
    note: {
      en: "No extra charge; the VPC still needs an internet gateway attached",
      ja: "追加料金なし。ただし VPC にインターネットゲートウェイのアタッチは必要",
    },
  },
  {
    name: "Global Accelerator",
    what: {
      en: "2 static anycast IPv4 addresses into the AWS backbone",
      ja: "AWS バックボーンへの静的エニーキャスト IPv4 アドレス 2 つ",
    },
    note: {
      en: "Gives your firewall fixed IPs to allowlist; USD 0.025 per accelerator-hour",
      ja: "社内 FW で許可できる固定 IP。アクセラレーター 1 時間 USD 0.025",
    },
  },
  {
    name: "API Gateway",
    what: { en: "Managed HTTPS API", ja: "マネージドな HTTPS API" },
    note: {
      en: "Resource policy with aws:SourceIp for office-only access",
      ja: "aws:SourceIp のリソースポリシーでオフィス限定に",
    },
  },
];

const OK_WHEN: L[] = [
  {
    en: "The connection is temporary, or a stop-gap while Direct Connect is ordered.",
    ja: "一時的な接続、または Direct Connect 開通までのつなぎ。",
  },
  {
    en: "Cost matters more than steady latency.",
    ja: "安定したレイテンシより費用が大事。",
  },
  {
    en: "The service is meant to be public: CloudFront, API Gateway, WorkSpaces.",
    ja: "もともと公開前提のサービス: CloudFront、API Gateway、WorkSpaces。",
  },
  {
    en: "Your security policy allows the internet, with TLS or a VPN on top.",
    ja: "セキュリティポリシーがインターネット利用を認めている (TLS か VPN を重ねる前提)。",
  },
];

export function InternetSection() {
  const { t } = useLang();
  return (
    <Section
      id="internet"
      title={{
        en: "The internet: the road you already have",
        ja: "インターネット: 既にある道",
      }}
      lead={{
        en: "Most AWS service APIs (S3, STS, SQS, API Gateway, KMS) have public endpoints. From the office they are one HTTPS call away, through your proxy and your ISP. No setup, no SLA across ISPs, and TLS is the only protection on the way.",
        ja: "AWS のサービス API の多く (S3、STS、SQS、API Gateway、KMS) はパブリックエンドポイントを持っています。オフィスからはプロキシと ISP を通って HTTPS 1 本で届きます。準備不要、ただし ISP をまたぐ SLA はなく、途中を守るのは TLS だけ。",
      }}
    >
      <h3 className="mb-3 text-xl font-extrabold">
        {t({ en: "Walk the road, one hop at a time", ja: "1 ホップずつ道をたどる" })}
      </h3>
      <HopWalk />

      <dl className="panel mt-6 grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-5">
        {FACTS.map((f, i) => (
          <Spec key={i} k={f.k} v={f.v} />
        ))}
      </dl>

      <h3 className="mt-12 mb-2 text-xl font-extrabold">
        {t({
          en: "The allowlist that breaks when you add Direct Connect",
          ja: "Direct Connect を足すと壊れる許可リスト",
        })}
      </h3>
      <p className="mb-4 max-w-3xl">
        {t({
          en: "Teams lock S3 buckets to the office with aws:SourceIp. It works until the same traffic moves onto a VPC endpoint over DX or VPN: requests through an endpoint carry no aws:SourceIp, so the policy denies everything. A policy that must work on both roads needs an OR: two Allow statements (one on aws:SourceIp, one on aws:SourceVpce), or, Deny-style, one Deny carrying both NotIpAddress aws:SourceIp and StringNotEquals aws:SourceVpce so it denies only when neither matches. Two separate Deny statements block everything.",
          ja: "S3 バケットを aws:SourceIp でオフィス限定にするのはよくある手。ところが同じ通信を DX や VPN 経由の VPC エンドポイントに移すと、エンドポイント経由のリクエストには aws:SourceIp がないので全部拒否されます。両方の道で通すには OR が必要です。Allow なら aws:SourceIp と aws:SourceVpce の 2 ステートメント、Deny なら NotIpAddress と StringNotEquals を 1 つの Deny にまとめます (両方外れたときだけ拒否)。Deny を 2 つに分けると全部拒否されます。",
        })}
      </p>
      <PolicyLab />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Callout
          tone="warn"
          title={{
            en: '"S3 over DX still goes over the internet"? No.',
            ja: "「DX でも S3 はインターネット経由」? いいえ。",
          }}
        >
          {t({
            en: "With a Direct Connect public VIF, AWS advertises all its public prefixes to you over BGP, and traffic to S3 enters AWS at the DX location without touching the internet. The flip side: a public VIF reaches every AWS public IP, including other customers' EC2, and it is not encrypted by default. Keep TLS, or put a VPN on it.",
            ja: "Direct Connect のパブリック VIF なら、AWS は自社のパブリックプレフィックスを全部 BGP で広告し、S3 への通信は DX ロケーションで AWS に入るのでインターネットを通りません。裏返すと、パブリック VIF は他社の EC2 も含むすべての AWS パブリック IP に届き、しかもデフォルトでは暗号化されません。TLS は維持するか、上に VPN を。",
          })}
        </Callout>
        <Callout
          tone="info"
          title={{
            en: "Allowlisting AWS on your firewall",
            ja: "社内 FW で AWS を許可するには",
          }}
        >
          {t({
            en: "Build it from ip-ranges.json (filter by service and Region) or, better, from FQDNs, because AWS service IPs change. Subscribe to the AmazonIpSpaceChanged SNS topic so the list does not drift.",
            ja: "ip-ranges.json (サービスとリージョンで絞り込む) から作るか、できれば FQDN ベースにします。AWS のサービス IP は変わるので、AmazonIpSpaceChanged の SNS トピックを購読してリストが古くならないように。",
          })}
        </Callout>
      </div>

      <h3 className="mt-12 mb-3 text-xl font-extrabold">
        {t({
          en: "Front doors for apps your office uses",
          ja: "社内から使うアプリの入口",
        })}
      </h3>
      <DataTable
        columns={[
          { en: "Front door", ja: "入口" },
          { en: "What it gives you", ja: "何が得られるか" },
          { en: "Note", ja: "メモ" },
        ]}
        rows={DOORS.map((d) => [
          d.name,
          t(d.what),
          <span key="n" className="text-[var(--muted)]">
            {t(d.note)}
          </span>,
        ])}
      />

      <h3 className="mt-12 mb-3 text-xl font-extrabold">
        {t({
          en: "When AWS says the internet is fine",
          ja: "AWS が「インターネットで十分」とする場合",
        })}
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {OK_WHEN.map((x, i) => (
          <li key={i} className="panel flex gap-3 p-4">
            <span aria-hidden="true" className="font-black text-[var(--ok)]">
              ✓
            </span>
            {t(x)}
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-3xl text-[var(--muted)]">
        {t({
          en: "The Well-Architected guidance adds one warning: do not load balance across Direct Connect and a VPN, because their latency and bandwidth differ.",
          ja: "Well-Architected はもう 1 つ注意を添えています: Direct Connect と VPN の間で負荷分散しないこと。レイテンシも帯域も違うからです。",
        })}
      </p>

      <MetaphorLimit>
        {t({
          en: 'On a highway, "public road" and "public address" are the same thing. On AWS they are not: a request to S3\'s public IP from EC2 or over a DX public VIF uses public addresses but never touches the internet. "Public" describes the address, not the road.',
          ja: "道路なら「公道」と「公開の住所」は同じもの。でも AWS では違います。EC2 や DX パブリック VIF から S3 のパブリック IP へのリクエストは、パブリックアドレスを使いながらインターネットを一切通りません。「パブリック」はアドレスの話で、道の話ではありません。",
        })}
      </MetaphorLimit>

      <Sources
        doc="08-internet-paths.md"
        links={[
          {
            label: "IAM condition keys (aws:SourceIp, aws:SourceVpce)",
            url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html",
          },
          {
            label: "AWS IP address range notifications",
            url: "https://docs.aws.amazon.com/vpc/latest/userguide/subscribe-notifications.html",
          },
          {
            label: "TLS 1.2 required for AWS endpoints",
            url: "https://aws.amazon.com/blogs/security/tls-1-2-required-for-aws-endpoints/",
          },
          {
            label: "Hybrid Connectivity whitepaper",
            url: "https://docs.aws.amazon.com/whitepapers/latest/hybrid-connectivity/hybrid-connectivity.html",
          },
          {
            label: "CloudFront VPC origins",
            url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-vpc-origins.html",
          },
        ]}
      />
    </Section>
  );
}
