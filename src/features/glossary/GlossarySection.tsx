import { useId, useState } from "react";
import { useLang } from "@/i18n/useLang";
import { Section, Sources } from "@/components/ui";
import { GLOSSARY, matches } from "./data";

export function GlossarySection() {
  const { lang, t } = useLang();
  const [q, setQ] = useState("");
  const id = useId();
  const groups = GLOSSARY.map((g) => ({
    ...g,
    terms: g.terms.filter((x) => matches(x, q)),
  })).filter((g) => g.terms.length > 0);
  const total = groups.reduce((n, g) => n + g.terms.length, 0);

  return (
    <Section
      id="glossary"
      title={{ en: "Glossary", ja: "用語集" }}
      lead={{
        en: "Every term with its Japanese name in AWS docs and the thing it's most often confused with. A ✓ means the Japanese name was checked on a docs.aws.amazon.com/ja_jp page; AWS marks those pages machine-translated, and English takes precedence.",
        ja: "各用語の AWS ドキュメント上の日本語名と、最もよく混同される相手。✓ は docs.aws.amazon.com/ja_jp のページで日本語名を確認済みの印です (AWS はそれらのページを機械翻訳と明記しており、英語版が優先されます)。",
      }}
    >
      <label htmlFor={id} className="block text-sm font-semibold">
        {t({ en: "Filter", ja: "絞り込み" })}
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t({
          en: "e.g. transit, 伝達, endpoint",
          ja: "例: transit、伝達、エンドポイント",
        })}
        className="mt-1 w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2"
      />
      <p className="mt-2 text-sm text-[var(--muted)]" aria-live="polite">
        {total === 0
          ? t({
              en: "No terms match. Try an English or Japanese word, or clear the filter.",
              ja: "一致する用語がありません。英語か日本語の別の語で試すか、絞り込みを消してください。",
            })
          : t({ en: `${total} terms`, ja: `${total} 語` })}
      </p>

      <div className="mt-6 space-y-8">
        {groups.map((g) => (
          <section key={g.name.en} aria-label={t(g.name)}>
            <h3 className="text-lg font-extrabold">{t(g.name)}</h3>
            <dl className="mt-3 grid gap-2 md:grid-cols-2">
              {g.terms.map((x) => (
                <div key={x.en} className="panel p-3">
                  <dt>
                    <span className="block font-bold">{lang === "ja" ? x.ja : x.en}</span>
                    <span className="block text-sm text-[var(--muted)]">
                      {lang === "ja" ? x.en : x.ja}
                      {x.verified ? (
                        <span
                          className="ml-1 font-bold text-[var(--ok)]"
                          title={t({
                            en: "Japanese name verified in AWS docs",
                            ja: "日本語名を AWS ドキュメントで確認済み",
                          })}
                        >
                          ✓
                        </span>
                      ) : (
                        <span className="ml-1 text-xs">
                          {t({
                            en: "(Japanese name unverified)",
                            ja: "(日本語名は未確認)",
                          })}
                        </span>
                      )}
                    </span>
                  </dt>
                  <dd className="mt-1.5 text-sm">{t(x.def)}</dd>
                  {x.confused && (
                    <dd className="mt-1 text-xs text-[var(--muted)]">
                      {t({ en: "Often confused with: ", ja: "混同されやすい: " })}
                      <b>{t(x.confused)}</b>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <Sources
        doc="16-glossary.md"
        links={[
          {
            label: "Hybrid Connectivity whitepaper",
            url: "https://docs.aws.amazon.com/whitepapers/latest/hybrid-connectivity/hybrid-connectivity.html",
          },
          {
            label: "Transit Gateway concepts (Japanese)",
            url: "https://docs.aws.amazon.com/ja_jp/vpc/latest/tgw/how-transit-gateways-work.html",
          },
        ]}
      />
    </Section>
  );
}
