import { useLang } from "@/i18n/useLang";
import { Callout, Section, Sources } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { AS_OF } from "@/data/asOf";
import { LocalZoneLab } from "./LocalZoneLab";
import { LZ } from "./lz";
import { OutpostsDiagram } from "./OutpostsDiagram";
import { TransferCalc } from "./TransferCalc";
import type { L } from "@/i18n/lang";

interface DataSvc {
  name: string;
  status: "ok" | "closed";
  what: L;
}
const DATA: DataSvc[] = [
  {
    name: "AWS DataSync",
    status: "ok",
    what: {
      en: "Agent near your storage (NFS, SMB, HDFS, S3 API) copies over internet, VPN or DX. Tokyo: $0.0125/GB (Basic).",
      ja: "ストレージの近くに置いたエージェント (NFS・SMB・HDFS・S3 API) がインターネット・VPN・DX 経由でコピー。東京 $0.0125/GB (Basic)。",
    },
  },
  {
    name: "AWS Storage Gateway",
    status: "ok",
    what: {
      en: "S3 File, Volume and Tape Gateway. FSx File Gateway closed to new customers on 2024-10-28.",
      ja: "S3 File・Volume・Tape Gateway。FSx File Gateway は 2024-10-28 に新規受付終了。",
    },
  },
  {
    name: "AWS Transfer Family",
    status: "ok",
    what: {
      en: "SFTP, FTPS, FTP and AS2 endpoints; an internal VPC endpoint is reachable over DX or VPN. Tokyo: $0.30 per protocol-hour + $0.04/GB.",
      ja: "SFTP・FTPS・FTP・AS2 のエンドポイント。VPC 内部型なら DX / VPN から届く。東京 1 プロトコル時間 $0.30 + $0.04/GB。",
    },
  },
  {
    name: "AWS Data Transfer Terminal",
    status: "ok",
    what: {
      en: "Carry your own drives to an AWS facility and upload over a fast link. Tokyo added in 2026-02.",
      ja: "自分のドライブを AWS の施設へ持ち込み、高速回線でアップロード。2026-02 に東京が追加。",
    },
  },
  {
    name: "AWS Snowball Edge",
    status: "closed",
    what: {
      en: "No new customers since 2025-11-07. AWS points new customers to DataSync, Data Transfer Terminal or partners.",
      ja: "2025-11-07 以降、新規顧客は利用不可。AWS は DataSync・Data Transfer Terminal・パートナーを案内。",
    },
  },
];

