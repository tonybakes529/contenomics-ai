// Inline SVG line chart — three points: 24hr → 7-day → 30-day CTR.
// No external chart library; the data is too small for one to be worth the
// bundle cost. Renders nothing when fewer than 2 points exist.

export function CtrChart({
  ctr24h,
  ctr7d,
  ctr30d,
}: {
  ctr24h: number | null;
  ctr7d: number | null;
  ctr30d: number | null;
}) {
  const raw: { x: number; y: number | null; label: string }[] = [
    { x: 0, y: ctr24h, label: "24h" },
    { x: 1, y: ctr7d, label: "7d" },
    { x: 2, y: ctr30d, label: "30d" },
  ];
  const points = raw.filter(
    (p): p is { x: number; y: number; label: string } => typeof p.y === "number",
  );
  if (points.length < 2) {
    return (
      <div className="border-border bg-muted/30 flex h-44 items-center justify-center rounded-md border">
        <p className="text-muted-foreground text-xs">
          Add at least two CTR values to see the trend.
        </p>
      </div>
    );
  }

  // Plot area
  const W = 480;
  const H = 160;
  const PAD_X = 32;
  const PAD_Y = 24;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  const ys = points.map((p) => p.y);
  const yMax = Math.max(...ys, 0) * 1.15 || 0.01;
  const yMin = 0;

  const xFor = (idx: number) =>
    PAD_X + (innerW * (raw[idx].x / 2));
  const yFor = (val: number) =>
    PAD_Y + innerH - (innerH * ((val - yMin) / (yMax - yMin)));

  const path = points
    .map((p, i) => {
      const idxInRaw = raw.findIndex((r) => r.label === p.label);
      const cmd = i === 0 ? "M" : "L";
      return `${cmd}${xFor(idxInRaw).toFixed(1)},${yFor(p.y).toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="border-border bg-card overflow-hidden rounded-md border">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-44 w-full"
        preserveAspectRatio="none"
      >
        {/* Y gridlines at 25/50/75% of yMax */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD_Y + innerH - innerH * frac;
          return (
            <g key={frac}>
              <line
                x1={PAD_X}
                x2={PAD_X + innerW}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeWidth={1}
              />
              <text
                x={PAD_X - 6}
                y={y + 3}
                fontSize={9}
                textAnchor="end"
                fill="currentColor"
                opacity={0.5}
              >
                {(yMax * frac * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2} />

        {/* Points + labels */}
        {raw.map((p, idx) => {
          if (typeof p.y !== "number") {
            return (
              <text
                key={p.label}
                x={xFor(idx)}
                y={H - 4}
                fontSize={9}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.5}
              >
                {p.label}
              </text>
            );
          }
          return (
            <g key={p.label}>
              <circle
                cx={xFor(idx)}
                cy={yFor(p.y)}
                r={4}
                fill="currentColor"
              />
              <text
                x={xFor(idx)}
                y={yFor(p.y) - 8}
                fontSize={9}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.7}
              >
                {(p.y * 100).toFixed(2)}%
              </text>
              <text
                x={xFor(idx)}
                y={H - 4}
                fontSize={9}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.5}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
