import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import {
  Callout,
  DataTable,
  MetaphorLimit,
  Section,
  Sources,
  Spec,
  Traps,
} from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { DnsLab } from "./DnsLab";

const BLOCKS: { name: L; where: L; job: L }[] = [
  {
    name: {
      en: "VPC Resolver (AmazonProvidedDNS)",
      ja: "VPC Resolver (AmazonProvidedDNS)",
    },
    where: {
      en: "VPC CIDR base + 2, e.g. 10.0.0.2",
      ja: "VPC CIDR のベース + 2 (例: 10.0.0.2)",
    },
    job: {
      en: "Answers VPC names, private hosted zones and public names, for clients inside the VPC only",
      ja: "VPC 内のクライアント専用に、VPC の名前・プライベートホストゾーン・パブリックな名前を解決",
    },
  },
  {
    name: { en: "Inbound endpoint", ja: "インバウンドエンドポイント" },
    where: {
      en: "2–6 ENIs with fixed private IPs",
      ja: "固定のプライベート IP を持つ 2〜6 個の ENI",
    },
    job: {
      en: "On-prem DNS forwards here; answered as if asked inside that VPC",
      ja: "オンプレの DNS がここへ転送。その VPC の中から聞いたものとして回答",
    },
  },
  {
    name: {
      en: "Outbound endpoint + forwarding rule",
      ja: "アウトバウンドエンドポイント + 転送ルール",
    },
    where: {
      en: "2–6 ENIs; rules associated with VPCs",
      ja: "2〜6 個の ENI。ルールは VPC に関連付け",
    },
    job: {
      en: "Sends matching names (corp.example.com) to your DNS servers; most specific domain wins",
      ja: "一致した名前 (corp.example.com) を社内 DNS へ送る。最も具体的なドメインが勝つ",
    },
  },
  {
    name: { en: "Route 53 Profile", ja: "Route 53 Profile" },
    where: {
      en: "One per VPC, shared with AWS RAM",
      ja: "VPC あたり 1 つ、AWS RAM で共有",
    },
    job: {
      en: "Applies zones, rules, DNS Firewall and interface endpoints to many VPCs at once",
      ja: "ゾーン・ルール・DNS Firewall・インターフェイスエンドポイントを多数の VPC にまとめて適用",
    },
  },
];

const TRAPS: L[] = [
  {
    en: "Forwarder points at an inbound endpoint in the wrong VPC: answers only include zones associated with that VPC.",
    ja: "フォワーダーの向け先が別 VPC のインバウンドエンドポイント: 答えに含まれるのはその VPC に関連付いたゾーンだけ。",
  },
  {
    en: "Forwarding loop: on-prem sends aws.corp.example.com to AWS while a VPC rule sends corp.example.com back on-prem. Add a system rule for the AWS-hosted subdomain.",
    ja: "転送ループ: オンプレが aws.corp.example.com を AWS へ、VPC のルールが corp.example.com をオンプレへ送り返す。AWS 側サブドメインにシステムルールを追加する。",
  },
  {
    en: "A forwarding rule for the same domain as a private hosted zone wins, and silently sends the query on-prem.",
    ja: "プライベートホストゾーンと同じドメインの転送ルールはルール側が勝ち、黙ってクエリをオンプレへ送る。",
  },
  {
    en: "Forwarding . or com to on-prem without a system rule for amazonaws.com: AWS service names then resolve on-prem.",
    ja: "amazonaws.com のシステムルールなしで . や com をオンプレへ転送: AWS サービス名までオンプレで解決される。",
  },
  {
    en: "Split horizon: a private zone example.com hides the public example.com; anything missing returns NXDOMAIN, not the public answer.",
    ja: "スプリットホライズン: プライベートゾーン example.com はパブリックの example.com を隠す。ない名前はパブリックの答えでなく NXDOMAIN。",
  },
  {
    en: "Windows AD: create conditional forwarders per domain (ec2.ap-northeast-1.amazonaws.com, not all of amazonaws.com), list both inbound IPs, and store them in AD so every domain controller forwards the same way.",
    ja: "Windows AD: 条件付きフォワーダーはドメイン単位で (amazonaws.com 全体ではなく ec2.ap-northeast-1.amazonaws.com)、インバウンドの IP を 2 つとも登録し、AD に格納して全 DC で同じ転送にする。",
  },
  {
    en: "Restrictive security groups on an inbound endpoint turn on connection tracking and cut capacity to about 1,500 queries/s per IP.",
    ja: "インバウンドエンドポイントのセキュリティグループを絞ると接続追跡が働き、IP あたり約 1,500 クエリ/秒まで落ちる。",
  },
];

