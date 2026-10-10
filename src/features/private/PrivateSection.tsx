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
import { ReverseStrip } from "./ReverseStrip";
import { ReachLab } from "./ReachLab";

const WAYS: { way: L; talks: L; dns: L; cost: L }[] = [
  {
    way: { en: "Internet", ja: "インターネット" },
    talks: {
      en: "Public service endpoint, AWS public IPs",
      ja: "パブリックなサービスエンドポイント (AWS のパブリック IP)",
    },
    dns: { en: "None", ja: "不要" },
    cost: {
      en: "Internet egress on the AWS side. Not private.",
      ja: "AWS 側のインターネット向けデータ転送料。閉域ではない。",
    },
  },
  {
    way: { en: "DX public VIF", ja: "DX パブリック VIF" },
    talks: {
      en: "Public service endpoint over DX",
      ja: "DX 越しにパブリックなサービスエンドポイント",
    },
    dns: { en: "None", ja: "不要" },
    cost: {
      en: "DX port-hours + data transfer out. Private path, public addresses.",
      ja: "DX ポート時間 + データ転送。経路は閉域、アドレスはパブリック。",
    },
  },
  {
    way: {
      en: "Interface endpoint (PrivateLink) over DX or VPN",
      ja: "DX / VPN の先のインターフェイスエンドポイント (PrivateLink)",
    },
    talks: { en: "ENIs with your private IPs", ja: "自社のプライベート IP を持つ ENI" },
    dns: {
      en: "VPC Resolver inbound endpoint + forwarders, or vpce- names",
      ja: "VPC Resolver のインバウンドエンドポイント + フォワーダー、または vpce- 名",
    },
    cost: {
      en: "$0.014 per endpoint per AZ-hour + $0.01/GB (Tokyo)",
      ja: "エンドポイントの AZ 1 時間 $0.014 + $0.01/GB (東京)",
    },
  },
  {
    way: {
      en: "Gateway endpoint (S3, DynamoDB)",
      ja: "ゲートウェイエンドポイント (S3・DynamoDB)",
    },
    talks: {
      en: "Nothing: not reachable from on-prem",
      ja: "なし: オンプレからは届かない",
    },
    dns: { en: "n/a", ja: "—" },
    cost: { en: "Free, VPC-internal only", ja: "無料。VPC 内専用" },
  },
];

