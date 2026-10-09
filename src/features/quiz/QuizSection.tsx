import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { NAV } from "@/data/nav";
import { Section, Sources } from "@/components/ui";
import { Predict } from "@/components/ui/Predict";
import { CARDS } from "./cards";

const OPTIONS: { id: string; label: L }[] = [
  { id: "myth", label: { en: "Myth", ja: "誤解" } },
  { id: "fact", label: { en: "Fact", ja: "事実" } },
];

export function QuizSection() {
  const { t } = useLang();
  return (
    <Section
      id="quiz"
      title={{ en: "Myth or fact?", ja: "誤解か、事実か" }}
      lead={{
        en: `${CARDS.length} things people say in design reviews. Commit to an answer before you read why; guessing first is what makes it stick.`,
        ja: `設計レビューでよく聞く ${CARDS.length} の発言。理由を読む前に答えを決めてください。先に予想することで記憶に残ります。`,
      }}
    >
      <ol className="grid gap-3 md:grid-cols-2">
        {CARDS.map((c, i) => {
          const exit = NAV.findIndex((n) => n.id === c.to) + 1;
          return (
            <li key={i} className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[var(--muted)]">
                {t({
                  en: `Card ${i + 1} of ${CARDS.length}`,
                  ja: `${CARDS.length} 問中 ${i + 1} 問目`,
                })}
              </span>
              <Predict
                question={c.claim}
                options={OPTIONS}
                answer={c.fact ? "fact" : "myth"}
                why={
                  <div className="text-sm">
                    <p>{t(c.why)}</p>
                    <a
                      href={`#${c.to}`}
                      className="mt-1 inline-block font-semibold underline"
                    >
                      {t({ en: `More at exit ${exit}`, ja: `出口 ${exit} で詳しく` })}
                    </a>
                  </div>
                }
              />
            </li>
          );
        })}
      </ol>
      <Sources
        doc="14-why-hybrid-is-hard.md"
        links={[
          {
            label: "Transit Gateway route evaluation order",
            url: "https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html",
          },
          {
            label: "Site-to-Site VPN quotas",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/vpn-limits.html",
          },
          {
            label: "Gateway endpoints for S3",
            url: "https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html",
          },
        ]}
      />
    </Section>
  );
}
