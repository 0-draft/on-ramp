import type { ReactNode } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { Callout, DataTable, MetaphorLimit, Section, Sources } from "@/components/ui";
import { OwnerPath } from "./OwnerPath";
import { VIF_FACTS, type Vif } from "./model";

const CC = "https://0-draft.github.io/cross-connect/";

const VIFS: [Vif, L][] = [
  ["private", { en: "Private VIF", ja: "プライベート VIF" }],
  ["transit", { en: "Transit VIF", ja: "トランジット VIF" }],
  ["public", { en: "Public VIF", ja: "パブリック VIF" }],
];

/** Deep links into the sibling explainer, one per part it already covers in depth. */
const DEEP: { hash: string; title: L; what: L }[] = [
  {
    hash: "connections",
    title: { en: "Connections", ja: "接続" },
    what: {
      en: "Dedicated vs hosted, speeds, and ordering with the LOA-CFA step by step",
      ja: "専用接続とホスト接続、速度、LOA-CFA を使った発注の流れ",
    },
  },
  {
    hash: "vifs",
    title: { en: "Virtual interfaces", ja: "仮想インターフェイス" },
    what: {
      en: "Switch private, public and transit; MTU and route limits per type",
      ja: "プライベート・パブリック・トランジットを切り替え、種類ごとの MTU と経路数上限",
    },
  },
  {
    hash: "gateway",
    title: { en: "Direct Connect gateway", ja: "Direct Connect ゲートウェイ" },
    what: {
      en: "VGW, TGW and Cloud WAN modes, allowed prefixes, SiteLink",
      ja: "VGW・TGW・Cloud WAN モード、許可されたプレフィックス、SiteLink",
    },
  },
  {
    hash: "routing",
    title: { en: "BGP", ja: "BGP" },
    what: {
      en: "Path selection with communities, AS_PATH and VPN backup",
      ja: "コミュニティ・AS_PATH・VPN バックアップでの経路選択",
    },
  },
  {
    hash: "resiliency",
    title: { en: "Resiliency", ja: "冗長性" },
    what: {
      en: "Failure lab for the four resiliency models and their SLAs",
      ja: "4 つの冗長化モデルと SLA の障害ラボ",
    },
  },
  {
    hash: "lag-macsec",
    title: { en: "LAG and MACsec", ja: "LAG と MACsec" },
    what: {
      en: "Cut LAG members; MACsec ciphers, keys and modes",
      ja: "LAG メンバーを切る、MACsec の暗号・鍵・モード",
    },
  },
  {
    hash: "security",
    title: { en: "Security", ja: "セキュリティ" },
    what: {
      en: "Which segment MACsec, IPsec and TLS each protect",
      ja: "MACsec・IPsec・TLS がそれぞれ守る区間",
    },
  },
  {
    hash: "operations",
    title: { en: "Operations", ja: "運用" },
    what: {
      en: "Troubleshooting tree and the metrics worth an alarm",
      ja: "トラブルシューティングの流れとアラームを張るべきメトリクス",
    },
  },
  {
    hash: "pricing",
    title: { en: "Pricing", ja: "料金" },
    what: {
      en: "Port-hours, data transfer out and flat-rate break-even",
      ja: "ポート時間・データ転送・定額料金の損益分岐",
    },
  },
  {
    hash: "patterns",
    title: { en: "Patterns", ja: "設計パターン" },
    what: {
      en: "Seven questions to a DX topology, and anti-patterns",
      ja: "7 つの質問で決める DX トポロジーとアンチパターン",
    },
  },
];

function Deep({ hash, children }: { hash: string; children: ReactNode }) {
  return (
    <a className="font-bold underline" href={`${CC}#${hash}`}>
      {children}
    </a>
  );
}

