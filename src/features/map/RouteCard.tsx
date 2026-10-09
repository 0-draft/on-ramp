import { useLang } from "@/i18n/useLang";
import { KIND, type Route } from "@/data/routes";
import { Shield, Spec } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";

/**
 * The stops of one route as a line with stations, like the strip map above a
 * train door. Horizontal on wide screens, vertical on phones, where it is the
 * whole map. Tapping a station jumps the packet there.
 */
export function StopStrip({
  route,
  hop,
  onHop,
}: {
  route: Route;
  hop: number;
  onHop: (i: number) => void;
}) {
  const { t } = useLang();
  return (
    <ol className="relative flex flex-col gap-3 sm:flex-row sm:gap-0">
      {route.stops.map((s, i) => {
        const passed = i <= hop;
        return (
          <li
            key={i}
            className="relative flex items-start gap-3 sm:flex-1 sm:flex-col sm:gap-2"
          >
            {i < route.stops.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-3 left-[9px] h-[calc(100%+0.75rem)] w-1.5 sm:top-[9px] sm:left-3 sm:h-1.5 sm:w-full"
                style={{
                  background: i < hop ? route.color : "var(--line)",
                }}
              />
            )}
            <button
              type="button"
              onClick={() => onHop(i)}
              aria-current={i === hop ? "step" : undefined}
              className="relative z-10 flex items-start gap-3 text-left sm:flex-col sm:gap-2"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[3px] text-[0.7rem] font-black"
                style={{
                  borderColor: passed ? route.color : "var(--line)",
                  background: i === hop ? route.color : "var(--paper)",
                  color:
                    i === hop ? "var(--on-color)" : passed ? route.color : "var(--muted)",
                }}
              >
                {i + 1}
              </span>
              <span
                className={`text-sm sm:pr-3 ${i === hop ? "font-extrabold" : "font-semibold"}`}
                style={{ color: passed ? "var(--ink)" : "var(--muted)" }}
              >
                {t(s.name)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** What the route is, what it costs you and where to read more. */
export function RouteCard({ route }: { route: Route }) {
  const { t } = useLang();
  return (
    <article
      className="panel overflow-hidden"
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
            className="ml-auto inline-flex min-h-10 items-center rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-bold text-[var(--paper)]"
          >
            {t({ en: "Take this exit", ja: "この出口へ" })}
          </a>
        </div>
        <p className="mt-4 max-w-3xl">{t(route.tagline)}</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4 sm:grid-cols-4">
          {route.specs.map((s, i) => (
            <Spec key={i} k={s.k} v={s.v} />
          ))}
        </dl>
      </div>
    </article>
  );
}

/** Step the packet along the route, one stop at a time. */
export function RouteJourney({
  route,
  hop,
  onHop,
  strip = true,
}: {
  route: Route;
  hop: number;
  onHop: (i: number) => void;
  strip?: boolean;
}) {
  return (
    <Stepper
      steps={route.stops.map((s) => s.say)}
      index={hop}
      onChange={onHop}
      color={route.color}
    >
      {strip && <StopStrip route={route} hop={hop} onHop={onHop} />}
    </Stepper>
  );
}
