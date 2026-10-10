import { useLang } from "@/i18n/useLang";
import { AS_OF } from "@/data/asOf";
import { ROUTES } from "@/data/routes";
import { Shield } from "@/components/ui";

const C = {
  disclaimer: {
    en: "Independent explainer, not affiliated with or endorsed by Amazon Web Services. Prices and quotas change; check the AWS documentation before you design or buy.",
    ja: "AWS とは無関係の非公式解説です。料金やクォータは変わるので、設計・購入前に必ず AWS 公式ドキュメントを確認してください。",
  },
  asOf: {
    en: `Facts verified against AWS documentation, What's New posts and the AWS Price List API as of ${AS_OF}. Prices are USD list prices.`,
    ja: `記載内容は ${AS_OF} 時点の AWS 公式ドキュメント・What's New・Price List API で確認済み。料金は USD の表示価格です。`,
  },
  notes: {
    en: "Research notes (Markdown, with sources)",
    ja: "調査ノート (Markdown・出典つき)",
  },
  more: { en: "Go deeper", ja: "さらに深く" },
};

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t-4 border-[var(--lane)] bg-[var(--sign)] py-10 text-[var(--sign-ink)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm sm:px-6">
        {/* The destination sign: every road again, each one a way back in. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <p className="text-2xl font-black">
            {t({ en: "You have arrived", ja: "到着しました" })}
          </p>
          <ul className="flex flex-wrap gap-1.5 sm:gap-2">
            {ROUTES.map((r) => (
              <li key={r.id}>
                <a
                  href={`#${r.section}`}
                  title={t(r.name)}
                  aria-label={t(r.name)}
                  className="inline-flex min-h-10 items-center"
                >
                  <Shield label={r.shield} color={r.color} size="sm" />
                </a>
              </li>
            ))}
          </ul>
          <a href="#top" className="ml-auto font-bold underline">
            {t({ en: "Back to the map ↑", ja: "地図に戻る ↑" })}
          </a>
        </div>
        <p>{t(C.asOf)}</p>
        <p>{t(C.disclaimer)}</p>
        <p className="mt-2 font-bold">{t(C.more)}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          <li>
            <a className="underline" href="https://0-draft.github.io/cross-connect/">
              Cross Connect — AWS Direct Connect
            </a>
          </li>
          <li>
            <a className="underline" href="https://0-draft.github.io/caller-identity/">
              Caller Identity — AWS credentials and SigV4
            </a>
          </li>
          <li>
            <a className="underline" href="https://0-draft.github.io/s3-atlas/">
              S3 Atlas
            </a>
          </li>
        </ul>
        <p className="mt-2 flex flex-wrap gap-4 text-xs">
          <a className="underline" href="https://github.com/0-draft/on-ramp">
            github.com/0-draft/on-ramp
          </a>
          <a
            className="underline"
            href="https://github.com/0-draft/on-ramp/tree/main/docs"
          >
            {t(C.notes)}
          </a>
          <span>MIT License</span>
        </p>
      </div>
    </footer>
  );
}
