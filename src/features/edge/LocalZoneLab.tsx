import { useState } from "react";
import type { L } from "@/i18n/lang";
import { useLang } from "@/i18n/useLang";
import { useNarrow } from "@/hooks/useNarrow";
import { Segmented } from "@/components/ui";
import { DiagramBox } from "@/components/ui/DiagramBox";
import { C } from "./color";
import { LZ, type LzPath } from "./lz";

/** Locked behind the question above by the shared Predict wrapper. */
export function LocalZoneLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [p, setP] = useState<LzPath>("dxtgw");
  const r = LZ[p];
  const W = narrow ? 360 : 900;
  const H = narrow ? 300 : 220;
  const office = narrow ? [20, 200, 140, 60] : [30, 140, 180, 60];
  const lz = narrow ? [200, 200, 140, 60] : [380, 140, 180, 60];
  const reg = narrow ? [110, 30, 140, 60] : [690, 20, 180, 60];
  const mid = (b: number[]) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
  const [ox, oy] = mid(office);
  const [lx, ly] = mid(lz);
  const [rx, ry] = mid(reg);
  const viaRegion = `M${ox} ${oy} Q${(ox + rx) / 2} ${ry} ${rx} ${ry} Q${(rx + lx) / 2} ${ry + 40} ${lx} ${ly}`;
  const direct = `M${ox} ${oy} L${lx} ${ly}`;
  const d = r.hairpin ? viaRegion : direct;
  // The road not taken, drawn faint, so the detour (or the skip) is visible.
  const other = r.hairpin ? direct : viaRegion;
  const box = (b: number[], title: L) => (
    <DiagramBox
      r={{ x: b[0], y: b[1], w: b[2], h: b[3] }}
      title={t(title)}
      fontSize={15}
    />
  );
  return (
    <div className="panel p-4 sm:p-5">
      <Segmented
        label={{ en: "Path to the Local Zone", ja: "Local Zone への経路" }}
        options={(Object.keys(LZ) as LzPath[]).map((k) => ({
          id: k,
          label: LZ[k].label,
        }))}
        value={p}
        onChange={setP}
        color={C}
      />
      <div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="diagram mt-4 block h-auto w-full"
          role="img"
          aria-label={t(r.why)}
        >
          <path
            d={other}
            fill="none"
            stroke="var(--asphalt-2)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="4 8"
            opacity={0.6}
          />
          <path
            d={d}
            fill="none"
            stroke="var(--asphalt)"
            strokeWidth={10}
            strokeLinecap="round"
          />
          <path
            d={d}
            fill="none"
            stroke={r.hairpin ? "var(--bad)" : C}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={r.hairpin ? "10 6" : undefined}
          />
          {box(office, { en: "Your office", ja: "オフィス" })}
          {box(lz, { en: "Local Zone", ja: "Local Zone" })}
          {box(reg, { en: "Parent Region", ja: "親リージョン" })}
        </svg>
      </div>
      <div aria-live="polite">
        <p
          className="mt-2 font-bold"
          style={{ color: r.hairpin ? "var(--bad)" : "var(--ok)" }}
        >
          {r.hairpin
            ? t({
                en: "✕ Hairpins through the parent Region",
                ja: "✕ 親リージョンを迂回",
              })
            : t({ en: "✓ Straight to the Local Zone", ja: "✓ Local Zone へ直行" })}
        </p>
        <p className="mt-1 text-sm">{t(r.why)}</p>
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {t({
          en: "Direct Connect to most Local Zones also caps MTU at 1,468 bytes (not 9,001) and a single flow at about 2.5 Gbps. Los Angeles is the exception.",
          ja: "多くの Local Zone への Direct Connect は MTU が 1,468 バイト (9,001 ではない)、単一フローは約 2.5 Gbps が上限。ロサンゼルスは例外。",
        })}
      </p>
    </div>
  );
}