export function DnsSection() {
  const { t } = useLang();
  return (
    <Section
      id="dns"
      title={{
        en: "Hybrid DNS: the name picks the road",
        ja: "ハイブリッド DNS: 名前が道を決める",
      }}
      lead={{
        en: "A private path is useless if the name resolves to the wrong address. An on-prem host that gets a public IP for an AWS API ignores your endpoint; an EC2 instance that cannot resolve corp.example.com never uses your Direct Connect. Route 53 VPC Resolver endpoints connect the two DNS worlds, one direction each.",
        ja: "名前が間違ったアドレスに解決されれば、閉域の経路も役に立ちません。AWS API のパブリック IP を引いたオンプレのホストはエンドポイントを素通りし、corp.example.com を解決できない EC2 は Direct Connect を使いません。Route 53 VPC Resolver のエンドポイントが、2 つの DNS の世界を片方向ずつつなぎます。",
      }}
    >
      <div className="max-w-3xl space-y-3">
        <p>
          {t({
            en: "Inbound endpoints answer questions from your network about AWS names. Outbound endpoints, with forwarding rules, ask your DNS servers about corporate names on behalf of VPCs. Answer the question below, then step through a lookup.",
            ja: "インバウンドエンドポイントは、社内からの AWS 側の名前の問い合わせに答えます。アウトバウンドエンドポイントは転送ルールに従い、VPC に代わって社内の名前を社内 DNS に尋ねます。下の質問に答えてから、名前解決を 1 ステップずつたどってみてください。",
          })}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {t({
            en: 'Naming note: "Route 53 Resolver" was renamed "Route 53 VPC Resolver" in November 2025, when the separate Global Resolver arrived. Older docs and blog posts use the old name.',
            ja: "名前の注意: 2025 年 11 月、別製品の Global Resolver 登場に合わせて「Route 53 Resolver」は「Route 53 VPC Resolver」に改称。古いドキュメントやブログは旧名のまま。",
          })}
        </p>
      </div>

      <div className="mt-6">
        <Predict
          question={{
            en: "Corp DNS forwards aws.corp.example.com to the VPC's resolver at 10.0.0.2 over Direct Connect. Does it work?",
            ja: "社内 DNS が aws.corp.example.com を Direct Connect 越しに VPC のリゾルバー 10.0.0.2 へ転送。うまくいく?",
          }}
          options={[
            {
              id: "yes",
              label: { en: "Yes, it's routable", ja: "うまくいく (ルーティングできる)" },
            },
            { id: "no", label: { en: "No", ja: "うまくいかない" } },
          ]}
          answer="no"
          why={
            <p>
              {t({
                en: 'The base + 2 resolver is not reachable from on-prem over VPN or Direct Connect, and AWS calls forwarding to it unsupported. Point the forwarder at a VPC Resolver inbound endpoint\'s IPs instead. Pick "Broken: forward to .2" below to watch it fail.',
                ja: "「ベース + 2」のリゾルバーは VPN / Direct Connect 越しのオンプレからは届かず、AWS もそこへの転送を非サポートとしています。フォワーダーは VPC Resolver のインバウンドエンドポイントの IP に向けます。下の「失敗: .2 へ転送」で失敗の様子を見られます。",
              })}
            </p>
          }
        >
          <DnsLab />
        </Predict>
      </div>

      <h3 className="mt-12 text-xl font-extrabold">
        {t({ en: "The building blocks", ja: "部品" })}
      </h3>
      <div className="mt-3">
        <DataTable
          columns={[
            { en: "Component", ja: "コンポーネント" },
            { en: "Lives where", ja: "どこにある" },
            { en: "Job", ja: "役割" },
          ]}
          rows={BLOCKS.map((b) => [t(b.name), t(b.where), t(b.job)])}
        />
      </div>

      <h3 className="mt-12 text-xl font-extrabold">
        {t({ en: "Limits and prices", ja: "上限と料金" })}
      </h3>
      <dl className="panel mt-3 grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
        <Spec
          k={{ en: "Queries per endpoint IP", ja: "エンドポイント IP あたり" }}
          v={{
            en: "Up to 10,000/s (UDP); add ENIs above 50%",
            ja: "最大 10,000 クエリ/秒 (UDP)。50% を超えたら ENI 追加",
          }}
        />
        <Spec
          k={{ en: "With connection tracking", ja: "接続追跡あり" }}
          v={{ en: "About 1,500/s per IP", ja: "IP あたり約 1,500 クエリ/秒" }}
        />
        <Spec
          k={{ en: "IPs per endpoint", ja: "エンドポイントあたり IP" }}
          v={{ en: "6 (adjustable), at least 2 AZs", ja: "6 (引き上げ可)、2 AZ 以上" }}
        />
        <Spec
          k={{ en: "Endpoint ENI (Tokyo)", ja: "エンドポイント ENI (東京)" }}
          v={{ en: "$0.125 per ENI-hour", ja: "ENI あたり $0.125/時" }}
        />
        <Spec
          k={{ en: "Queries through endpoints", ja: "エンドポイント経由のクエリ" }}
          v={{
            en: "$0.40 per million (first billion)",
            ja: "100 万件あたり $0.40 (最初の 10 億件)",
          }}
        />
        <Spec
          k={{ en: "Profiles", ja: "Profiles" }}
          v={{
            en: "$0.75/hour per account, up to 100 VPC associations",
            ja: "アカウントあたり $0.75/時 (VPC 関連付け 100 まで)",
          }}
        />
      </dl>
      <p className="mt-3 max-w-3xl text-sm text-[var(--muted)]">
        {t({
          en: "Worked example: one inbound and one outbound endpoint with 2 ENIs each is 4 × 730 × $0.125 = $365 a month before queries; 100 million queries a month through them adds $40. Queries VPC Resolver answers locally are free.",
          ja: "計算例: インバウンドとアウトバウンドを ENI 2 つずつ置くと 4 × 730 × $0.125 = 月 $365 (クエリ料金別)。月 1 億クエリが通ると +$40。VPC Resolver がローカルで答えるクエリは無料。",
        })}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Callout tone="warn" title={{ en: "Newer tools", ja: "新しめの機能" }}>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              {t({
                en: "Route 53 Profiles (2024-04-22): one bundle of zones, rules, DNS Firewall rule groups and, since 2025-04-28, interface endpoints, applied to many VPCs across accounts in a Region.",
                ja: "Route 53 Profiles (2024-04-22): ゾーン・ルール・DNS Firewall ルールグループ、2025-04-28 からはインターフェイスエンドポイントもまとめ、リージョン内の多数の VPC・アカウントに適用。",
              })}
            </li>
            <li>
              {t({
                en: "Delegation (2025-06-24): inbound and outbound endpoints can follow NS delegation, so a subdomain can be delegated instead of forwarded.",
                ja: "委任 (2025-06-24): インバウンド / アウトバウンドエンドポイントが NS 委任をたどれるようになり、サブドメインを転送でなく委任できる。インバウンド側は「インバウンド委任エンドポイント」。",
              })}
            </li>
            <li>
              {t({
                en: "DNS over HTTPS on endpoints, and DNS64 on inbound endpoints since 2026-05-07.",
                ja: "エンドポイントでの DNS over HTTPS、2026-05-07 からはインバウンドエンドポイントで DNS64 にも対応。",
              })}
            </li>
          </ul>
        </Callout>
        <Callout
          tone="info"
          title={{
            en: "DNS Firewall reaches on-prem too",
            ja: "DNS Firewall はオンプレにも効かせられる",
          }}
        >
          {t({
            en: "DNS Firewall filters queries going through VPC Resolver by domain name (allow, block, alert); Advanced (2024-11-15) adds DNS tunneling and DGA detection. Forward on-prem queries to an inbound endpoint in a VPC with the rule group associated, and on-prem clients are filtered as well. It filters names only, not IPs. $0.60 per million queries in Tokyo.",
            ja: "DNS Firewall は VPC Resolver を通るクエリをドメイン名で許可・ブロック・アラート。Advanced (2024-11-15) で DNS トンネリングと DGA 検知が追加。ルールグループを関連付けた VPC のインバウンドエンドポイントへオンプレのクエリを転送すれば、オンプレのクライアントにも効きます。フィルター対象は名前のみで IP は対象外。東京で 100 万クエリあたり $0.60。",
          })}
        </Callout>
      </div>

      <div className="mt-10">
        <Traps items={TRAPS} />
      </div>

      <MetaphorLimit>
        {t({
          en: "DNS is not a road. It is the satnav: it never carries your traffic, it only decides which address the car drives to, and therefore which road it takes. Every DNS hop here travels over DX or VPN like any other packet; when the lookup is wrong, the data simply goes down a different road.",
          ja: "DNS は道ではなくカーナビです。通信そのものは運ばず、車がどの住所へ向かうか、つまりどの道を走るかを決めるだけ。ここでの DNS の各ホップも、他のパケットと同じく DX や VPN を通ります。名前解決を間違えれば、データは別の道へ走っていきます。",
        })}
      </MetaphorLimit>

      <Sources
        doc="10-hybrid-dns.md"
        links={[
          {
            label: "Route 53 VPC Resolver",
            url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html",
          },
          {
            label: "Resolver quotas",
            url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/DNSLimitations.html",
          },
          {
            label: "Route 53 Profiles",
            url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/profiles.html",
          },
          {
            label: "Resolver endpoint delegation (blog)",
            url: "https://aws.amazon.com/blogs/networking-and-content-delivery/streamline-hybrid-dns-management-using-amazon-route-53-resolver-endpoints-delegation/",
          },
          {
            label: "Hybrid workloads with DNS Firewall (blog)",
            url: "https://aws.amazon.com/blogs/networking-and-content-delivery/securing-hybrid-workloads-using-amazon-route-53-resolver-dns-firewall/",
          },
          { label: "Route 53 pricing", url: "https://aws.amazon.com/route53/pricing/" },
        ]}
      />
    </Section>
  );
}
