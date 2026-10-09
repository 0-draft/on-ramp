import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { Callout, MetaphorLimit, Section, Sources } from "@/components/ui";
import { EncryptionStrip } from "./EncryptionStrip";
import { VIF_FACTS, type Vif } from "./model";

/** Who owns each stretch of a DX path. Colour plus a text label, never colour alone. */
const OWNERS: { who: L; what: L; color: string }[] = [
  {
    who: { en: "You", ja: "自社" },
    what: { en: "Your router, BGP config", ja: "自社ルーター・BGP 設定" },
    color: "var(--ink)",
  },
  {
    who: { en: "Carrier", ja: "通信事業者" },
    what: {
      en: "Circuit from your building to the location",
      ja: "自社拠点から DX ロケーションまでの回線",
    },
    color: "var(--r-sdwan)",
  },
  {
    who: { en: "Colocation operator", ja: "コロケーション事業者" },
    what: {
      en: "Cage and the cross connect fiber",
      ja: "ケージとクロスコネクトの光ファイバー",
    },
    color: "var(--r-edge)",
  },
  {
    who: { en: "AWS", ja: "AWS" },
    what: {
      en: "DX router, VIF, gateways, the backbone",
      ja: "DX ルーター・VIF・ゲートウェイ・バックボーン",
    },
    color: "var(--r-dx)",
  },
];

const H = (x: L) => x;

const VIFS: [Vif, L][] = [
  ["private", { en: "Private VIF", ja: "プライベート VIF" }],
  ["transit", { en: "Transit VIF", ja: "トランジット VIF" }],
  ["public", { en: "Public VIF", ja: "パブリック VIF" }],
];

