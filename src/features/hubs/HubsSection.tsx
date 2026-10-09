import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { DataTable, MetaphorLimit, Section, Sources, Traps } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { ScaleLab } from "./ScaleLab";
import { ApplianceLab } from "./ApplianceLab";
import { HubSketch, type HubKind } from "./HubSketch";

interface Hub {
  kind: HubKind;
  name: string;
  analogy: L;
  facts: { k: L; v: L }[];
}

const HUBS: Hub[] = [
  {
    kind: "vgw",
    name: "Virtual private gateway (VGW)",
    analogy: { en: "One house's front door", ja: "一軒家の玄関" },
    facts: [
      {
        k: { en: "Scope", ja: "範囲" },
        v: { en: "One VPC, one Region", ja: "VPC 1 つ・1 リージョン" },
      },
      {
        k: { en: "Takes", ja: "受けるもの" },
        v: {
          en: "Private VIF, Site-to-Site VPN",
          ja: "プライベート VIF・Site-to-Site VPN",
        },
      },
      {
        k: { en: "Forwards between attachments", ja: "アタッチメント間の転送" },
        v: { en: "No: VPC to on-prem only", ja: "しない (VPC ↔ オンプレのみ)" },
      },
      {
        k: { en: "Charge", ja: "料金" },
        v: { en: "None for the gateway", ja: "ゲートウェイ自体は無料" },
      },
    ],
  },
  {
    kind: "dxgw",
    name: "Direct Connect gateway (DXGW)",
    analogy: {
      en: "The office that hands out route maps but never moves a passenger",
      ja: "路線図を配るが人は運ばない案内所",
    },
    facts: [
      {
        k: { en: "Scope", ja: "範囲" },
        v: {
          en: "Global, control plane only",
          ja: "グローバル・コントロールプレーンのみ",
        },
      },
      {
        k: { en: "Takes", ja: "受けるもの" },
        v: { en: "Private and transit VIFs", ja: "プライベート VIF・トランジット VIF" },
      },
      {
        k: { en: "Forwards between attachments", ja: "アタッチメント間の転送" },
        v: {
          en: "No (except SiteLink between VIFs)",
          ja: "しない (VIF 間の SiteLink を除く)",
        },
      },
      { k: { en: "Charge", ja: "料金" }, v: { en: "None", ja: "無料" } },
    ],
  },
  {
    kind: "tgw",
    name: "Transit Gateway (TGW)",
    analogy: {
      en: "A regional train station with timetables",
      ja: "時刻表のある地域のターミナル駅",
    },
    facts: [
      {
        k: { en: "Scope", ja: "範囲" },
        v: { en: "One Region (peer for more)", ja: "1 リージョン (ピアリングで拡張)" },
      },
      {
        k: { en: "Takes", ja: "受けるもの" },
        v: {
          en: "VPCs, VPN, DX gateway, Connect, Client VPN, peering",
          ja: "VPC・VPN・DX ゲートウェイ・Connect・Client VPN・ピアリング",
        },
      },
      {
        k: { en: "Forwards between attachments", ja: "アタッチメント間の転送" },
        v: { en: "Yes, by route tables", ja: "する (ルートテーブルで制御)" },
      },
      {
        k: { en: "Charge", ja: "料金" },
        v: {
          en: "$0.07 per attachment-hour + $0.02/GB",
          ja: "アタッチメント 1 時間 $0.07 + $0.02/GB",
        },
      },
    ],
  },
  {
    kind: "cloudwan",
    name: "AWS Cloud WAN",
    analogy: {
      en: "A national rail network run from one policy",
      ja: "1 つのポリシーで動く全国鉄道網",
    },
    facts: [
      {
        k: { en: "Scope", ja: "範囲" },
        v: {
          en: "Global, one edge per Region",
          ja: "グローバル (リージョンごとにエッジ 1 つ)",
        },
      },
      {
        k: { en: "Takes", ja: "受けるもの" },
        v: {
          en: "VPCs, VPN, DX gateway, Connect, TGW peering",
          ja: "VPC・VPN・DX ゲートウェイ・Connect・TGW ピアリング",
        },
      },
      {
        k: { en: "Forwards between attachments", ja: "アタッチメント間の転送" },
        v: { en: "Yes, by segments and policy", ja: "する (セグメントとポリシーで制御)" },
      },
      {
        k: { en: "Charge", ja: "料金" },
        v: {
          en: "$0.50 per edge-hour + $0.09 per attachment-hour + $0.02/GB",
          ja: "エッジ 1 時間 $0.50 + アタッチメント 1 時間 $0.09 + $0.02/GB",
        },
      },
    ],
  },
];

