import { useState } from "react";
import { useLang } from "@/i18n/useLang";
import { useCompact } from "@/hooks/useNarrow";
import { ROUTE, ROUTES, type RouteId } from "@/data/routes";
import { Segmented, Shield } from "@/components/ui";
import { RoadMap } from "@/features/map/RoadMap";
import { RouteCard, RouteJourney } from "@/features/map/RouteCard";
import { StripMap } from "@/features/map/StripMap";

export function Hero() {
  const { t } = useLang();
  const compact = useCompact();
  const [sel, setSelState] = useState<RouteId>("vpn");
  const [hop, setHop] = useState(0);
  const setSel = (id: RouteId) => {
    setSelState(id);
    setHop(0);
  };
  const route = ROUTE[sel];

  return (
    <header className="pt-8 pb-6 sm:pt-12">
      <div className="lg:grid lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-center lg:gap-8">
        {/* The title is an overhead highway sign pointing at AWS. */}
        <div className="sign relative px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <svg
              viewBox="0 0 64 64"
              className="h-12 w-12 shrink-0 sm:h-16 sm:w-16"
              aria-hidden="true"
            >
              <path
                d="M14 56 C14 36 24 28 40 28 H52"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M42 16 L54 28 L42 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="min-w-0">
              <h1 className="text-5xl leading-none font-black tracking-tight sm:text-6xl">
                On-ramp
              </h1>
              <p className="mt-2 text-lg font-semibold sm:text-xl">
                {t({
                  en: "Every way from your network into AWS",
                  ja: "社内ネットワークから AWS に入る、すべての道",
                })}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-lg lg:mt-0 lg:text-base">
          {t({
            en: "Connecting an office to AWS is a stack of decisions: which road carries the bits, which gateway they land on, how AWS picks between two roads, and whether your DNS sends anyone down it at all. Here is every road on one map. Pick one and drive it.",
            ja: "社内と AWS をつなぐのは判断の積み重ねです。どの道でビットを運ぶか、どのゲートウェイに着地させるか、道が 2 本あるとき AWS はどちらを選ぶか、そもそも DNS がその道に案内するか。全部の道を 1 枚の地図にしました。1 本選んで走ってみてください。",
          })}
        </p>
      </div>

      <div className="panel mt-5 p-3 sm:p-4">
        {/* The legend is the route picker. */}
        <div className="-mx-1 overflow-x-auto px-1 pb-1 max-sm:[&>[role=radiogroup]]:flex-nowrap">
          <Segmented
            label={{ en: "Routes", ja: "経路" }}
            options={ROUTES.map((r) => ({ id: r.id, label: r.name }))}
            value={sel}
            onChange={setSel}
            color={route.color}
            renderLabel={(o, on) => {
              const r = ROUTE[o.id];
              return (
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <Shield
                    label={r.shield}
                    color={on ? "var(--ink)" : r.color}
                    size="sm"
                  />
                  {t(r.name)}
                </span>
              );
            }}
          />
        </div>

        {/* The step caption sits right above the map, so what you click and
            what it means stay on one screen. */}
        <div className="mt-3 border-b border-[var(--line)] pb-3">
          <RouteJourney route={route} hop={hop} onHop={setHop} strip={false} />
        </div>
        <div className="mt-3">
          {compact ? (
            <StripMap route={route} hop={hop} onHop={setHop} />
          ) : (
            <RoadMap selected={sel} hop={hop} onSelect={setSel} onHop={setHop} />
          )}
        </div>
        {!compact && (
          <p className="px-1 text-xs text-[var(--muted)]">
            {t({
              en: "Solid lines are roads you lay or rent; dashed lines are tunnels on top of another road. Click a road to pick it, then step the packet with Next or the numbered stops.",
              ja: "実線は自分で敷く (借りる) 道、破線は別の道の上を通るトンネル。道をクリックで選び、「次へ」か番号でパケットを 1 駅ずつ進められます。",
            })}
          </p>
        )}
      </div>

      <div className="mt-4">
        <RouteCard route={route} />
      </div>
    </header>
  );
}
