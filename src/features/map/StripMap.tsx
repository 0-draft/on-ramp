import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { zoneOf, type Route, type Zone } from "@/data/routes";

const BAND: Record<Zone, L> = {
  you: { en: "Your network", ja: "社内ネットワーク" },
  between: { en: "In between", ja: "その間" },
  aws: { en: "AWS Region", ja: "AWS リージョン" },
};

/**
 * The phone version of the map: the chosen route drawn top to bottom through
 * three bands (your network, the road between, AWS), like the line diagram
 * above a train door. Same data as the wide map, different drawing.
 */
export function StripMap({
  route,
  hop,
  onHop,
}: {
  route: Route;
  hop: number;
  onHop: (i: number) => void;
}) {
  const { t } = useLang();
  const bands: Zone[] = ["you", "between", "aws"];
  return (
    <div className="flex flex-col gap-2" role="group" aria-label={t(route.name)}>
      {bands.map((z) => {
        const stops = route.stops
          .map((s, i) => ({ s, i }))
          .filter(({ s }) => zoneOf(route, s) === z);
        return (
          <div
            key={z}
            className="rounded-xl px-3 py-2"
            style={{
              background: z === "between" ? "transparent" : "var(--paper-2)",
              border:
                z === "aws" ? "2px dashed var(--asphalt-2)" : "1px solid var(--line)",
            }}
          >
            <p className="text-xs font-bold text-[var(--muted)]">{t(BAND[z])}</p>
            <ol className="relative mt-1 flex flex-col">
              {stops.length === 0 && (
                <li className="py-1 pl-9 text-sm text-[var(--muted)]">
                  {t({ en: "(passes straight through)", ja: "(通過のみ)" })}
                </li>
              )}
              {stops.map(({ s, i }) => {
                const passed = i <= hop;
                return (
                  <li key={i} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute top-0 bottom-0 left-[11px] w-1.5"
                      style={{ background: i < hop ? route.color : "var(--line)" }}
                    />
                    <button
                      type="button"
                      onClick={() => onHop(i)}
                      aria-current={i === hop ? "step" : undefined}
                      className="relative flex min-h-11 w-full items-center gap-3 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[3px] text-xs font-black"
                        style={{
                          borderColor: passed ? route.color : "var(--line)",
                          background: i === hop ? route.color : "var(--paper)",
                          color:
                            i === hop
                              ? "var(--on-color)"
                              : passed
                                ? route.color
                                : "var(--muted)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={`text-sm ${i === hop ? "font-extrabold" : "font-semibold"}`}
                      >
                        {t(s.name)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
