import { useLang } from "@/i18n/useLang";
import { Callout, MetaphorLimit, Section, Sources } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { CostLab } from "./CostLab";
import { PRICES_AS_OF } from "./cost";

export function CostSection() {
  const { t } = useLang();
  return (
    <Section
      id="cost"
      title={{ en: "Tolls: what each road costs per month", ja: "通行料: 道ごとの月額" }}
      lead={{
        en: "AWS charges for data leaving a Region, and the rate depends on the road: internet and VPN pay the internet rate, Direct Connect pays a much lower per-GB rate but rents a port by the hour, and a Transit Gateway adds its own toll on every GB.",
        ja: "AWS はリージョンから出ていくデータに課金し、単価は道によって違います。インターネットと VPN はインターネット単価、Direct Connect は GB 単価がずっと安い代わりにポートを時間で借り、Transit Gateway は 1 GB ごとに自分の通行料を上乗せします。",
      }}
    >
      <div className="prose-ish mb-6 max-w-3xl">
        <p>
          {t({
            en: "Slide the monthly volume and watch the bars. At small volumes, the hourly charges dominate and the internet wins. Around 2.8 TB a month, a 1 Gbps dedicated port has paid for itself through its cheaper per-GB rate ($0.041 vs $0.114). A VPN never saves money on transfer: its data is billed at the internet rate, plus connection hours.",
            ja: "月間の量を動かしてバーを見てください。量が少ないうちは時間課金が効いてインターネットが最安。月 2.8 TB あたりで、1 Gbps 専有ポートは安い GB 単価 ($0.041 対 $0.114) で元が取れます。VPN は転送料では得をしません。データはインターネット単価で課金され、そこに接続時間が加わります。",
          })}
        </p>
        <p>
          {t({
            en: "Turn on the Transit Gateway: two attachments and $0.02 per GB add about $307 to a 10 TB month. Flat-rate 10G only pays off past about 153 TB a month.",
            ja: "Transit Gateway をオンにすると、アタッチメント 2 つと 1 GB あたり $0.02 で、月 10 TB なら約 $307 増えます。10G の定額料金が得になるのは月約 153 TB を超えてから。",
          })}
        </p>
      </div>

      <CostLab />

      <p className="mt-3 text-sm text-[var(--muted)]">
        {t({
          en: `Tokyo (ap-northeast-1) list prices in USD as of ${PRICES_AS_OF}, 730 hours a month, one connection, no redundancy, tax excluded. Direct Connect rates are to Japan DX locations.`,
          ja: `東京リージョン (ap-northeast-1) の定価、USD、${PRICES_AS_OF} 時点。1 か月 730 時間、接続 1 本、冗長化なし、税別。Direct Connect は日本国内の DX ロケーション向けの単価。`,
        })}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
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
        />
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