export function DxSection() {
  const { t } = useLang();
  return (
    <Section
      id="dx"
      title={{
        en: "Direct Connect: a private road you assemble",
        ja: "Direct Connect: 自分で組み立てる専用道路",
      }}
      lead={{
        en: "Direct Connect (DX) is a physical port on an AWS router inside a colocation building. AWS only owns the last stretch: getting from your building to that port is your job and your carrier's. In return you get a path that never touches the internet, with steady latency and cheaper data out. A hosted connection can be up in days; a dedicated one, with a new carrier circuit, takes weeks to months.",
        ja: "Direct Connect (DX) は、コロケーション施設内にある AWS ルーターの物理ポートです。AWS が持つのは最後の区間だけで、自社拠点からそのポートまでは自社と通信事業者の仕事。その代わり、インターネットを一切通らず、遅延が安定し、データ転送料も割安な経路が手に入ります。ホスト接続なら数日、専用接続は回線工事込みで数週間〜数か月かかります。",
      }}
    >
      <h3 className="text-xl font-extrabold">
        {t({ en: "Four owners on one path", ja: "1 本の経路に 4 者が関わる" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "The most common misunderstanding is that DX is a leased line from AWS. It is not: AWS provides the port in the location and everything behind it. When something breaks, the first question is whose stretch it is. Tap a stretch, then add encryption and see which stretches it actually covers.",
          ja: "よくある誤解は「DX は AWS が提供する専用線」というもの。実際に AWS が提供するのはロケーション内のポートとその先だけです。障害時はまず「誰の区間か」を切り分けます。区間をタップし、暗号化を足すと実際にどの区間が守られるかが見えます。",
        })}{" "}
        <Deep hash="why">
          {t({ en: "Cross Connect: who owns what", ja: "Cross Connect: 誰が何を持つか" })}
        </Deep>
      </p>
      <div className="mt-4">
        <OwnerPath />
      </div>
      <p className="mt-3 max-w-3xl text-sm">
        {t({
          en: "Closed network is not encrypted (閉域 ≠ 暗号化): DX keeps traffic off the internet but carries it in plaintext. If policy requires encryption in transit, add MACsec, a Private IP VPN (end to end), or TLS in the application.",
          ja: "閉域 ≠ 暗号化: DX は通信をインターネットから隔離しますが、中身は平文のまま流れます。通信経路の暗号化が要件なら、MACsec かプライベート IP VPN (端から端まで) を足すか、アプリ側で TLS を使います。",
        })}{" "}
        <Deep hash="security">
          Cross Connect: {t({ en: "Security", ja: "セキュリティ" })}
        </Deep>
      </p>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "Dedicated or hosted", ja: "専用接続かホスト接続か" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "A dedicated connection is your own port at 1, 10, 100 or 400 Gbps (400G is not offered in Japan), with up to 51 virtual interfaces: up to 50 private or public and up to 4 transit. A hosted connection (50 Mbps to 25 Gbps) is carved out of a partner's port and carries exactly one VIF; a hosted VIF is a single VIF on someone else's connection. Only dedicated connections are covered by the AWS DX SLA.",
          ja: "専用接続は自社専用のポートで 1・10・100・400 Gbps (400G は日本では未提供)。仮想インターフェイスは最大 51 個 (プライベート/パブリック最大 50・トランジット最大 4) まで作れます。ホスト接続 (50 Mbps〜25 Gbps) はパートナーのポートから切り出したもので VIF はちょうど 1 つ。ホスト VIF は他社の接続上の VIF 1 つです。AWS の DX SLA の対象は専用接続だけです。",
        })}{" "}
        <Deep hash="connections">
          Cross Connect: {t({ en: "Connections", ja: "接続" })}
        </Deep>
      </p>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "Three virtual interfaces, three destinations",
          ja: "3 種類の VIF、3 つの行き先",
        })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "A virtual interface (VIF) is a VLAN plus a BGP session on the port. Which kind you create decides where the traffic can go.",
          ja: "仮想インターフェイス (VIF) はポート上の VLAN と BGP セッションの組です。どの種類を作るかで行き先が決まります。",
        })}
      </p>
      <ul className="mt-3 flex max-w-3xl flex-col gap-2">
        {VIFS.map(([v, name]) => {
          const f = VIF_FACTS[v];
          return (
            <li
              key={v}
              className="panel flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2"
            >
              <span className="font-extrabold">{t(name)}</span>
              <span className="min-w-0 flex-1">
                {t({
                  en: `Reaches ${t(f.reach)}, through ${t(f.via)}`,
                  ja: `${t(f.via)}経由で${t(f.reach)}へ`,
                })}
              </span>
              <span className="num text-sm font-bold whitespace-nowrap">
                MTU {f.mtu.toLocaleString("en-US")}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {t({
          en: "Route limits, SiteLink and the jumbo-frame details differ per type:",
          ja: "経路数の上限・SiteLink・ジャンボフレームの細部は種類ごとに違います:",
        })}{" "}
        <Deep hash="vifs">Cross Connect: VIF</Deep>
      </p>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "Two cables are not resiliency", ja: "ケーブル 2 本 = 冗長ではない" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "Only designs that span two DX locations survive a location failure, and only those qualify for the multi-site SLAs: 99.99% with two connections in each of two locations (four or more), 99.9% with one in each. Both multi-site SLAs also require an Enterprise Support plan. A single connection gets 95%.",
          ja: "ロケーション障害に耐えられるのは 2 つの DX ロケーションにまたがる構成だけで、マルチサイト SLA の対象もそれだけ。2 ロケーションに 2 接続ずつ (計 4 接続以上) で 99.99%、1 接続ずつで 99.9%。どちらのマルチサイト SLA もエンタープライズサポートの契約が条件です。単一接続は 95%。",
        })}{" "}
        <Deep hash="resiliency">
          Cross Connect: {t({ en: "Resiliency", ja: "冗長性" })}
        </Deep>
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Callout
          tone="warn"
          title={{ en: "A LAG is not redundancy", ja: "LAG は冗長化ではない" }}
        >
          {t({
            en: "A link aggregation group bundles ports on one AWS device in one location. It adds capacity, and the SLA counts it as one connection.",
            ja: "LAG は 1 ロケーションの 1 台の AWS 機器上のポートを束ねるだけ。帯域は増えますが、SLA 上は 1 接続扱いです。",
          })}{" "}
          <Deep hash="lag-macsec">LAG</Deep>
        </Callout>
        <Callout
          tone="bad"
          title={{
            en: "Location diversity is not everything",
            ja: "ロケーション分散でも防げない障害",
          }}
        >
          {t({
            en: "On 2021-09-02, a fault inside AWS's path into the Tokyo Region hit every Tokyo DX location at once. Keep a different kind of backup too: a VPN, or another Region.",
            ja: "2021-09-02、東京リージョンへの AWS 内部経路の障害で東京の全 DX ロケーションが同時に影響を受けました。種類の違うバックアップ (VPN や別リージョン) も用意しておくこと。",
          })}
        </Callout>
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "In Japan, DX usually hides inside a carrier service",
          ja: "日本では DX は通信事業者のサービスの中にあることが多い",
        })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "Most Japanese enterprises don't order a port. A carrier's closed network (閉域網) owns the DX ports and hands you a hosted connection, a hosted VIF, or a managed layer 3 service. Because those are hosted, the AWS DX SLA does not apply; the carrier's does. Ordering a dedicated port yourself means an LOA-CFA (the letter that authorizes the cross connect) from AWS, then the colo and the carrier, whose timelines AWS does not set.",
          ja: "日本の多くの企業はポートを自分で発注しません。通信事業者の閉域網サービスが DX ポートを持ち、ホスト接続・ホスト VIF・マネージド L3 サービスとして提供します。ホスト型なので AWS の DX SLA は適用されず、事業者の SLA が適用されます。専用ポートを自分で発注する場合は、AWS から LOA-CFA (クロスコネクトの許可書) を受け取り、コロケーション事業者と通信事業者に手配します。その期間は AWS ではなく各社次第です。",
        })}
      </p>
      <div className="mt-3">
        <DataTable
          columns={[
            { en: "Service", ja: "サービス" },
            { en: "How it uses DX", ja: "DX の使い方" },
            { en: "Notes from the carrier", ja: "事業者の公表情報" },
          ]}
          rows={[
            [
              t({
                en: "NTT DOCOMO Business Flexible InterConnect (FIC)",
                ja: "NTT ドコモビジネス Flexible InterConnect (FIC)",
              }),
              t({
                en: "L2: hosted connection you accept. L3: FIC-Router creates the VIF, you accept it",
                ja: "L2: 受け入れるホスト接続。L3: FIC-Router が VIF を作成し、自社で承認",
              }),
              t({
                en: "50 Mbps to 10 Gbps; TGW since 2021-01",
                ja: "50 Mbps〜10 Gbps、TGW 対応は 2021-01 から",
              }),
            ],
            [
              "KDDI Wide Area Virtual Switch 2",
              t({
                en: "Multi-cloud gateway: hosted connection or hosted VIF (TGW needs a hosted connection). AWS direct connection menu: best-effort or reserved bandwidth",
                ja: "マルチクラウドゲートウェイ: ホスト接続かホスト VIF (TGW にはホスト接続が必要)。AWS ダイレクト接続: ベストエフォートか帯域確保",
              }),
              t({
                en: "AWS direct connection: shortest 5 business days, Tokyo or Osaka location",
                ja: "AWS ダイレクト接続は最短 5 営業日、接続ロケーションは東京/大阪",
              }),
            ],
            [
              t({
                en: "SoftBank Direct Access for AWS",
                ja: "ソフトバンク Direct Access for AWS",
              }),
              t({
                en: "Private VIF on SoftBank's own DX",
                ja: "ソフトバンクの DX 上のプライベート VIF",
              }),
              t({
                en: "10 Mbps to 2 Gbps; about 3 weeks; TGW not listed",
                ja: "10 Mbps〜2 Gbps、約 3 週間、TGW は記載なし",
              }),
            ],
            [
              "IIJ Smart HUB",
              t({
                en: "Hosted connection on IIJ's ports, or bring your own DX",
                ja: "IIJ のポート上のホスト接続、または自社保有の DX を持ち込み",
              }),
              t({
                en: "12 access points in Japan; TGW supported",
                ja: "国内 12 アクセスポイント、TGW 対応",
              }),
            ],
          ]}
        />
      </div>

      <MetaphorLimit>
        {t({
          en: "A private road sounds safe, but nobody armoured the truck. Being off the public road says nothing about whether someone at a splice point can read the cargo. And unlike a road, you rarely build DX end to end: you rent stretches from three other companies.",
          ja: "専用道路と聞くと安全そうですが、トラックに装甲は付いていません。公道を走らないことと、途中で荷物を読まれないことは別問題です。それに道路と違い、DX を端から端まで自分で作ることはまずなく、3 社から区間を借りて組み立てます。",
        })}
      </MetaphorLimit>

      <aside className="sign mt-8 p-5 sm:p-6" aria-labelledby="dx-deeper">
        <h3 id="dx-deeper" className="text-xl font-extrabold">
          {t({ en: "Go deeper in Cross Connect", ja: "詳しくは Cross Connect へ" })}
        </h3>
        <p className="mt-1">
          {t({
            en: "This page treats DX as one road among many. The sibling explainer draws every part of it, with its own labs.",
            ja: "このページでは DX を数ある道の 1 本として扱っています。姉妹サイトでは DX のすべてを、専用のラボ付きで図解しています。",
          })}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DEEP.map((d) => (
            <li key={d.hash}>
              <a
                href={`${CC}#${d.hash}`}
                className="block h-full rounded-lg bg-[var(--paper)] px-3 py-2 text-[var(--ink)] hover:bg-[var(--paper-2)]"
              >
                <span className="font-extrabold">{t(d.title)}</span>
                <span className="mt-0.5 block text-sm text-[var(--muted)]">
                  {t(d.what)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <Sources
        doc="04-direct-connect.md"
        links={[
          {
            label: "Direct Connect quotas",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/limits.html",
          },
          {
            label: "Virtual interfaces",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/WorkingWithVirtualInterfaces.html",
          },
          {
            label: "Resiliency Toolkit",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/resiliency_toolkit.html",
          },
          {
            label: "Direct Connect SLA",
            url: "https://aws.amazon.com/directconnect/sla/",
          },
          {
            label: "MACsec",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/MACsec.html",
          },
          {
            label: "Direct Connect pricing",
            url: "https://aws.amazon.com/directconnect/pricing/",
          },
        ]}
      />
    </Section>
  );
}
