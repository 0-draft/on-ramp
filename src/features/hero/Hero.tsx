import { useState } from "react";
import { useLang } from "@/i18n/useLang";
import { useCompact } from "@/hooks/useNarrow";
import { ROUTE, ROUTES, type RouteId } from "@/data/routes";
import { Shield } from "@/components/ui";
import { RoadMap } from "@/features/map/RoadMap";
import { RouteCard } from "@/features/map/RouteCard";

export function Hero() {
  const { t } = useLang();
  const narrow = useCompact();
  const [sel, setSelState] = useState<RouteId>("vpn");
  const [hop, setHop] = useState(0);
  const setSel = (id: RouteId) => {
    setSelState(id);
    setHop(0);
  };

  return (
    <header className="pt-10 pb-6 sm:pt-16">
      {/* The title is an overhead highway sign pointing at AWS. */}
      <div className="sign relative max-w-3xl px-6 py-6 sm:px-9 sm:py-8">
        <div className="flex items-start gap-5">
          <svg
            viewBox="0 0 64 64"
            className="mt-1 h-14 w-14 shrink-0 sm:h-20 sm:w-20"
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
            <h1 className="text-5xl leading-none font-black tracking-tight sm:text-7xl">
              On-ramp
            </h1>
            <p className="mt-3 text-lg font-semibold sm:text-2xl">
              {t({
                en: "Every way from your network into AWS",
                ja: "社内ネットワークから AWS に入る、すべての道",
              })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
              {ROUTES.map((r) => (
                <Shield key={r.id} label={r.shield} color={r.color} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-lg">
        {t({
          en: "Connecting an office to AWS is not one decision but a stack of them: which road carries the bits, which gateway they land on, how AWS picks between two roads, and whether your DNS sends anyone down it at all. Here is every route on one map. Pick one.",
          ja: "社内と AWS をつなぐのは 1 つの判断ではなく、判断の積み重ねです。どの道でビットを運ぶか、どのゲートウェイに着地させるか、道が 2 本あるとき AWS はどちらを選ぶか、そもそも DNS がその道に案内するか。全経路を 1 枚の地図にしました。1 本選んでみてください。",
        })}
      </p>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={t({ en: "Routes", ja: "経路" })}
      >
        {ROUTES.map((r) => {
          const on = sel === r.id;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSel(r.id)}
              className="inline-flex items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 text-sm font-bold transition-colors"
              style={{
                borderColor: on ? r.color : "var(--line)",
                background: on ? "var(--paper)" : "transparent",
              }}
            >
              <Shield label={r.shield} color={r.color} size="sm" />
              {t(r.name)}
            </button>
          );
        })}
      </div>

      {!narrow && (
        <div className="panel mt-5 overflow-hidden p-2 sm:p-3">
          <RoadMap selected={sel} hop={hop} onSelect={setSel} onHop={setHop} />
          <p className="px-2 pb-1 text-xs text-[var(--muted)]">
            {t({
              en: "Solid lines are roads you lay or rent. Dashed lines are tunnels on top of another road. Click a road to pick it, then step the packet along with Next or the numbered stops.",
              ja: "実線は自分で敷く (借りる) 道、破線は別の道の上を通るトンネル。道をクリックで選び、「次へ」か番号でパケットを 1 駅ずつ進められます。",
            })}
          </p>
        </div>
      )}

      <div className="mt-5">
        <RouteCard route={ROUTE[sel]} hop={hop} onHop={setHop} />
      </div>
    </header>
  );
}
