import { useId, useState } from "react";
import { useLang } from "@/i18n/useLang";
import { Callout, DataTable, Section, Sources } from "@/components/ui";
import type { Term } from "./data";
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
        en: "Every term with its Japanese name in AWS docs and the thing it's most often confused with. A ✓ means the Japanese name was checked on a docs.aws.amazon.com/ja_jp page (AWS marks those pages machine-translated; English takes precedence); a ? means it is common usage that AWS docs don't confirm.",
        ja: "各用語の AWS ドキュメント上の日本語名と、最もよく混同される相手。✓ は docs.aws.amazon.com/ja_jp のページで日本語名を確認済み (AWS はそれらのページを機械翻訳と明記しており、英語版が優先されます)、? は AWS ドキュメントで確認できない一般的な呼び方です。",
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
          en: "e.g. transit, 伝播, endpoint",
          ja: "例: transit、伝播、エンドポイント",
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
        {groups.map((g, gi) => (
          <section key={g.name.en} aria-label={t(g.name)}>
            <h3 className="mb-3 text-lg font-extrabold">{t(g.name)}</h3>
            {gi === 0 && GLOSSARY[0].name.en === g.name.en && (
              <div className="mb-3">
                <Callout tone="info">
                  {t({
                    en: "Direct Connect terms (VIFs, LAG, LOA-CFA, SiteLink and more) are covered in depth in ",
                    ja: "Direct Connect の用語 (VIF・LAG・LOA-CFA・SiteLink など) は、こちらで詳しく: ",
                  })}
                  <a
                    className="font-bold underline"
                    href="https://0-draft.github.io/cross-connect/#glossary"
                  >
                    Cross Connect: {t({ en: "Glossary", ja: "用語集" })}
                  </a>
                </Callout>
              </div>
            )}
            <DataTable
              columns={[
                { en: "Term", ja: "用語" },
                { en: "Japanese name", ja: "英語名" },
                { en: "What it is", ja: "意味" },
                { en: "Often confused with", ja: "混同されやすい" },
              ]}
              rows={g.terms.map((x) => [
                lang === "ja" ? x.ja : x.en,
                <OtherName key="n" term={x} />,
                t(x.def),
                x.confused ? t(x.confused) : "—",
              ])}
            />
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

/** The name in the other language, with a quiet marker for how sure it is. */
function OtherName({ term }: { term: Term }) {
  const { lang, t } = useLang();
  const verified = t({
    en: "Japanese name verified in AWS docs",
    ja: "日本語名を AWS ドキュメントで確認済み",
  });
  const unverified = t({
    en: "Japanese name not found in AWS docs; common usage",
    ja: "日本語名は AWS ドキュメントで未確認 (一般的な呼び方)",
  });
  return (
    <span className="inline-flex items-baseline gap-1">
      {lang === "ja" ? term.en : term.ja}
      <span
        className={`text-xs font-bold ${term.verified ? "text-[var(--ok)]" : "text-[var(--muted)]"}`}
        title={term.verified ? verified : unverified}
      >
        <span aria-hidden="true">{term.verified ? "✓" : "?"}</span>
        <span className="sr-only">{term.verified ? verified : unverified}</span>
      </span>
    </span>
  );
}