/** Deep links into the sibling explainer, one per lab it already has. */
const DEEP: { hash: string; title: L; what: L }[] = [
  {
    hash: "vifs",
    title: { en: "Virtual interfaces", ja: "仮想インターフェイス" },
    what: {
      en: "Switch private, public and transit and see what each reaches",
      ja: "プライベート・パブリック・トランジットを切り替えて届く先を見る",
    },
  },
  {
    hash: "gateway",
    title: { en: "Direct Connect gateway", ja: "Direct Connect gateway" },
    what: {
      en: "VGW, TGW and Cloud WAN modes, allowed prefixes, SiteLink",
      ja: "VGW・TGW・Cloud WAN モード、許可プレフィックス、SiteLink",
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
    hash: "pricing",
    title: { en: "Pricing", ja: "料金" },
    what: {
      en: "Port-hours, data transfer out and flat-rate break-even",
      ja: "ポート時間・データ転送・定額料金の損益分岐",
    },
  },
];

function Table({ head, rows }: { head: L[]; rows: L[][] }) {
  const { t } = useLang();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-[var(--ink)] text-left">
            {head.map((h, i) => (
              <th key={i} className="px-2 py-2 font-bold">
                {t(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[var(--line)] align-top">
              {r.map((c, j) => (
                <td key={j} className={`px-2 py-2 ${j === 0 ? "font-semibold" : ""}`}>
                  {t(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
        en: "Direct Connect (DX) is a physical port on an AWS router inside a colocation building. AWS only owns the last stretch: getting from your building to that port is your job and your carrier's. In return you get a path that never touches the internet, with steady latency and cheaper data out, after weeks of ordering.",
        ja: "Direct Connect (DX) は、コロケーション施設内にある AWS ルーターの物理ポートです。AWS が持つのは最後の区間だけで、自社拠点からそのポートまでは自社と通信事業者の仕事。その代わり、インターネットを一切通らず、遅延が安定し、データ転送料も割安な経路が手に入ります。ただし調達には数週間かかります。",
      }}
    >
      <h3 className="text-xl font-extrabold">
        {t({ en: "Four owners on one path", ja: "1 本の経路に 4 者が関わる" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "The most common misunderstanding is that DX is a leased line from AWS. It is not: AWS provides the port in the location and everything behind it. When something breaks, the first question is whose stretch it is.",
          ja: "よくある誤解は「DX は AWS が提供する専用線」というもの。実際に AWS が提供するのはロケーション内のポートとその先だけです。障害時はまず「誰の区間か」を切り分けます。",
        })}
      </p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-4">
        {OWNERS.map((o, i) => (
          <li key={i} className="panel overflow-hidden">
            <div className="h-2" style={{ background: o.color }} aria-hidden="true" />
            <div className="p-3">
              <p className="text-xs font-bold text-[var(--muted)]">
                {i + 1}. {t(o.who)}
              </p>
              <p className="mt-1 font-semibold">{t(o.what)}</p>
            </div>
          </li>
        ))}
      </ol>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "Dedicated or hosted", ja: "専用接続かホスト型か" })}
      </h3>
      <div className="mt-3">
        <Table
          head={[
            H({ en: "Type", ja: "種類" }),
            H({ en: "Speeds", ja: "速度" }),
            H({ en: "VIFs", ja: "VIF" }),
            H({ en: "AWS SLA", ja: "AWS の SLA" }),
          ]}
          rows={[
            [
              { en: "Dedicated connection", ja: "専用接続 (Dedicated)" },
              {
                en: "1, 10, 100, 400 Gbps (400G not offered in Japan)",
                ja: "1・10・100・400 Gbps (400G は日本では未提供)",
              },
              {
                en: "Up to 50 private/public + 4 transit",
                ja: "プライベート/パブリック最大 50 + トランジット 4",
              },
              { en: "Covered", ja: "対象" },
            ],
            [
              { en: "Hosted connection", ja: "ホスト型接続 (Hosted connection)" },
              {
                en: "50 Mbps to 25 Gbps, sold by a partner",
                ja: "50 Mbps〜25 Gbps (パートナーが販売)",
              },
              { en: "Exactly 1", ja: "1 つだけ" },
              { en: "Not covered", ja: "対象外" },
            ],
            [
              { en: "Hosted VIF", ja: "ホスト型 VIF (Hosted VIF)" },
              {
                en: "Shares the owner's port, no own capacity",
                ja: "所有者のポートを共有 (帯域の割当なし)",
              },
              { en: "It is one VIF", ja: "VIF 1 つそのもの" },
              { en: "Not covered", ja: "対象外" },
            ],
          ]}
        />
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "Three virtual interfaces, three destinations",
          ja: "3 種類の VIF、3 つの行き先",
        })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "A virtual interface (VIF) is a VLAN plus a BGP session on the port. Which kind you create decides where the traffic can go: a private VIF reaches VPCs through a VGW or a DX gateway, a transit VIF reaches Transit Gateways or Cloud WAN through a DX gateway, and a public VIF reaches AWS public endpoints, not the internet. Their maximum MTUs differ too: 9001, 8500 and 1500.",
          ja: "仮想インターフェイス (VIF) はポート上の VLAN と BGP セッションの組です。種類で行き先が決まります。プライベート VIF は VGW か DX ゲートウェイ経由で VPC へ、トランジット VIF は DX ゲートウェイ経由で Transit Gateway や Cloud WAN へ、パブリック VIF は AWS のパブリックエンドポイントへ (インターネットではない)。最大 MTU も 9001・8500・1500 と違います。",
        })}
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-[var(--ink)] text-left">
              <th className="px-2 py-2">VIF</th>
              <th className="px-2 py-2">{t({ en: "Reaches", ja: "届く先" })}</th>
              <th className="px-2 py-2">{t({ en: "Lands on", ja: "接続先" })}</th>
              <th className="px-2 py-2">{t({ en: "Max MTU", ja: "最大 MTU" })}</th>
              <th className="px-2 py-2">
                {t({ en: "Prefixes you can send AWS", ja: "AWS へ広告できる経路数" })}
              </th>
            </tr>
          </thead>
          <tbody>
            {VIFS.map(([v, name]) => {
              const f = VIF_FACTS[v];
              return (
                <tr key={v} className="border-b border-[var(--line)] align-top">
                  <th
                    scope="row"
                    className="px-2 py-2 text-left font-bold text-[var(--r-dx)]"
                  >
                    {t(name)}
                  </th>
                  <td className="px-2 py-2">{t(f.reach)}</td>
                  <td className="px-2 py-2">{t(f.via)}</td>
                  <td className="px-2 py-2 font-mono font-semibold">
                    {Math.max(...f.mtu)}
                  </td>
                  <td className="px-2 py-2">{t(f.inbound)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "Two cables are not resiliency", ja: "ケーブル 2 本 = 冗長ではない" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "Only designs that span two DX locations survive a location failure, and only those qualify for the multi-site SLAs: 99.99% with two connections in each of two locations, 99.9% with one in each. A single connection gets 95%.",
          ja: "ロケーション障害に耐えられるのは 2 つの DX ロケーションにまたがる構成だけで、マルチサイト SLA の対象もそれだけ。2 ロケーションに 2 接続ずつで 99.99%、1 接続ずつで 99.9%。単一接続は 95% です。",
        })}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Callout
          tone="warn"
          title={{ en: "A LAG is not redundancy", ja: "LAG は冗長化ではない" }}
        >
          {t({
            en: "A link aggregation group bundles ports on one AWS device in one location. It adds capacity, and the SLA counts it as one connection.",
            ja: "LAG は 1 ロケーションの 1 台の AWS 機器上のポートを束ねるだけ。帯域は増えますが、SLA 上は 1 接続扱いです。",
          })}
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
        {t({ en: "Closed network is not encrypted", ja: "閉域 ≠ 暗号化" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "DX keeps your traffic off the internet but sends it in plaintext. If a policy says data must be encrypted in transit, add MACsec (one hop) or a Private IP VPN (end to end), or encrypt in the application with TLS.",
          ja: "DX は通信をインターネットから隔離しますが、中身は平文のまま流れます。「通信経路の暗号化」が要件なら、MACsec (1 ホップ) か Private IP VPN (端から端まで) を足すか、アプリ側で TLS を使います。",
        })}
      </p>
      <div className="mt-4">
        <EncryptionStrip />
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "In Japan, DX usually hides inside a carrier service",
          ja: "日本では DX は通信事業者のサービスの中にあることが多い",
        })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "Most Japanese enterprises don't order a port. A carrier's closed network (閉域網) owns the DX ports and hands you a hosted connection, a hosted VIF, or a managed layer 3 service. Because those are hosted, the AWS DX SLA does not apply; the carrier's does.",
          ja: "日本の多くの企業はポートを自分で発注しません。通信事業者の閉域網サービスが DX ポートを持ち、ホスト型接続・ホスト型 VIF・マネージド L3 サービスとして提供します。ホスト型なので AWS の DX SLA は適用されず、事業者の SLA が適用されます。",
        })}
      </p>
      <div className="mt-3">
        <Table
          head={[
            H({ en: "Service", ja: "サービス" }),
            H({ en: "How it uses DX", ja: "DX の使い方" }),
            H({ en: "Notes from the carrier", ja: "事業者の公表情報" }),
          ]}
          rows={[
            [
              {
                en: "NTT DOCOMO Business Flexible InterConnect (FIC)",
                ja: "NTT ドコモビジネス Flexible InterConnect (FIC)",
              },
              {
                en: "L2: hosted connection you accept. L3: FIC-Router creates the VIF",
                ja: "L2: 受け入れるホスト型接続。L3: FIC-Router が VIF を作成",
              },
              {
                en: "50 Mbps to 10 Gbps; TGW since 2021-01",
                ja: "50 Mbps〜10 Gbps、TGW 対応は 2021-01 から",
              },
            ],
            [
              {
                en: "KDDI Wide Area Virtual Switch 2",
                ja: "KDDI Wide Area Virtual Switch 2",
              },
              {
                en: "Hosted connection or hosted VIF; TGW needs a hosted connection",
                ja: "ホスト型接続かホスト型 VIF、TGW にはホスト型接続が必要",
              },
              { en: "Shortest 5 business days", ja: "最短 5 営業日" },
            ],
            [
              {
                en: "SoftBank Direct Access for AWS",
                ja: "ソフトバンク Direct Access for AWS",
              },
              {
                en: "Private VIF on SoftBank's own DX",
                ja: "ソフトバンクの DX 上のプライベート VIF",
              },
              {
                en: "10 Mbps to 2 Gbps; about 3 weeks; TGW not listed",
                ja: "10 Mbps〜2 Gbps、約 3 週間、TGW は記載なし",
              },
            ],
            [
              { en: "IIJ Smart HUB", ja: "IIJ Smart HUB" },
              {
                en: "Hosted connection on IIJ's ports",
                ja: "IIJ のポート上のホスト型接続",
              },
              {
                en: "12 access points in Japan; TGW supported",
                ja: "国内 12 アクセスポイント、TGW 対応",
              },
            ],
          ]}
        />
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "Lead time", ja: "開通までの期間" })}
      </h3>
      <div className="mt-3 max-w-3xl">
        <Table
          head={[
            H({ en: "Step", ja: "ステップ" }),
            H({ en: "Published figure", ja: "公表値" }),
          ]}
          rows={[
            [
              { en: "AWS issues the LOA-CFA", ja: "AWS が LOA-CFA を発行" },
              { en: "Up to 72 business hours", ja: "最大 72 営業時間" },
            ],
            [
              { en: "LOA-CFA valid for", ja: "LOA-CFA の有効期限" },
              {
                en: "90 days; billing starts at port-up or day 90",
                ja: "90 日。課金はポート UP か 90 日後の早い方から",
              },
            ],
            [
              { en: "Cross connect, carrier circuit", ja: "クロスコネクト・事業者回線" },
              {
                en: "Set by the colo and the carrier, not AWS",
                ja: "コロケーション事業者・通信事業者次第 (AWS ではない)",
              },
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
        <p className="mt-1 opacity-90">
          {t({
            en: "This page treats DX as one road among many. The sibling explainer draws every part of it, with its own labs.",
            ja: "このページでは DX を数ある道の 1 本として扱っています。姉妹サイトでは DX のすべてを、専用のラボ付きで図解しています。",
          })}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DEEP.map((d) => (
            <li key={d.hash}>
              <a
                href={`https://0-draft.github.io/cross-connect/#${d.hash}`}
                className="block h-full rounded-lg bg-[var(--sign-ink)] px-3 py-2 text-[var(--sign)] hover:opacity-90"
              >
                <span className="font-extrabold">{t(d.title)}</span>
                <span className="mt-0.5 block text-sm text-[var(--ink)]">
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
