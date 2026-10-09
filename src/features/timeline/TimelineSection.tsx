import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";
import { Callout, Section, Segmented, Shield, Sources } from "@/components/ui";
import { LAUNCHES, RECENT_FROM, byYear, filterLaunches, type Family } from "./data";

const FAMILY: Record<Family, { shield: string; color: string; name: L }> = {
  vpn: {
    shield: ROUTE.vpn.shield,
    color: ROUTE.vpn.color,
    name: { en: "VPN", ja: "VPN" },
  },
  dx: {
    shield: ROUTE.dx.shield,
    color: ROUTE.dx.color,
    name: { en: "Direct Connect & Interconnect", ja: "Direct Connect・Interconnect" },
  },
  hub: {
    shield: "HUB",
    // Hubs are not a route, so they get the neutral hub colour.
    color: "var(--hub)",
    name: { en: "Hubs & peering", ja: "ハブ・ピアリング" },
  },
  sdwan: {
    shield: ROUTE.sdwan.shield,
    color: ROUTE.sdwan.color,
    name: { en: "SD-WAN", ja: "SD-WAN" },
  },
  private: {
    shield: ROUTE.private.shield,
    color: ROUTE.private.color,
    name: { en: "Private access", ja: "閉域アクセス" },
  },
  dns: {
    shield: ROUTE.dns.shield,
    color: ROUTE.dns.color,
    name: { en: "DNS", ja: "DNS" },
  },
  people: {
    shield: ROUTE.people.shield,
    color: ROUTE.people.color,
    name: { en: "People", ja: "人の接続" },
  },
  edge: {
    shield: ROUTE.edge.shield,
    color: ROUTE.edge.color,
    name: { en: "Edge", ja: "エッジ" },
  },
};
const FAMILIES = Object.keys(FAMILY) as Family[];

export function TimelineSection() {
  const { t } = useLang();
  const [family, setFamily] = useState<Family | "all">("all");
  const [recentOnly, setRecentOnly] = useState(true);
  const shown = filterLaunches(LAUNCHES, family, recentOnly);
  const total = filterLaunches(LAUNCHES, family, false).length;
  const recent = (d: string) => d >= RECENT_FROM;

  return (
    <Section
      id="timeline"
      title={{ en: "How we got here", ja: "ここまでの歩み" }}
      lead={{
        en: "From a VPN-only VPC in 2009 to the 2025–2026 wave. If your mental model was formed before November 2025, start with the recent launches: they are the ones that changed the answers.",
        ja: "2009 年の VPN だけの VPC から、2025〜2026 年の大量アップデートまで。2025 年 11 月より前の知識で止まっているなら、まず最近のリリースから。答えを変えたのはそこです。",
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label={{ en: "Period", ja: "期間" }}
          options={[
            { id: "recent", label: { en: "Since 2025-11", ja: "2025-11 以降" } },
            { id: "all", label: { en: "All since 2009", ja: "2009 年からすべて" } },
          ]}
          value={recentOnly ? "recent" : "all"}
          onChange={(v) => setRecentOnly(v === "recent")}
        />
      </div>
      <div className="mt-3">
        <Segmented
          label={{ en: "Show only one road", ja: "道で絞り込み" }}
          options={[
            { id: "all" as const, label: { en: "All roads", ja: "すべての道" } },
            ...FAMILIES.map((f) => ({ id: f, label: FAMILY[f].name })),
          ]}
          value={family}
          onChange={setFamily}
          renderLabel={(o, on) =>
            o.id === "all" ? (
              t(o.label)
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Shield
                  label={FAMILY[o.id].shield}
                  color={FAMILY[o.id].color}
                  size="sm"
                />
                <span className={on ? "" : "text-[var(--ink)]"}>{t(o.label)}</span>
              </span>
            )
          }
        />
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]" aria-live="polite">
        <span className="num">
          {t({
            en: `${shown.length} of ${total} launches shown`,
            ja: `${total} 件中 ${shown.length} 件を表示`,
          })}
        </span>
        {recentOnly && shown.length < total && (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setRecentOnly(false)}
              className="font-semibold text-[var(--ink)] underline"
            >
              {t({ en: `Show all ${total}`, ja: `${total} 件すべて表示` })}
            </button>
          </>
        )}
      </p>

      {family === "dx" && (
        <div className="mt-4">
          <Callout tone="info">
            {t({
              en: "Direct Connect's own history, launch by launch, is in Cross Connect: ",
              ja: "Direct Connect だけの詳しい年表は Cross Connect にあります: ",
            })}
            <a
              className="font-bold underline"
              href="https://0-draft.github.io/cross-connect/#timeline"
            >
              Cross Connect: {t({ en: "Timeline", ja: "年表" })}
            </a>
          </Callout>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {shown.length === 0 && (
          <p className="text-[var(--muted)]">
            {t({
              en: "No launches for this road in the recent wave. Switch the period to see all.",
              ja: "この道の最近のリリースはありません。期間を「すべて」に切り替えてください。",
            })}
          </p>
        )}
        {byYear(shown).map(([year, list]) => (
          <section
            key={year}
            aria-label={year}
            className="grid gap-2 sm:grid-cols-[4.5rem_1fr]"
          >
            <h3 className="num text-2xl font-black text-[var(--muted)] sm:sticky sm:top-16 sm:self-start">
              {year}
            </h3>
            <ol className="panel divide-y divide-[var(--line)]">
              {list.map((l, i) => {
                const fam = FAMILY[l.family];
                return (
                  <li key={i}>
                    {/* One compact line per launch; the why opens on demand. */}
                    <details className="group">
                      {/* Wide: date, shield, title on one line. Phone: the date
                          sits small above, the title beside a fixed-width shield. */}
                      <summary className="grid cursor-pointer list-none grid-cols-[3rem_1fr_auto] items-center gap-x-3 gap-y-0.5 px-3 py-2 hover:bg-[var(--paper-2)] sm:grid-cols-[5.5rem_3rem_1fr_auto_auto]">
                        <span className="num col-span-3 text-xs font-semibold text-[var(--muted)] sm:col-span-1">
                          {l.date}
                        </span>
                        <span className="flex w-12 justify-center">
                          <Shield label={fam.shield} color={fam.color} size="sm" />
                        </span>
                        <span className="min-w-0 font-bold">{t(l.title)}</span>
                        {/* In the recent-only view every row is new, so the badge
                            would be noise; it marks new launches in "all". */}
                        {!recentOnly && recent(l.date) ? (
                          <span className="hidden rounded bg-[var(--lane)] px-1.5 text-xs font-bold text-black sm:inline">
                            {t({ en: "new", ja: "新" })}
                          </span>
                        ) : (
                          <span className="hidden sm:inline" />
                        )}
                        <span
                          aria-hidden="true"
                          className="text-[var(--muted)] transition-transform group-open:rotate-90"
                        >
                          ›
                        </span>
                      </summary>
                      <div className="px-3 pb-3 text-sm sm:pl-[10.5rem]">
                        <p className="text-[var(--muted)]">{t(l.why)}</p>
                        <a
                          href={l.url}
                          className="mt-1 inline-block font-semibold underline"
                        >
                          {t({ en: "Announcement", ja: "発表を読む" })}
                        </a>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <Sources
        doc="15-timeline.md"
        links={[
          {
            label: "What's New: networking and content delivery",
            url: "https://aws.amazon.com/about-aws/whats-new/networking_and_content_delivery/",
          },
          {
            label: "Site-to-Site VPN document history",
            url: "https://docs.aws.amazon.com/vpn/latest/s2svpn/WhatsNew.html",
          },
        ]}
      />
    </Section>
  );
}
