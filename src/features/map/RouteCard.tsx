import { useLang } from "@/i18n/useLang";
import { KIND, type Route } from "@/data/routes";
import { Shield, Spec } from "@/components/ui";

/** The stops of one route drawn as a line with stations, like a transit
 * strip map. Horizontal on wide screens, vertical on phones. */
export function StopStrip({ route }: { route: Route }) {
  const { t } = useLang();
  return (
    <ol className="relative flex flex-col gap-3 sm:flex-row sm:gap-0">
      {route.stops.map((s, i) => (
        <li
          key={i}
          className="relative flex items-start gap-3 sm:flex-1 sm:flex-col sm:gap-2"
        >
          {i < route.stops.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-3 left-[9px] h-[calc(100%+0.75rem)] w-1.5 sm:top-[9px] sm:left-3 sm:h-1.5 sm:w-full"
              style={{ background: route.color }}
            />
          )}
          <span
            aria-hidden="true"
            className="relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-[5px] bg-[var(--paper)]"
            style={{ borderColor: route.color }}
          />
          <span className="text-sm font-semibold sm:pr-3">{t(s)}</span>
        </li>
      ))}
    </ol>
  );
}

export function RouteCard({ route }: { route: Route }) {
  const { t } = useLang();
  return (
    <article
      className="panel overflow-hidden"
      aria-live="polite"
      style={{ borderTop: `6px solid ${route.color}` }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Shield label={route.shield} color={route.color} size="lg" />
          <div>
            <h3 className="text-2xl font-extrabold">{t(route.name)}</h3>
            <p className="text-sm text-[var(--muted)]">{t(KIND[route.kind])}</p>
          </div>
          <a
            href={`#${route.section}`}
            className="ml-auto rounded-lg px-3 py-2 text-sm font-bold text-white"
            style={{ background: route.color }}
          >
            {t({ en: "Take this exit", ja: "この出口へ" })}
          </a>
        </div>
        <p className="mt-4 max-w-3xl">{t(route.tagline)}</p>
        <div className="mt-6">
          <StopStrip route={route} />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4 sm:grid-cols-4">
          {route.specs.map((s, i) => (
            <Spec key={i} k={s.k} v={s.v} />
          ))}
        </dl>
      </div>
    </article>
  );
}