export function HubsSection() {
  const { t } = useLang();
  return (
    <Section
      id="hubs"
      title={{ en: "Where the road lands: the hubs", ja: "道の着地点: ハブ" }}
      lead={{
        en: "A VPN or a DX link has to end on something inside AWS. There are four somethings with confusingly similar names. Which one you pick decides how many VPCs and Regions one connection can reach, whether VPCs can talk to each other, and what you pay per hour.",
        ja: "VPN も DX も、AWS 側のどこかで終端します。その「どこか」は 4 種類あり、名前がややこしく似ています。どれを選ぶかで、1 本の接続で届く VPC やリージョンの数、VPC 同士が通信できるか、時間あたりの料金が決まります。",
      }}
    >
      <div>
        <Predict
          question={{
            en: "VPC A and VPC B are both associated with the same Direct Connect gateway. Can A send packets to B through it?",
            ja: "VPC A と VPC B が同じ Direct Connect ゲートウェイ (DXGW) に関連付けられています。A から B へ、DXGW 経由でパケットを送れる?",
          }}
          options={[
            { id: "yes", label: { en: "Yes, it is a hub", ja: "送れる (ハブだから)" } },
            { id: "no", label: { en: "No", ja: "送れない" } },
          ]}
          answer="no"
          why={t({
            en: "A DX gateway is a set of BGP route reflectors outside the data path. It tells each side which prefixes exist, but no packet ever passes through it, so VPC-to-VPC through a DXGW is not supported. If VPCs must talk, use a Transit Gateway or Cloud WAN (or peering).",
            ja: "DX ゲートウェイはデータパスの外にある BGP ルートリフレクターの集まりです。どのプレフィックスがあるかを双方に伝えるだけで、パケットは一切通りません。DXGW 経由の VPC 間通信はサポート外。VPC 同士を通信させるなら Transit Gateway か Cloud WAN (またはピアリング) を使います。",
          })}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HUBS.map((h) => (
              <article key={h.name} className="panel p-3">
                <h3 className="font-extrabold">{h.name}</h3>
                <p className="text-sm text-[var(--muted)]">{t(h.analogy)}</p>
                <div className="mt-2">
                  <HubSketch kind={h.kind} />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4">
            <DataTable
              columns={[{ en: "Hub", ja: "ハブ" }, ...HUBS[0].facts.map((f) => f.k)]}
              rows={HUBS.map((h) => [h.name, ...h.facts.map((f) => t(f.v))])}
            />
          </div>
        </Predict>
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "What breaks as you grow", ja: "規模が増えると何が壊れるか" })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "With one VPC, a VGW is the cheapest answer. Add VPCs, Regions and sites and the per-VPC designs multiply VIFs and hit hard quotas: a DX gateway takes at most 20 VGWs, a private VIF only reaches a VGW in its own Region, and a VPC route table accepts only 100 propagated routes. Transit Gateway and Cloud WAN trade those limits for an hourly bill. Move the sliders.",
          ja: "VPC が 1 つなら VGW が最安です。VPC・リージョン・拠点が増えると、VPC ごとの構成は VIF の数が掛け算で増え、固定の上限に当たります。DX ゲートウェイの VGW は 20 個まで、プライベート VIF が直接届く VGW は同じリージョンだけ、VPC ルートテーブルの伝播ルートは 100 個まで。Transit Gateway と Cloud WAN は、その上限と引き換えに時間課金が発生します。スライダーを動かしてみてください。",
        })}
      </p>
      <div className="mt-4">
        <ScaleLab />
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "Inspection, and the half-flow that gets dropped",
          ja: "検査 VPC と、捨てられる片道フロー",
        })}
      </h3>
      <p className="mt-2 max-w-3xl">
        {t({
          en: "A common design sends all traffic through firewalls in an inspection VPC attached to the Transit Gateway. Stateful firewalls must see both directions of a flow. Without appliance mode on the inspection VPC attachment, the reply can land on the firewall in the other AZ, which drops it. Step through it, then flip the switch.",
          ja: "Transit Gateway に検査 VPC をつなぎ、全通信をファイアウォールに通す設計はよくあります。ステートフルなファイアウォールはフローの往復を両方見る必要があります。検査 VPC アタッチメントでアプライアンスモードを有効にしていないと、応答が別 AZ のファイアウォールに着いて破棄されることがあります。1 ステップずつ進めてから、スイッチを切り替えてみてください。",
        })}
      </p>
      <div className="mt-4">
        <ApplianceLab />
      </div>
      <p className="mt-3 max-w-3xl text-sm text-[var(--muted)]">
        {t({
          en: "Since 2025, AWS Network Firewall can attach to a Transit Gateway natively: AWS runs the endpoints in a service-managed VPC and turns appliance mode on for you.",
          ja: "2025 年から AWS Network Firewall は Transit Gateway にネイティブでアタッチでき、AWS 管理の VPC にエンドポイントを置いてアプライアンスモードも自動で有効にします。",
        })}
      </p>

      <div className="mt-10">
        <Traps
          items={[
            {
              en: "A VPC does not learn routes from a Transit Gateway. Route propagation into a VPC route table exists only for a VGW; with a TGW you add static routes (or a prefix list) to every subnet route table yourself.",
              ja: "VPC は Transit Gateway から経路を学びません。VPC ルートテーブルへの経路伝播は VGW にしかなく、TGW なら各サブネットのルートテーブルに静的ルート (かプレフィックスリスト) を自分で追加します。",
            },
            {
              en: "Allowed prefixes are advertised literally. On a DX gateway's Transit Gateway association, on-prem receives exactly the allowed prefixes you list (up to 200), not the VPC CIDRs. On a VGW association the same field is only a filter.",
              ja: "許可されたプレフィックスはそのまま広告されます。DX ゲートウェイの TGW 関連付けでは、オンプレが受け取るのは設定した許可されたプレフィックスそのもの (最大 200) で、VPC の CIDR ではありません。VGW 関連付けでは同じ項目がフィルターとして働くだけです。",
            },
            {
              en: "Identical CIDRs silently vanish. Attach a second VPC with the same CIDR to one Transit Gateway and its CIDR is simply not propagated: a TGW cannot route between identical CIDRs.",
              ja: "同じ CIDR は黙って消えます。同じ CIDR の VPC を 2 つ目として同じ Transit Gateway につなぐと、その CIDR は伝播されません。TGW は同一 CIDR 間をルーティングできません。",
            },
            {
              en: "Cloud WAN edges bill whether used or not: each core network edge costs $0.50 per hour in every Region you list, before any attachment or traffic.",
              ja: "Cloud WAN のエッジは使わなくても課金されます。コアネットワークエッジは指定したリージョンごとに 1 時間 $0.50。アタッチメントや通信量とは別です。",
            },
          ]}
        />
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t({
            en: "Allowed prefixes, association modes and SiteLink, with a lab:",
            ja: "許可されたプレフィックス・関連付けのモード・SiteLink はラボ付きで:",
          })}{" "}
          <a
            className="font-bold underline"
            href="https://0-draft.github.io/cross-connect/#gateway"
          >
            {t({
              en: "Cross Connect: Direct Connect gateway",
              ja: "Cross Connect: Direct Connect ゲートウェイ",
            })}
          </a>
        </p>
      </div>

      <p className="mt-6 max-w-3xl">
        {t({
          en: "Worked example (Tokyo): one Transit Gateway with 10 VPC attachments and one DX attachment costs 11 × $0.07 × 730 h = $562.10 a month. Sending 10 TB from the VPCs to on-prem adds $204.80 of TGW data processing and $419.84 of DX data transfer out.",
          ja: "計算例 (東京): VPC アタッチメント 10 個と DX アタッチメント 1 個の Transit Gateway は 11 × $0.07 × 730 時間 = 月 $562.10。VPC からオンプレへ 10 TB 送ると、TGW データ処理 $204.80 と DX データ転送 $419.84 が加わります。",
        })}
      </p>

      <MetaphorLimit>
        {t({
          en: "A Direct Connect gateway looks like an interchange on every diagram, but no car ever drives through it. It only hands out maps. Draw it as a junction and you will expect VPC-to-VPC traffic it will never carry.",
          ja: "Direct Connect ゲートウェイはどの構成図でもインターチェンジのように描かれますが、車は 1 台も通りません。配っているのは地図だけです。分岐点として描くと、決して運ばれない VPC 間通信を期待してしまいます。",
        })}
      </MetaphorLimit>

      <Sources
        doc="05-hubs.md"
        links={[
          {
            label: "How Transit Gateways work",
            url: "https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html",
          },
          {
            label: "Transit Gateway quotas",
            url: "https://docs.aws.amazon.com/vpc/latest/tgw/transit-gateway-quotas.html",
          },
          {
            label: "Direct Connect gateways",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/direct-connect-gateways-intro.html",
          },
          {
            label: "Cloud WAN quotas",
            url: "https://docs.aws.amazon.com/network-manager/latest/cloudwan/cloudwan-quotas.html",
          },
          {
            label: "Transit Gateway pricing",
            url: "https://aws.amazon.com/transit-gateway/pricing/",
          },
          {
            label: "Cloud WAN pricing",
            url: "https://aws.amazon.com/cloud-wan/pricing/",
          },
        ]}
      />
    </Section>
  );
}