export function PrivateSection() {
  const { t } = useLang();
  return (
    <Section
      id="private"
      title={{
        en: "Reaching AWS services without the internet",
        ja: "インターネットを通らずに AWS サービスへ",
      }}
      lead={{
        en: "You have DX or a VPN into a VPC. Now an app on-prem wants S3, KMS or STS. What sits at the AWS end decides whether the request ever arrives, and one rule explains almost every case: from outside a VPC you can only reach an IP address that lives inside it.",
        ja: "DX か VPN で VPC までつながったとします。次にオンプレのアプリが S3・KMS・STS を使いたくなります。届くかどうかは AWS 側の終点で決まり、ほぼすべてのケースは 1 つのルールで説明できます: VPC の外からは、VPC の中にある IP アドレスにしか届きません。",
      }}
    >
      <div className="max-w-3xl space-y-3">
        <p>
          {t({
            en: "An interface endpoint (AWS PrivateLink) is one network interface per Availability Zone, each with a private IP from your subnet. A gateway endpoint for S3 or DynamoDB is different: it has no IP at all, only a line in the subnet route table. Traffic arriving from DX, VPN, peering or a transit gateway cannot leave the VPC through a gateway endpoint, so on-prem needs an interface endpoint or a public VIF.",
            ja: "インターフェイスエンドポイント (AWS PrivateLink) は AZ ごとに 1 つのネットワークインターフェイスで、それぞれがサブネットのプライベート IP を持ちます。S3 / DynamoDB のゲートウェイエンドポイントは別物で、IP を持たずサブネットのルートテーブルに 1 行あるだけ。DX・VPN・ピアリング・Transit Gateway から入ってきた通信はゲートウェイエンドポイントから出られないので、オンプレにはインターフェイスエンドポイントかパブリック VIF が必要です。",
          })}
        </p>
        <p>
          {t({
            en: "Try the lab: pick who is asking and which endpoint they aim at, guess, then see the reason.",
            ja: "ラボで試してみてください: 誰が、どのエンドポイント宛てに送るかを選び、予想してから理由を確認。",
          })}
        </p>
      </div>

      <div className="mt-6">
        <ReachLab />
      </div>

      <h3 className="mt-12 text-xl font-extrabold">
        {t({
          en: "Four ways to reach AWS APIs from on-prem",
          ja: "オンプレから AWS API へ行く 4 つの方法",
        })}
      </h3>
      <div className="mt-3">
        <DataTable
          columns={[
            { en: "Option", ja: "方法" },
            { en: "On-prem talks to", ja: "オンプレの通信先" },
            { en: "DNS work", ja: "必要な DNS 作業" },
            { en: "AWS charge, notes", ja: "AWS 料金・備考" },
          ]}
          rows={WAYS.map((w) => [t(w.way), t(w.talks), t(w.dns), t(w.cost)])}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Callout
          tone="info"
          title={{ en: "S3: same name, two answers", ja: "S3: 同じ名前に 2 つの答え" }}
        >
          {t({
            en: 'Turn on private DNS for an S3 interface endpoint and the option "private DNS only for inbound endpoint" is ticked by default (since March 2023). Queries arriving through a VPC Resolver inbound endpoint get the endpoint\'s private IPs; queries from inside the VPC get public IPs and use the free gateway endpoint. It requires a gateway endpoint in the VPC.',
            ja: "S3 インターフェイスエンドポイントでプライベート DNS を有効にすると「インバウンドエンドポイントのみプライベート DNS」が既定でオン (2023 年 3 月から)。VPC Resolver インバウンドエンドポイント経由のクエリにはエンドポイントのプライベート IP、VPC 内からのクエリにはパブリック IP が返り、無料のゲートウェイエンドポイントを使います。VPC 内にゲートウェイエンドポイントが必須です。",
          })}
        </Callout>
        <Callout
          tone="warn"
          title={{
            en: "DynamoDB: no private DNS",
            ja: "DynamoDB: プライベート DNS なし",
          }}
        >
          {t({
            en: "DynamoDB has interface endpoints since 2024-03-19, but no private DNS. Do not override dynamodb.<region>.amazonaws.com with a private hosted zone; AWS warns requests can silently fall back to public IPs. Point the SDK at the vpce- endpoint URL instead.",
            ja: "DynamoDB は 2024-03-19 からインターフェイスエンドポイントがありますが、プライベート DNS はありません。dynamodb.<region>.amazonaws.com をプライベートホストゾーンで上書きしないこと (AWS いわく、黙ってパブリック IP にフォールバックしうる)。SDK に vpce- のエンドポイント URL を指定します。",
          })}
        </Callout>
      </div>

      <h3 className="mt-12 text-xl font-extrabold">
        {t({
          en: "Interface endpoint limits",
          ja: "インターフェイスエンドポイントの上限",
        })}
      </h3>
      <dl className="panel mt-3 grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
        <Spec
          k={{ en: "Bandwidth", ja: "帯域" }}
          v={{
            en: "10 Gbps per AZ, auto-scales to 100",
            ja: "AZ あたり 10 Gbps、100 Gbps まで自動拡張",
          }}
        />
        <Spec
          k={{ en: "MTU", ja: "MTU" }}
          v={{
            en: "8,500 bytes; larger dropped, no PMTUD",
            ja: "8,500 バイト。超過は破棄、PMTUD なし",
          }}
        />
        <Spec
          k={{
            en: "Interface + GWLB endpoints per VPC",
            ja: "VPC あたりのインターフェイス + GWLB エンドポイント",
          }}
          v={{ en: "50 combined (adjustable)", ja: "合計 50 (引き上げ可)" }}
        />
        <Spec
          k={{ en: "Endpoint policy", ja: "エンドポイントポリシー" }}
          v={{ en: "20,480 characters, fixed", ja: "20,480 文字 (固定)" }}
        />
        <Spec
          k={{ en: "DynamoDB endpoint", ja: "DynamoDB エンドポイント" }}
          v={{ en: "50,000 requests/s", ja: "50,000 リクエスト/秒" }}
        />
        <Spec
          k={{ en: "Price (Tokyo)", ja: "料金 (東京)" }}
          v={{ en: "$0.014/AZ-hour + $0.01/GB", ja: "AZ 1 時間 $0.014 + $0.01/GB" }}
        />
      </dl>
      <p className="mt-3 max-w-3xl text-sm text-[var(--muted)]">
        {t({
          en: "Worked example: an S3 interface endpoint in 2 AZs in Tokyo carrying 5 TB a month from on-prem costs 2 × 730 × $0.014 = $20.44 plus 5,120 GB × $0.01 = $51.20, so $71.64 a month before DX data transfer.",
          ja: "計算例: 東京で 2 AZ に置いた S3 インターフェイスエンドポイントにオンプレから月 5 TB 流すと、2 × 730 × $0.014 = $20.44 + 5,120 GB × $0.01 = $51.20 で月 $71.64 (DX のデータ転送料は別)。",
        })}
      </p>

      <div className="mt-12 flex flex-col gap-10">
        <div>
          <h3 className="text-xl font-extrabold">
            {t({ en: "Across Regions", ja: "リージョンをまたぐ" })}
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              {t({
                en: "2024-11-26: cross-Region PrivateLink for endpoint services (NLB-based), Tokyo among the launch Regions; 14 more Regions including Osaka on 2024-12-19.",
                ja: "2024-11-26: エンドポイントサービス (NLB ベース) のクロスリージョン PrivateLink。東京はローンチ時から。2024-12-19 に大阪など 14 リージョン追加。",
              })}
            </li>
            <li>
              {t({
                en: "2025-11-19: cross-Region for AWS services: S3, IAM, ECR, KMS, ECS, Lambda, Data Firehose, Managed Service for Apache Flink, Route 53. A Tokyo DX can reach S3 in us-east-1 through a Tokyo endpoint, with no VPC in the US.",
                ja: "2025-11-19: AWS サービスもクロスリージョン対応 (S3・IAM・ECR・KMS・ECS・Lambda・Data Firehose・Managed Service for Apache Flink・Route 53)。東京の DX から東京のエンドポイント経由で us-east-1 の S3 へ。米国に VPC は不要。",
              })}
            </li>
            <li>
              {t({
                en: "Interface endpoints only, Regional DNS names only, needs the IAM permission vpce:AllowMultiRegion, and not supported in AZ apne1-az3. The provider pays $0.05 per active remote Region per hour.",
                ja: "インターフェイスエンドポイントのみ、リージョン DNS 名のみ、IAM 権限 vpce:AllowMultiRegion が必要、AZ apne1-az3 では非対応。提供側はアクティブなリモートリージョンごとに $0.05/時。",
              })}
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-extrabold">
            {t({
              en: "The other direction: AWS to on-prem",
              ja: "逆方向: AWS からオンプレへ",
            })}
          </h3>
          <ReverseStrip />
          <p className="mt-3 text-sm">
            {t({
              en: "NLB targets outside the VPC must be IPs in 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 or 100.64.0.0/10. The consumer only sees its own endpoint IPs, so overlapping CIDRs with on-prem do not matter. Since December 2024 a Lattice resource gateway with a resource configuration can point at an on-prem IP or DNS name without an NLB, and PrivateLink tunnel endpoints (2026-09-18) extend that to a whole CIDR.",
              ja: "VPC 外の NLB ターゲットは 10.0.0.0/8・172.16.0.0/12・192.168.0.0/16・100.64.0.0/10 の IP であること。利用側には自分のエンドポイント IP しか見えないので、オンプレと CIDR が重複していても問題なし。2024 年 12 月からは Lattice のリソースゲートウェイ + リソース設定で NLB なしにオンプレの IP / DNS 名を指せ、PrivateLink トンネルエンドポイント (2026-09-18) で CIDR 全体を対象にできるようになりました。",
            })}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Traps
          items={[
            {
              en: "Creating an S3 gateway endpoint and expecting on-prem to use it over DX. There is no IP to send to.",
              ja: "S3 のゲートウェイエンドポイントを作り、DX 越しにオンプレから使えると思う。送り先の IP がありません。",
            },
            {
              en: "Private DNS works in the VPC but on-prem still resolves public IPs. Forward the specific service names to a VPC Resolver inbound endpoint (see the next exit).",
              ja: "VPC 内ではプライベート DNS が効くのに、オンプレはパブリック IP を引く。特定のサービス名を VPC Resolver のインバウンドエンドポイントへ転送する (次の出口)。",
            },
            {
              en: "Forwarding all of amazonaws.com to AWS. It works, but every AWS name on-prem then depends on the inbound endpoint and its limit of 10,000 UDP queries/s per IP.",
              ja: "amazonaws.com を丸ごと AWS へ転送する。動きはするが、オンプレの全 AWS 名がインバウンドエンドポイント (IP あたり 10,000 UDP クエリ/秒) 頼みになる。",
            },
            {
              en: "Using a Lattice VPC association for on-prem clients. Use a service network endpoint.",
              ja: "オンプレ向けに Lattice の VPC 関連付けを使う。サービスネットワークエンドポイントを使うこと。",
            },
            {
              en: "A bucket policy with an aws:SourceVpce deny also blocks the console and anyone not going through that endpoint.",
              ja: "aws:SourceVpce で Deny するバケットポリシーは、コンソールやそのエンドポイントを通らない全員も締め出す。",
            },
          ]}
        />
      </div>

      <MetaphorLimit>
        {t({
          en: "An interface endpoint is not a road you can drive on to anywhere. It is a service window with its own extension number on your private network: you can walk up to it and ask for one service, but you cannot pass through it to reach other networks. Drawing it as a road would suggest PrivateLink connects networks like peering; it does not.",
          ja: "インターフェイスエンドポイントはどこへでも行ける道ではなく、社内ネットワーク上に内線番号を持つ「受付窓口」です。窓口で 1 つのサービスを頼めますが、そこを通り抜けて別のネットワークには行けません。道として描くと PrivateLink がピアリングのようにネットワーク同士をつなぐと誤解されますが、そうではありません。",
        })}
      </MetaphorLimit>

      <Sources
        doc="09-private-service-access.md"
        links={[
          {
            label: "Gateway endpoints for Amazon S3",
            url: "https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html",
          },
          {
            label: "PrivateLink quotas",
            url: "https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-limits-endpoints.html",
          },
          {
            label: "S3 interface endpoints and private DNS",
            url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/privatelink-interface-endpoints.html",
          },
          {
            label: "DynamoDB interface endpoints",
            url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/privatelink-interface-endpoints.html",
          },
          {
            label: "Cross-Region PrivateLink for AWS services",
            url: "https://docs.aws.amazon.com/vpc/latest/privatelink/aws-services-cross-region-privatelink-support.html",
          },
          {
            label: "External connectivity to VPC Lattice",
            url: "https://aws.amazon.com/blogs/networking-and-content-delivery/external-connectivity-to-amazon-vpc-lattice/",
          },
          {
            label: "AWS PrivateLink pricing",
            url: "https://aws.amazon.com/privatelink/pricing/",
          },
        ]}
      />
    </Section>
  );
}