export function EdgeSection() {
  const { t } = useLang();
  return (
    <Section
      id="edge"
      title={{
        en: "AWS in your building, and moving data",
        ja: "社内に AWS を置く・データを運ぶ",
      }}
      lead={{
        en: "Sometimes the answer isn't a better road to the Region but putting AWS closer: Outposts racks in your own data center, Local Zones in your metro. And when the job is moving terabytes, a handful of services decide the endpoints and ports for you.",
        ja: "リージョンへの道を太くする代わりに、AWS を近くに置く手もあります。自社データセンターの Outposts ラック、同じ都市の Local Zones。テラバイト級の移送なら、エンドポイントやポートを決めてくれるサービスがあります。",
      }}
    >
      <h3 className="text-xl font-extrabold">
        {t({
          en: "Outposts: two links, often confused",
          ja: "Outposts: 混同されがちな 2 本のリンク",
        })}
      </h3>
      <p className="mt-2 mb-4 max-w-3xl">
        {t({
          en: "An Outpost is an extension of a VPC in its home Region. It talks to your LAN through a local gateway and to the Region through a service link, an AWS-managed encrypted VPN that needs a clean 1,500-byte MTU and AWS requires redundant connectivity of at least 500 Mbps per compute rack with at most 175 ms round-trip latency.",
          ja: "Outpost はホームリージョンの VPC の延長です。社内 LAN とはローカルゲートウェイで、リージョンとはサービスリンク (AWS 管理の暗号化 VPN) でつながります。サービスリンクには MTU 1,500 がそのまま通る経路と、コンピュートラックごとに 500 Mbps 以上の冗長化された接続 (往復遅延 175 ms 以下) が必要です (AWS の要件)。",
        })}
      </p>
      <OutpostsDiagram />

      <h3 className="mt-10 text-xl font-extrabold">
        {t({
          en: "Local Zones: does your path go straight there?",
          ja: "Local Zones: その経路は直行する?",
        })}
      </h3>
      <p className="mt-2 mb-4 max-w-3xl">
        {t({
          en: "A Local Zone is a piece of a parent Region in your metro. Whether you actually get the low latency depends on which hub your path lands on.",
          ja: "Local Zone は親リージョンの一部を近くの都市に置いたもの。実際に低遅延になるかは、経路がどのハブに着地するかで決まります。",
        })}
      </p>
      {/* The lab sits locked under the question so it can't spoil it. */}
      <div className="mt-4">
        <Predict
          question={{
            en: "Office → Direct Connect → Transit Gateway → a Local Zone subnet. Does it go straight there?",
            ja: "オフィス → Direct Connect → Transit Gateway → Local Zone のサブネット。直行する?",
          }}
          options={[
            { id: "yes", label: { en: "Yes, straight there", ja: "はい、直行" } },
            {
              id: "no",
              label: { en: "No, via the parent Region", ja: "いいえ、親リージョン経由" },
            },
          ]}
          answer="no"
          why={<p className="text-sm">{t(LZ.dxtgw.why)}</p>}
        >
          <LocalZoneLab />
        </Predict>
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "AWS Interconnect (2026)", ja: "AWS Interconnect (2026)" })}
      </h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="panel p-4" style={{ borderTop: "6px solid var(--layer-3)" }}>
          <p className="font-bold">AWS Interconnect – last mile</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              {t({
                en: "GA 2026-04-13 with Lumen; AT&T in gated preview from 2026-06-30",
                ja: "2026-04-13 に Lumen で GA。AT&T は 2026-06-30 から限定プレビュー",
              })}
            </li>
            <li>
              {t({
                en: "1–100 Gbps, MACsec on by default, BGP/VLAN/ASN pre-provisioned",
                ja: "1〜100 Gbps、MACsec がデフォルトで有効、BGP・VLAN・ASN は自動設定",
              })}
            </li>
            <li>
              {t({
                en: "Single hourly fee by bandwidth, no per-GB charge",
                ja: "帯域ごとの時間料金のみ、GB 課金なし",
              })}
            </li>
            <li>
              <b>
                {t({
                  en: `US only; not available in Japan as of ${AS_OF}`,
                  ja: `米国のみ。${AS_OF} 時点で日本では利用不可`,
                })}
              </b>
            </li>
          </ul>
        </div>
        <div className="panel p-4" style={{ borderTop: "6px solid var(--layer-2)" }}>
          <p className="font-bold">AWS Interconnect – multicloud</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              {t({
                en: "GA 2026-04-14 with Google Cloud; OCI GA 2026-07-29 (us-east-1); Azure preview 2026-08",
                ja: "2026-04-14 に Google Cloud で GA。OCI は 2026-07-29 に GA (us-east-1)、Azure は 2026-08 にプレビュー",
              })}
            </li>
            <li>
              {t({
                en: "Private link to another cloud, built on Direct Connect gateways",
                ja: "Direct Connect ゲートウェイを土台にした他クラウドとの閉域接続",
              })}
            </li>
            <li>
              {t({
                en: "Free tier: one 500 Mbps local interconnect per Region per cloud",
                ja: "無料枠: リージョン・クラウドごとに 500 Mbps のローカル接続を 1 本",
              })}
            </li>
            <li>
              <b>
                {t({
                  en: "No Tokyo (ap-northeast-1) pairing listed",
                  ja: "東京 (ap-northeast-1) のペアリングは未掲載",
                })}
              </b>
            </li>
          </ul>
        </div>
      </div>

      <h3 className="mt-10 text-xl font-extrabold">
        {t({ en: "Moving bulk data", ja: "大量データを運ぶ" })}
      </h3>
      <ul className="mt-4 grid gap-2">
        {DATA.map((d) => (
          <li key={d.name} className="panel flex flex-wrap items-start gap-3 p-3">
            <span
              className="mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-black text-[var(--on-color)]"
              style={{ background: d.status === "ok" ? "var(--ok)" : "var(--bad)" }}
            >
              {d.status === "ok"
                ? t({ en: "✓ available", ja: "✓ 利用可" })
                : t({ en: "✕ no new customers", ja: "✕ 新規不可" })}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{d.name}</span>
              <span className="block text-sm text-[var(--muted)]">{t(d.what)}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <TransferCalc />
      </div>
      <div className="mt-4">
        <Callout
          tone="warn"
          title={{
            en: "Older diagrams still show Snowball",
            ja: "古い構成図には Snowball が残っている",
          }}
        >
          {t({
            en: "New AWS accounts cannot order Snowball Edge. For a new migration plan, size DataSync over DX or VPN, or book a Data Transfer Terminal.",
            ja: "新しい AWS アカウントは Snowball Edge を注文できません。新規の移行計画では DX / VPN 上の DataSync か、Data Transfer Terminal を検討してください。",
          })}
        </Callout>
      </div>

      <Sources
        doc="11-edge-and-data-paths.md"
        links={[
          {
            label: "How Outposts works",
            url: "https://docs.aws.amazon.com/outposts/latest/userguide/how-outposts-works.html",
          },
          {
            label: "Local Zones with Direct Connect",
            url: "https://docs.aws.amazon.com/local-zones/latest/ug/local-zones-connectivity-direct-connect.html",
          },
          {
            label: "Snowball Edge availability change",
            url: "https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html",
          },
          {
            label: "AWS Interconnect Region availability",
            url: "https://docs.aws.amazon.com/interconnect/latest/userguide/region-availability.html",
          },
        ]}
      />
    </Section>
  );
}
