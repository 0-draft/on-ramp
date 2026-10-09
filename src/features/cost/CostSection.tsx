import { useLang } from "@/i18n/useLang";
import { Callout, MetaphorLimit, Section, Sources } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { CostLab } from "./CostLab";
import { HOURS, P, PRICES_AS_OF, dxBreakEvenGb, flatBreakEvenGb } from "./cost";

const tb = (gb: number, digits = 0) =>
  (gb / 1024).toLocaleString("en-US", { maximumFractionDigits: digits });
// Two attachments plus $0.02/GB on a 10 TB month.
const TGW_ON_10TB = Math.round(2 * P.tgwAttachment * HOURS + 10_240 * P.tgwPerGb);

export function CostSection() {
  const { t } = useLang();
  return (
    <Section
      id="cost"
      title={{ en: "Tolls: what each road costs per month", ja: "通行料: 道ごとの月額" }}
      lead={{
        en: "AWS charges for data leaving a Region, and the rate depends on the road: Direct Connect pays a much lower per-GB rate but rents a port by the hour, and a Transit Gateway adds its own toll on every GB. Guess one comparison first, then open the calculator.",
        ja: "AWS はリージョンから出ていくデータに課金し、単価は道によって違います。Direct Connect は GB 単価がずっと安い代わりにポートを時間で借り、Transit Gateway は 1 GB ごとに独自の通行料を上乗せします。まず 1 つ予想してから計算機を開いてください。",
      }}
    >
      <Predict
        question={{
          en: "You send 10 TB a month from Tokyo to your office. Which is cheaper on the AWS bill: plain internet, or a Site-to-Site VPN on a virtual private gateway?",
          ja: "東京リージョンから社内へ月 10 TB 送ります。AWS の請求が安いのは、素のインターネットと、仮想プライベートゲートウェイの Site-to-Site VPN のどちら?",
        }}
        options={[
          { id: "internet", label: { en: "Internet", ja: "インターネット" } },
          { id: "vpn", label: { en: "VPN", ja: "VPN" } },
          { id: "same", label: { en: "Exactly the same", ja: "まったく同じ" } },
        ]}
        answer="internet"
        why={t({
          en: "VPN traffic is billed at the internet data transfer rate ($1,167.36 for 10 TB), and the VPN adds $0.048 an hour for the connection: $1,202.40. You buy a VPN for encryption and private addressing, not to save money.",
          ja: "VPN の通信はインターネットと同じデータ転送単価 (10 TB で $1,167.36) で、さらに接続料が 1 時間 $0.048 かかり $1,202.40。VPN は暗号化とプライベートアドレスのために買うもので、節約のためではありません。",
        })}
      >
        {/* The bars answer the question, so they stay locked until you guess. */}
        <CostLab />
      </Predict>

      <div className="prose-ish mt-6 max-w-3xl">
        <p>
          {t({
            en: `Slide the monthly volume and watch the bars. At small volumes, the hourly charges dominate and the internet wins. Around ${tb(dxBreakEvenGb(P.dxDedicated1g), 1)} TB a month, a 1 Gbps dedicated port has paid for itself through its cheaper per-GB rate ($${P.dxDtoJapan} vs $${P.internetTiers[0].perGb}). A VPN never saves money on transfer: its data is billed at the internet rate, plus connection hours. Options that cannot carry the volume even at a flat average rate are greyed out.`,
            ja: `月間の量を動かしてバーを見てください。量が少ないうちは時間課金が効いてインターネットが最安。月 ${tb(dxBreakEvenGb(P.dxDedicated1g), 1)} TB あたりで、1 Gbps 専用ポートは安い GB 単価 ($${P.dxDtoJapan} 対 $${P.internetTiers[0].perGb}) で元が取れます。VPN は転送料では得をしません。データはインターネット単価で課金され、そこに接続時間が加わります。平均レートでも運びきれない選択肢はグレーにしています。`,
          })}
        </p>
        <p>
          {t({
            en: `Turn on the Transit Gateway: two attachments and $${P.tgwPerGb} per GB add about $${TGW_ON_10TB} to a 10 TB month. One flat-rate 10G port only beats one pay-as-you-go 10G port past about ${tb(flatBreakEvenGb())} TB a month; a redundant port-pair compares differently.`,
            ja: `Transit Gateway をオンにすると、アタッチメント 2 つと 1 GB あたり $${P.tgwPerGb} で、月 10 TB なら約 $${TGW_ON_10TB} 増えます。10G 定額ポート 1 本が従量課金の 10G ポート 1 本より安くなるのは月約 ${tb(flatBreakEvenGb())} TB から。冗長化したポートペアでは比較が変わります。`,
          })}{" "}
          <a
            className="font-semibold underline"
            href="https://0-draft.github.io/cross-connect/#pricing"
          >
            {t({
              en: "Direct Connect pricing in depth (Cross Connect)",
              ja: "Direct Connect の料金を詳しく (Cross Connect)",
            })}
          </a>
        </p>
      </div>

      <p className="mt-3 text-sm text-[var(--muted)]">
        {t({
          en: `Tokyo (ap-northeast-1) list prices in USD as of ${PRICES_AS_OF}, 730 hours a month, 1 TB = 1,024 GB, one connection, no redundancy, tax excluded. Direct Connect rates are to Japan DX locations.`,
          ja: `東京リージョン (ap-northeast-1) の定価、USD、${PRICES_AS_OF} 時点。1 か月 730 時間、1 TB = 1,024 GB、接続 1 本、冗長化なし、税別。Direct Connect は日本国内の DX ロケーション向けの単価。`,
        })}
      </p>

      <div className="mt-6">
        <Callout
          tone="warn"
          title={{ en: "Not on this bill", ja: "この請求に含まれないもの" }}
        >
          {t({
            en: "The carrier circuit to the DX location, the colocation cross connect and any partner fees. In Japan these usually cost more than the AWS port. Data coming in to AWS is free on every path. And size a connection for peak and failover, not the monthly average: 10 TB a month is only about 31 Mbps on average.",
            ja: "DX ロケーションまでの通信事業者の回線、コロケーションのクロスコネクト、パートナー料金。日本ではこれらが AWS のポート料より高いのが普通です。AWS へ入るデータはどの経路でも無料。回線は月平均ではなくピークとフェイルオーバーで選びましょう。月 10 TB は平均すると約 31 Mbps にすぎません。",
          })}
        </Callout>
      </div>

      <MetaphorLimit>
        {t({
          en: "A real toll is paid by whoever drives through, in either direction. AWS charges only for data leaving AWS, and the bill goes to the account that sends it. A Direct Connect port is charged to the connection owner every hour whether or not anything drives on it.",
          ja: "本物の通行料はどちら向きでも通った人が払います。AWS が課金するのは AWS から出ていくデータだけで、請求先は送信したアカウント。Direct Connect のポート料は、何も通らなくても接続の所有者に毎時間かかります。",
        })}
      </MetaphorLimit>

      <Sources
        doc="12-security-and-operations.md"
        links={[
          {
            label: "AWS Direct Connect pricing",
            url: "https://aws.amazon.com/directconnect/pricing/",
          },
          {
            label: "AWS Site-to-Site VPN pricing",
            url: "https://aws.amazon.com/vpn/pricing/",
          },
          {
            label: "Direct Connect flat-rate pricing",
            url: "https://aws.amazon.com/directconnect/pricing/flat-rate/",
          },
          {
            label: "AWS Price List API",
            url: "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json",
          },
        ]}
      />
    </Section>
  );
}
