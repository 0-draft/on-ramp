import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ROUTE, type RouteId } from "@/data/routes";
import { Section, Shield, Sources } from "@/components/ui";
import { PlanLab } from "./PlanLab";

const PATTERNS: { id: string; routes: RouteId[]; name: L; what: L; upgrade: L }[] = [
  {
    id: "P1",
    routes: ["vpn"],
    name: { en: "Small office, one VPC", ja: "小規模オフィス、VPC 1 つ" },
    what: {
      en: "Site-to-Site VPN to a virtual private gateway: two tunnels in different AZs, BGP, route propagation.",
      ja: "仮想プライベートゲートウェイへの Site-to-Site VPN。AZ の異なる 2 トンネル、BGP、ルート伝播。",
    },
    upgrade: {
      en: "Upgrade when a second VPC arrives: move to a Transit Gateway.",
      ja: "2 つ目の VPC ができたら Transit Gateway へ。",
    },
  },
  {
    id: "P2",
    routes: ["dx", "vpn"],
    name: { en: "Multi-VPC, one Region", ja: "複数 VPC、1 リージョン" },
    what: {
      en: "Transit VIFs from two DX locations to a DX gateway and a Transit Gateway, with a BGP VPN on the same Transit Gateway as backup.",
      ja: "2 つの DX ロケーションからトランジット VIF を DX ゲートウェイと Transit Gateway へ。同じ Transit Gateway に BGP VPN をバックアップとして。",
    },
    upgrade: {
      en: "Prove failover with Fault Injection Service BGP disruption (since 2025-12).",
      ja: "Fault Injection Service の BGP 切断 (2025-12〜) でフェイルオーバーを検証。",
    },
  },
  {
    id: "P3",
    routes: ["dx"],
    name: { en: "Multi-Region", ja: "マルチリージョン" },
    what: {
      en: "One DX gateway to a Transit Gateway per Region with peering, or straight into Cloud WAN segments.",
      ja: "1 つの DX ゲートウェイからリージョンごとの Transit Gateway (ピアリング)、または Cloud WAN のセグメントへ直接。",
    },
    upgrade: {
      en: "Pick Cloud WAN past two or three Regions, or when segmentation should be policy.",
      ja: "リージョンが 2〜3 を超える、またはセグメントをポリシーで書きたいなら Cloud WAN。",
    },
  },
  {
    id: "P4",
    routes: ["sdwan"],
    name: { en: "SD-WAN integration", ja: "SD-WAN 連携" },
    what: {
      en: "SD-WAN head-end to Transit Gateway Connect (GRE + BGP) over a VPC or DX attachment, or Cloud WAN tunnel-less Connect.",
      ja: "SD-WAN のヘッドエンドから VPC / DX アタッチメント上の Transit Gateway Connect (GRE + BGP)、または Cloud WAN のトンネルレス Connect。",
    },
    upgrade: {
      en: "GRE is not encryption: rely on the SD-WAN fabric or MACsec.",
      ja: "GRE は暗号化ではない。SD-WAN 側か MACsec で暗号化。",
    },
  },
  {
    id: "P5",
    routes: ["dx", "private", "dns"],
    name: { en: "Closed network only (閉域)", ja: "閉域のみ" },
    what: {
      en: "DX in two metro areas, MACsec or Private IP VPN, no internet gateway, interface endpoints for every AWS API, VPC Resolver endpoints both ways.",
      ja: "2 つの都市圏の DX、MACsec かプライベート IP VPN、インターネットゲートウェイなし、全 AWS API にインターフェイスエンドポイント、双方向の VPC Resolver エンドポイント。",
    },
    upgrade: {
      en: "Prove it with VPC Encryption Controls, Flow Logs and Network Access Analyzer.",
      ja: "VPC 暗号化コントロール、フローログ、Network Access Analyzer で証明。",
    },
  },
  {
    id: "P6",
    routes: ["people"],
    name: { en: "Remote workforce", ja: "リモートワーク" },
    what: {
      en: "Client VPN for the whole network, Verified Access per app, WorkSpaces when data must stay put, Session Manager for operators.",
      ja: "ネットワーク全体なら Client VPN、アプリ単位なら Verified Access、データを出さないなら WorkSpaces、運用者には Session Manager。",
    },
    upgrade: {
      en: "Associate Client VPN with subnets in two AZs.",
      ja: "Client VPN は 2 つの AZ のサブネットに関連付け。",
    },
  },
  {
    id: "P7",
    routes: ["private"],
    name: { en: "M&A, overlapping CIDRs", ja: "M&A・CIDR 重複" },
    what: {
      en: "Expose services through PrivateLink or VPC Lattice resource configurations, then private NAT gateway, then re-IP.",
      ja: "PrivateLink か VPC Lattice のリソース設定でサービスを公開、次にプライベート NAT ゲートウェイ、最終的に再採番。",
    },
    upgrade: {
      en: "Policy-Based Routing (2026-07) steers traffic but does not translate addresses.",
      ja: "ポリシーベースルーティング (2026-07) は振り分けるだけで、アドレス変換はしない。",
    },
  },
];

