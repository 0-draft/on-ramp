export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A labelled node for SVG diagrams: one rounded box, a title and an optional
 * second line, centred. Every lab draws its places with this.
 */
export function DiagramBox({
  r,
  title,
  sub,
  stroke = "var(--line)",
  fill = "var(--paper)",
  ink = "var(--ink)",
  dash,
  strokeWidth = 1.5,
  fontSize = 14,
}: {
  r: Rect;
  title: string;
  sub?: string;
  stroke?: string;
  fill?: string;
  ink?: string;
  dash?: string;
  strokeWidth?: number;
  fontSize?: number;
}) {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return (
    <g>
      <rect
        x={r.x}
        y={r.y}
        width={r.w}
        height={r.h}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
      />
      <text
        x={cx}
        y={sub ? cy - 4 : cy + fontSize * 0.35}
        textAnchor="middle"
        fontSize={fontSize}
        fill={ink}
      >
        {title}
      </text>
      {sub && (
        <text
          x={cx}
          y={cy + fontSize}
          textAnchor="middle"
          fontSize={Math.max(11, fontSize - 2)}
          fill={ink}
          opacity={0.75}
        >
          {sub}
        </text>
      )}
    </g>
  );
}
