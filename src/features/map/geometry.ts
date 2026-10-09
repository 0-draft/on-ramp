export type Pt = readonly [number, number];

/**
 * A smooth road through the given points: each leg is a cubic Bézier whose
 * control points sit halfway along the leg horizontally, so every road leaves
 * and enters a stop level, like lanes merging on a highway diagram.
 */
export function road(points: readonly Pt[]): string {
  if (points.length === 0) return "";
  const [x0, y0] = points[0];
  let d = `M${x0} ${y0}`;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    if (ay === by) {
      d += ` L${bx} ${by}`;
      continue;
    }
    const mx = ax + (bx - ax) / 2;
    d += ` C${mx} ${ay} ${mx} ${by} ${bx} ${by}`;
  }
  return d;
}