export function PlanSection() {
  const { t } = useLang();
  return (
    <Section
      id="plan"
      title={{ en: "Plan your on-ramp", ja: "自分の入口を設計する" }}
      lead={{
        en: "Answer a few questions in the order AWS's own Hybrid Connectivity whitepaper asks them: who connects, how much and how steady, how many VPCs and Regions, then encryption and compliance. The answer is a route, a reference pattern, and the wrong turns that pattern is known for.",
        ja: "AWS の Hybrid Connectivity ホワイトペーパーと同じ順で答えてください: 誰がつなぐか、必要な帯域と安定性、VPC とリージョンはいくつか、最後に暗号化とコンプライアンス。答えとして経路、参照パターン、そのパターンでよくある間違いが出ます。",
      }}
    >
      <PlanLab />

      <p className="mt-4 max-w-3xl text-sm text-[var(--muted)]">
        {t({
          en: "The rules in short: people get Client VPN, Verified Access, WorkSpaces or Session Manager by what they need; existing SD-WAN extends into Transit Gateway or Cloud WAN Connect; sites that can use the internet get a VPN sized by bandwidth and VPC count; anything over 5 Gbps, latency-sensitive or closed gets Direct Connect, in two locations when it matters.",
          ja: "ルールの要約: 人は用途に応じて Client VPN・Verified Access・WorkSpaces・Session Manager。既存の SD-WAN は Transit Gateway / Cloud WAN Connect へ延長。インターネットを使える拠点は帯域と VPC 数に合わせた VPN。5 Gbps 超、遅延に敏感、閉域なら Direct Connect、重要なら 2 ロケーションで。",
        })}
      </p>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "The seven reference patterns", ja: "7 つの参照パターン" })}
      </h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PATTERNS.map((p) => (
          <li key={p.id} className="panel flex flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-[var(--ink)] px-1.5 text-xs font-black text-[var(--paper)]">
                {p.id}
              </span>
              {p.routes.map((id) => (
                <Shield
                  key={id}
                  label={ROUTE[id].shield}
                  color={ROUTE[id].color}
                  size="sm"
                />
              ))}
            </div>
            <p className="font-bold">{t(p.name)}</p>
            <p className="text-sm">{t(p.what)}</p>
            <p className="mt-auto text-sm text-[var(--muted)]">{t(p.upgrade)}</p>
          </li>
        ))}
        {/* Seven patterns leave one cell in a four-column row: point back at
            the questionnaire instead of leaving a hole. */}
        <li className="flex flex-col justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line)] p-4">
          <p className="font-bold">
            {t({ en: "Not sure which one is yours?", ja: "どれが自分に合うか迷ったら" })}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {t({
              en: "Answer the questions above and the advisor picks the pattern and the traps to avoid.",
              ja: "上の質問に答えると、パターンと避けるべき落とし穴を選んでくれます。",
            })}
          </p>
          <a href="#plan" className="mt-1 w-fit text-sm font-bold underline">
            {t({ en: "Back to the questions ↑", ja: "質問に戻る ↑" })}
          </a>
        </li>
      </ul>

      <Sources
        doc="13-design-patterns.md"
        links={[
          {
            label: "Hybrid Connectivity whitepaper",
            url: "https://docs.aws.amazon.com/whitepapers/latest/hybrid-connectivity/hybrid-connectivity.html",
          },
          {
            label: "Building a Scalable and Secure Multi-VPC AWS Network Infrastructure",
            url: "https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/welcome.html",
          },
          {
            label: "Hybrid Networking Lens",
            url: "https://docs.aws.amazon.com/wellarchitected/latest/hybrid-networking-lens/hybrid-networking-lens.html",
          },
          {
            label: "Direct Connect Resiliency Toolkit",
            url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/resiliency_toolkit.html",
          },
        ]}
      />
    </Section>
  );
}
