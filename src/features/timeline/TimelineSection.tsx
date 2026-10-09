import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { ROUTE } from "@/data/routes";
import { Section, Shield, Sources } from "@/components/ui";
import { LAUNCHES, byYear, type Family } from "./data";

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
    color: "var(--asphalt)",
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
  const [on, setOn] = useState<Set<Family>>(() => new Set(FAMILIES));
  const toggle = (f: Family) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(f)) n.delete(f);
      else n.add(f);
      return n.size === 0 ? new Set(FAMILIES) : n;
    });
  const shown = LAUNCHES.filter((l) => on.has(l.family));
  const recent = (d: string) => d >= "2025-11";

  return (
    <Section
      id="timeline"
      title={{ en: "How we got here", ja: "ここまでの歩み" }}
      lead={{
        en: "From a VPN-only VPC in 2009 to the 2025–2026 wave. If your mental model was formed before November 2025, the highlighted entries are the ones that changed the answers.",
        ja: "2009 年の VPN 専用 VPC から、2025〜2026 年の大量アップデートまで。2025 年 11 月より前の知識で止まっているなら、ハイライトされた項目が答えを変えたものです。",
      }}
    >
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t({ en: "Filter by road", ja: "道で絞り込み" })}
      >
        {FAMILIES.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={on.has(f)}
            onClick={() => toggle(f)}
            className="inline-flex items-center gap-2 rounded-xl border-2 px-2.5 py-1 text-sm font-bold transition-opacity"
            style={{
              borderColor: on.has(f) ? FAMILY[f].color : "var(--line)",
              opacity: on.has(f) ? 1 : 0.5,
            }}
          >
            <Shield label={FAMILY[f].shield} color={FAMILY[f].color} size="sm" />
            {t(FAMILY[f].name)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]" aria-live="polite">
        {t({ en: `${shown.length} launches shown`, ja: `${shown.length} 件を表示中` })}
      </p>

      <div className="mt-6 space-y-8">
        {byYear(shown).map(([year, list]) => (
          <section
            key={year}
            aria-label={year}
            className="grid gap-3 sm:grid-cols-[5rem_1fr]"
          >
            <h3 className="text-3xl font-black text-[var(--muted)] sm:sticky sm:top-16 sm:self-start">
              {year}
            </h3>
            <ol className="relative space-y-2 border-l-4 border-[var(--asphalt)] pl-4">
              {list.map((l, i) => {
                const fam = FAMILY[l.family];
                return (
                  <li
                    key={i}
                    className="panel relative p-3"
                    style={
                      recent(l.date)
                        ? { borderColor: "var(--lane)", borderWidth: 2 }
                        : undefined
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="absolute top-4 -left-[1.6rem] h-3.5 w-3.5 rounded-full border-[3px] bg-[var(--paper)]"
                      style={{ borderColor: fam.color }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Shield label={fam.shield} color={fam.color} size="sm" />
                      <span className="font-mono text-xs font-semibold text-[var(--muted)]">
                        {l.date}
                      </span>
                      {recent(l.date) && (
                        <span className="rounded bg-[var(--lane)] px-1.5 text-xs font-bold text-black">
                          {t({ en: "new", ja: "新" })}
                        </span>
                      )}
                    </div>
                    <a
                      href={l.url}
                      className="mt-1 block font-bold underline decoration-[var(--line)] underline-offset-2 hover:decoration-current"
                    >
                      {t(l.title)}
                    </a>
                    <p className="text-sm text-[var(--muted)]">{t(l.why)}</p>
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
