import { useId, useState } from "react";
import { useLang } from "@/i18n/useLang";
import { Callout, Section, Sources } from "@/components/ui";
import type { L } from "@/i18n/lang";
import type { Term } from "./data";
import { GLOSSARY, matches } from "./data";

export function GlossarySection() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
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
      {/* The filter stays in reach while you scroll a long group. */}
      <div className="sticky top-14 z-10 -mx-1 bg-[var(--bg)] px-1 pt-1 pb-2">
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
        <p className="mt-1 text-sm text-[var(--muted)]" aria-live="polite">
          {total === 0
            ? t({
                en: "No terms match. Try an English or Japanese word, or clear the filter.",
                ja: "一致する用語がありません。英語か日本語の別の語で試すか、絞り込みを消してください。",
              })
            : t({ en: `${total} terms`, ja: `${total} 語` })}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {groups.map((g, gi) => {
          // While filtering every matching group is open; otherwise only the
          // first starts open so the section stays short.
          const isOpen = q.trim() !== "" || (open[g.name.en] ?? gi === 0);
          return (
            <details
              key={g.name.en}
              open={isOpen}
              onToggle={(e) => {
                const now = e.currentTarget.open;
                if (now !== isOpen && q.trim() === "")
                  setOpen((o) => ({ ...o, [g.name.en]: now }));
              }}
              className="panel"
            >
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-2 text-lg font-extrabold">
                {t(g.name)}
                <span className="num text-sm font-semibold text-[var(--muted)]">
                  {g.terms.length}
                </span>
              </summary>
              <div className="border-t border-[var(--line)] px-3 pt-3 pb-4 sm:px-4">
                {GLOSSARY[0].name.en === g.name.en && (
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
                <TermTable terms={g.terms} />
                <TermList terms={g.terms} />
              </div>
            </details>
          );
        })}
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
    <span>
      {lang === "ja" ? term.en : term.ja}{" "}
      <span
        className={`inline text-xs font-bold ${term.verified ? "text-[var(--ok)]" : "text-[var(--muted)]"}`}
        title={term.verified ? verified : unverified}
      >
        <span aria-hidden="true">{term.verified ? "✓" : "?"}</span>
        <span className="sr-only">{term.verified ? verified : unverified}</span>
      </span>
    </span>
  );
}

const COLS: L[] = [
  { en: "Term", ja: "用語" },
  { en: "Japanese name", ja: "英語名" },
  { en: "What it is", ja: "意味" },
  { en: "Often confused with", ja: "混同されやすい" },
];

/** Wide screens: one fixed column grid shared by every group, so columns line up. */
function TermTable({ terms }: { terms: Term[] }) {
  const { lang, t } = useLang();
  return (
    <div className="hidden overflow-x-auto sm:block">
      <table className="w-full table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[22%]" />
          <col className="w-[38%]" />
          <col className="w-[22%]" />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-[var(--line)]">
            {COLS.map((c, i) => (
              <th key={i} scope="col" className="px-2 py-2 font-bold">
                {t(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {terms.map((x) => (
            <tr key={x.en} className="border-t border-[var(--line)] align-top">
              <th scope="row" className="px-2 py-2 font-bold">
                {lang === "ja" ? x.ja : x.en}
              </th>
              <td className="px-2 py-2">
                <OtherName term={x} />
              </td>
              <td className="px-2 py-2">{t(x.def)}</td>
              <td className="px-2 py-2 text-[var(--muted)]">
                {x.confused ? t(x.confused) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Phones: two lines per term (name and other-language name, then the
 * definition); "often confused with" opens on a tap.
 */
function TermList({ terms }: { terms: Term[] }) {
  const { lang, t } = useLang();
  return (
    <dl className="flex flex-col divide-y divide-[var(--line)] sm:hidden">
      {terms.map((x) => (
        <div key={x.en} className="py-2 text-sm">
          <dt className="font-bold">
            {lang === "ja" ? x.ja : x.en}
            <span className="font-normal text-[var(--muted)]"> / </span>
            <span className="font-semibold text-[var(--muted)]">
              <OtherName term={x} />
            </span>
          </dt>
          <dd className="mt-0.5">{t(x.def)}</dd>
          {x.confused && (
            <dd>
              <details className="mt-1">
                <summary className="cursor-pointer text-xs font-semibold text-[var(--muted)]">
                  {t({ en: "Often confused with", ja: "混同されやすい" })}
                </summary>
                <p className="mt-1 text-[var(--muted)]">{t(x.confused)}</p>
              </details>
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
