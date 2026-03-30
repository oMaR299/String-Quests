import { useState, useMemo, useId, useCallback } from 'react';
import { motion } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
//  Shared helpers
// ═══════════════════════════════════════════════════════════════

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

/** Rate-based color: green >90, amber 75-90, red <75 */
function rateColor(v: number): string {
  if (v >= 90) return '#10b981';   // emerald-500
  if (v >= 75) return '#f59e0b';   // amber-500
  return '#f43f5e';                // rose-500
}

/** Build a smooth SVG path through points using Catmull-Rom-to-Bezier conversion */
function smoothPath(pts: [number, number][], closed = false): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${pts[0][0]},${pts[0][1]} L${pts[1][0]},${pts[1][1]}`;

  const d: string[] = [`M${pts[0][0]},${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`);
  }
  return d.join(' ');
}

/** Nicely round an axis value */
function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) {
    nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  } else {
    nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  }
  return nice * Math.pow(10, exp);
}

function niceScale(min: number, max: number, ticks: number): number[] {
  if (max === min) { max = min + 1; }
  const range = niceNum(max - min, false);
  const step = niceNum(range / (ticks - 1), true);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const vals: number[] = [];
  for (let v = lo; v <= hi + step * 0.01; v += step) vals.push(Math.round(v * 1e6) / 1e6);
  return vals;
}

const FONT = "'Cairo', sans-serif";

// ═══════════════════════════════════════════════════════════════
//  1. Sparkline
// ═══════════════════════════════════════════════════════════════

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, color = '#10b981', width = 80, height = 28, className = '' }: SparklineProps) {
  const uid = useId();
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const range = max - min || 1;
  const pad = 1;

  const pts: [number, number][] = data.map((v, i) => [
    pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2),
    pad + (1 - (v - min) / range) * (height - pad * 2),
  ]);

  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1][0]},${height} L${pts[0][0]},${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`inline-block ${className}`} style={{ width, height }}>
      <defs>
        <linearGradient id={`spark-g-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-g-${uid})`} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  2. AreaLineChart
// ═══════════════════════════════════════════════════════════════

interface AreaLineChartDatum {
  label: string;
  value: number;
  meta?: string;
}

interface AreaLineChartProps {
  data: AreaLineChartDatum[];
  height?: number;
  color?: string;
  yMin?: number;
  yMax?: number;
  showDots?: boolean;
  showGrid?: boolean;
  onHover?: (index: number | null) => void;
}

export function AreaLineChart({
  data,
  height = 220,
  color = '#8b5cf6',
  yMin: forcedMin,
  yMax: forcedMax,
  showDots = true,
  showGrid = true,
  onHover,
}: AreaLineChartProps) {
  const uid = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const vWidth = 500;
  const vHeight = height;
  const margin = { top: 16, right: 16, bottom: 32, left: 44 };
  const cw = vWidth - margin.left - margin.right;
  const ch = vHeight - margin.top - margin.bottom;

  const vals = data.map(d => d.value);
  const dataMin = forcedMin ?? Math.min(...vals);
  const dataMax = forcedMax ?? Math.max(...vals);
  const ticks = niceScale(dataMin, dataMax, 4);
  const scaleMin = ticks[0];
  const scaleMax = ticks[ticks.length - 1];
  const rangeY = scaleMax - scaleMin || 1;

  const pts: [number, number][] = data.map((d, i) => [
    margin.left + (i / Math.max(data.length - 1, 1)) * cw,
    margin.top + (1 - (d.value - scaleMin) / rangeY) * ch,
  ]);

  const line = smoothPath(pts);
  const area = pts.length
    ? `${line} L${pts[pts.length - 1][0]},${margin.top + ch} L${pts[0][0]},${margin.top + ch} Z`
    : '';

  // x-axis label skip
  const labelSkip = Math.ceil(data.length / 10);

  const handleHover = useCallback(
    (i: number | null) => { setHovered(i); onHover?.(i); },
    [onHover],
  );

  return (
    <svg viewBox={`0 0 ${vWidth} ${vHeight}`} className="w-full" style={{ fontFamily: FONT }}>
      <defs>
        <linearGradient id={`alc-g-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {showGrid && ticks.map(t => {
        const y = margin.top + (1 - (t - scaleMin) / rangeY) * ch;
        return (
          <g key={t}>
            <line x1={margin.left} y1={y} x2={margin.left + cw} y2={y} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="4 3" />
            <text x={margin.left - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize={10}>{t}</text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={area} fill={`url(#alc-g-${uid})`} />

      {/* Line */}
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Hover crosshair */}
      {hovered !== null && pts[hovered] && (
        <line x1={pts[hovered][0]} y1={margin.top} x2={pts[hovered][0]} y2={margin.top + ch} stroke={color} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
      )}

      {/* Dots */}
      {showDots && pts.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={hovered === i ? 5 : 3}
          fill={hovered === i ? '#fff' : color}
          stroke={color}
          strokeWidth={hovered === i ? 2.5 : 1.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + i * 0.06, duration: 0.3 }}
          style={{ cursor: 'pointer' }}
        />
      ))}

      {/* Hit areas */}
      {pts.map(([x], i) => (
        <rect
          key={`hit-${i}`}
          x={x - cw / data.length / 2}
          y={margin.top}
          width={cw / data.length}
          height={ch}
          fill="transparent"
          onMouseEnter={() => handleHover(i)}
          onMouseLeave={() => handleHover(null)}
        />
      ))}

      {/* X labels */}
      {data.map((d, i) => {
        if (i % labelSkip !== 0) return null;
        return (
          <text key={i} x={pts[i][0]} y={margin.top + ch + 18} textAnchor="middle" fill="#94a3b8" fontSize={10}>{d.label}</text>
        );
      })}

      {/* Tooltip */}
      {hovered !== null && pts[hovered] && (
        <foreignObject
          x={clamp(pts[hovered][0] - 60, 0, vWidth - 120)}
          y={pts[hovered][1] - 44}
          width={120}
          height={36}
        >
          <div style={{ background: '#0f172a', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 8, textAlign: 'center', fontFamily: FONT, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
            {data[hovered].label}: {data[hovered].value}
            {data[hovered].meta && <span style={{ fontWeight: 400, opacity: 0.7 }}> {data[hovered].meta}</span>}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  3. HorizontalBarChart
// ═══════════════════════════════════════════════════════════════

interface HBarDatum {
  label: string;
  value: number;
  color?: string;
  meta?: string;
}

interface HorizontalBarChartProps {
  data: HBarDatum[];
  maxValue?: number;
  height?: number;
  barHeight?: number;
  showValues?: boolean;
  valueSuffix?: string;
  animate?: boolean;
}

export function HorizontalBarChart({
  data,
  maxValue: forcedMax,
  barHeight = 22,
  showValues = true,
  valueSuffix = '%',
  animate = true,
}: HorizontalBarChartProps) {
  const uid = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const max = forcedMax ?? Math.max(...data.map(d => d.value), 1);
  const rowH = barHeight + 14;
  const labelW = 160;
  const valueW = 55;
  const vWidth = 600;
  const vHeight = data.length * rowH + 8;
  const barAreaW = vWidth - labelW - valueW - 16;

  return (
    <svg viewBox={`0 0 ${vWidth} ${vHeight}`} className="w-full" style={{ fontFamily: FONT }}>
      <defs>
        {data.map((d, i) => {
          const c = d.color ?? rateColor(d.value);
          return (
            <linearGradient key={i} id={`hbar-g-${uid}-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c} stopOpacity={0.9} />
              <stop offset="100%" stopColor={c} stopOpacity={0.6} />
            </linearGradient>
          );
        })}
      </defs>
      {data.map((d, i) => {
        const y = i * rowH + 6;
        const w = (d.value / max) * barAreaW;
        const c = d.color ?? rateColor(d.value);
        const isHov = hovered === i;
        return (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'default' }}
          >
            {/* Label */}
            <text x={labelW - 6} y={y + barHeight / 2 + 4} textAnchor="end" fill={isHov ? '#334155' : '#94a3b8'} fontSize={11} fontWeight={isHov ? 700 : 500}>
              {d.label}
            </text>
            {/* Bar bg */}
            <rect x={labelW} y={y} width={barAreaW} height={barHeight} rx={barHeight / 2} fill="#e2e8f0" opacity={0.5} />
            {/* Bar fill */}
            <motion.rect
              x={labelW}
              y={y}
              height={barHeight}
              rx={barHeight / 2}
              fill={`url(#hbar-g-${uid}-${i})`}
              initial={animate ? { width: 0 } : { width: w }}
              animate={{ width: w }}
              transition={{ duration: 0.7, delay: i * 0.08, type: 'spring', stiffness: 80 }}
              opacity={isHov ? 1 : 0.85}
            />
            {/* Value */}
            {showValues && (
              <motion.text
                x={labelW + barAreaW + 8}
                y={y + barHeight / 2 + 4}
                fill={c}
                fontSize={12}
                fontWeight={700}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                {d.value}{valueSuffix}
              </motion.text>
            )}
            {/* Tooltip */}
            {isHov && d.meta && (
              <foreignObject x={labelW + w / 2 - 50} y={y - 30} width={100} height={26}>
                <div style={{ background: '#0f172a', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 6, textAlign: 'center', fontFamily: FONT, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
                  {d.meta}
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  4. VerticalBarChart
// ═══════════════════════════════════════════════════════════════

interface VBarDatum {
  label: string;
  value: number;
  color?: string;
  highlight?: boolean;
}

interface VerticalBarChartProps {
  data: VBarDatum[];
  height?: number;
  maxValue?: number;
  showValues?: boolean;
}

export function VerticalBarChart({
  data,
  height = 200,
  maxValue: forcedMax,
  showValues = true,
}: VerticalBarChartProps) {
  const uid = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const max = forcedMax ?? Math.max(...data.map(d => d.value), 1);
  const vWidth = Math.max(data.length * 52, 200);
  const margin = { top: 24, bottom: 28, left: 8, right: 8 };
  const ch = height - margin.top - margin.bottom;
  const barW = Math.min(32, (vWidth - margin.left - margin.right) / data.length - 8);
  const gap = (vWidth - margin.left - margin.right - barW * data.length) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${vWidth} ${height}`} className="w-full" style={{ fontFamily: FONT }}>
      <defs>
        <filter id={`glow-${uid}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {data.map((d, i) => {
          const c = d.color ?? rateColor(d.value);
          return (
            <linearGradient key={i} id={`vbar-g-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity={1} />
              <stop offset="100%" stopColor={c} stopOpacity={0.5} />
            </linearGradient>
          );
        })}
      </defs>
      {data.map((d, i) => {
        const c = d.color ?? rateColor(d.value);
        const barH = (d.value / max) * ch;
        const x = margin.left + gap + i * (barW + gap);
        const y = margin.top + ch - barH;
        const isHov = hovered === i;

        return (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            filter={d.highlight ? `url(#glow-${uid})` : undefined}
            style={{ cursor: 'default' }}
          >
            <motion.rect
              x={x}
              width={barW}
              rx={barW / 4}
              fill={`url(#vbar-g-${uid}-${i})`}
              opacity={isHov ? 1 : 0.85}
              initial={{ y: margin.top + ch, height: 0 }}
              animate={{ y, height: barH }}
              transition={{ duration: 0.6, delay: i * 0.06, type: 'spring', stiffness: 90 }}
            />
            {/* Value label */}
            {showValues && (
              <motion.text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fill={c}
                fontSize={10}
                fontWeight={700}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.06 }}
              >
                {d.value}
              </motion.text>
            )}
            {/* X label */}
            <text x={x + barW / 2} y={margin.top + ch + 16} textAnchor="middle" fill={isHov ? '#334155' : '#94a3b8'} fontSize={10} fontWeight={isHov ? 700 : 400}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  5. DonutChart
// ═══════════════════════════════════════════════════════════════

interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  segments,
  size = 160,
  strokeWidth = 20,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  // Accumulate offsets
  let cumOffset = 0;
  const arcs = segments.map((seg, i) => {
    const pct = seg.value / total;
    const dash = circ * pct;
    const offset = circ * cumOffset;
    cumOffset += pct;
    return { ...seg, pct, dash, offset, index: i };
  });

  const legendH = segments.length * 20 + 8;

  return (
    <svg viewBox={`0 0 ${size} ${size + legendH}`} className="w-full" style={{ fontFamily: FONT, maxWidth: size }}>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} opacity={0.3} />

      {/* Segments */}
      {arcs.map((arc) => (
        <motion.circle
          key={arc.index}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={hovered === arc.index ? strokeWidth + 4 : strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - arc.offset - arc.dash }}
          transition={{ duration: 0.8, delay: arc.index * 0.15, ease: 'easeOut' }}
          opacity={hovered !== null && hovered !== arc.index ? 0.5 : 1}
          onMouseEnter={() => setHovered(arc.index)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'default' }}
        />
      ))}

      {/* Center text */}
      {centerValue && (
        <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="central" fill="#1e293b" fontSize={size / 5.5} fontWeight={800}>
          {centerValue}
        </text>
      )}
      {centerLabel && (
        <text x={cx} y={cy + size / 7} textAnchor="middle" fill="#94a3b8" fontSize={size / 13} fontWeight={500}>
          {centerLabel}
        </text>
      )}

      {/* Legend */}
      {segments.map((seg, i) => {
        const ly = size + 8 + i * 20;
        return (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'default' }}>
            <circle cx={12} cy={ly + 6} r={4} fill={seg.color} />
            <text x={22} y={ly + 10} fill="#64748b" fontSize={11} fontWeight={500}>{seg.label ?? `Segment ${i + 1}`}</text>
            <text x={size - 8} y={ly + 10} textAnchor="end" fill="#94a3b8" fontSize={11} fontWeight={700}>{seg.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  6. CalendarHeatmap
// ═══════════════════════════════════════════════════════════════

interface HeatmapDatum {
  date: string;    // YYYY-MM-DD
  value: number;   // e.g. attendance %
}

interface HeatmapColorStop {
  threshold: number;
  color: string;
}

interface CalendarHeatmapProps {
  data: HeatmapDatum[];
  colorScale?: HeatmapColorStop[];
  weeksToShow?: number;
  cellSize?: number;
  locale?: 'ar' | 'en';
  onCellHover?: (date: string, value: number) => void;
}

const DEFAULT_HEAT_COLORS: HeatmapColorStop[] = [
  { threshold: 95, color: '#059669' },   // dark green
  { threshold: 85, color: '#34d399' },   // light green
  { threshold: 75, color: '#f59e0b' },   // amber
  { threshold: 0,  color: '#f43f5e' },   // red
];

const WEEKDAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const WEEKDAY_LABELS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس'];

export function CalendarHeatmap({
  data,
  colorScale = DEFAULT_HEAT_COLORS,
  weeksToShow = 16,
  cellSize = 24,
  locale = 'ar',
  onCellHover,
}: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; value: number } | null>(null);

  // Use a large fixed viewBox width so the SVG doesn't scale up text/cells
  const gap = 4;
  const labelW = 40;
  const headerH = 16;
  const rows = 5;
  const cols = weeksToShow;
  // Calculate cell size to fill a ~700px wide viewBox
  const targetWidth = 700;
  const computedCellSize = Math.min(cellSize, Math.floor((targetWidth - labelW - 8) / cols - gap));
  const vWidth = labelW + cols * (computedCellSize + gap) + 8;
  const vHeight = headerH + rows * (computedCellSize + gap) + 8;

  // Build date map
  const dateMap = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach(d => m.set(d.date, d.value));
    return m;
  }, [data]);

  // Generate grid: go back weeksToShow weeks from today
  const cells = useMemo(() => {
    const result: { date: string; value: number | null; col: number; row: number }[] = [];
    const today = new Date();
    // Find the most recent Sunday
    const dayOfWeek = today.getDay();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - dayOfWeek);
    // Go back weeksToShow-1 more weeks
    const startDate = new Date(startOfThisWeek);
    startDate.setDate(startDate.getDate() - (weeksToShow - 1) * 7);

    for (let w = 0; w < weeksToShow; w++) {
      for (let d = 0; d < 5; d++) {
        // Sun=0, Mon=1, Tue=2, Wed=3, Thu=4
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);
        const ds = cellDate.toISOString().split('T')[0];
        const val = dateMap.get(ds) ?? null;
        result.push({ date: ds, value: val, col: w, row: d });
      }
    }
    return result;
  }, [dateMap, weeksToShow]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (const cell of cells) {
      if (cell.row !== 0) continue;
      const m = new Date(cell.date).getMonth();
      if (m !== lastMonth) {
        labels.push({ label: new Date(cell.date).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en', { month: 'short' }), col: cell.col });
        lastMonth = m;
      }
    }
    return labels;
  }, [cells, locale]);

  function cellColor(value: number | null): string {
    if (value === null) return '#e2e8f0'; // slate-200 / no data
    const sorted = [...colorScale].sort((a, b) => b.threshold - a.threshold);
    for (const s of sorted) {
      if (value >= s.threshold) return s.color;
    }
    return sorted[sorted.length - 1]?.color ?? '#e2e8f0';
  }

  return (
    <svg viewBox={`0 0 ${vWidth} ${vHeight}`} className="w-full" style={{ fontFamily: FONT, maxHeight: 220 }}>
      {/* Month labels */}
      {monthLabels.map((ml, i) => (
        <text key={i} x={labelW + ml.col * (computedCellSize + gap) + computedCellSize / 2} y={12} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight={500}>
          {ml.label}
        </text>
      ))}

      {/* Day labels */}
      {(locale === 'ar' ? WEEKDAY_LABELS_AR : WEEKDAY_LABELS_EN).map((lbl, i) => (
        <text key={lbl} x={labelW - 4} y={headerH + i * (computedCellSize + gap) + computedCellSize / 2 + 4} textAnchor="end" fill="#64748b" fontSize={10}>
          {lbl}
        </text>
      ))}

      {/* Cells */}
      {cells.map((cell, i) => {
        const x = labelW + cell.col * (computedCellSize + gap);
        const y = headerH + cell.row * (computedCellSize + gap);
        return (
          <motion.rect
            key={cell.date}
            x={x}
            y={y}
            width={computedCellSize}
            height={computedCellSize}
            rx={4}
            fill={cellColor(cell.value)}
            opacity={cell.value === null ? 0.25 : 0.85}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: cell.value === null ? 0.25 : 0.85, scale: 1 }}
            transition={{ duration: 0.3, delay: cell.col * 0.02 + cell.row * 0.01 }}
            onMouseEnter={() => {
              setTooltip({ x: x + computedCellSize / 2, y, date: cell.date, value: cell.value ?? 0 });
              if (cell.value !== null) onCellHover?.(cell.date, cell.value);
            }}
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor: cell.value !== null ? 'pointer' : 'default' }}
          />
        );
      })}

      {/* Tooltip */}
      {tooltip && (
        <foreignObject
          x={clamp(tooltip.x - 55, 0, vWidth - 110)}
          y={tooltip.y - 30}
          width={110}
          height={26}
        >
          <div style={{ background: '#0f172a', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 6, textAlign: 'center', fontFamily: FONT, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
            {tooltip.date}: {tooltip.value}%
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  7. RadarChart
// ═══════════════════════════════════════════════════════════════

interface RadarAxis {
  label: string;
  value: number;
  maxValue: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  size?: number;
  color?: string;
  fillOpacity?: number;
}

export function RadarChart({
  axes,
  size = 220,
  color = '#8b5cf6',
  fillOpacity = 0.2,
}: RadarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;

  function polarToXY(angle: number, r: number): [number, number] {
    return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];
  }

  // Concentric rings
  const rings = [0.33, 0.66, 1];

  // Value polygon points
  const valuePts = axes.map((a, i) => {
    const pct = clamp(a.value / (a.maxValue || 1), 0, 1);
    return polarToXY(i * angleStep, pct * maxR);
  });
  const valuePolygon = valuePts.map(p => p.join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" style={{ fontFamily: FONT, maxWidth: size }}>
      {/* Rings */}
      {rings.map((r, i) => {
        const ringPts = Array.from({ length: n }, (_, j) => polarToXY(j * angleStep, r * maxR));
        return (
          <polygon
            key={i}
            points={ringPts.map(p => p.join(',')).join(' ')}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={0.5}
            opacity={0.5}
          />
        );
      })}

      {/* Axis lines */}
      {axes.map((_, i) => {
        const [ex, ey] = polarToXY(i * angleStep, maxR);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#e2e8f0" strokeWidth={0.5} opacity={0.5} />;
      })}

      {/* Value polygon (animated) */}
      <motion.polygon
        points={valuePolygon}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Value dots */}
      {valuePts.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={hovered === i ? 5 : 3}
          fill={hovered === i ? '#fff' : color}
          stroke={color}
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.08 }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}
        />
      ))}

      {/* Labels */}
      {axes.map((a, i) => {
        const [lx, ly] = polarToXY(i * angleStep, maxR + 16);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill={hovered === i ? '#334155' : '#64748b'}
            fontSize={10}
            fontWeight={hovered === i ? 700 : 500}
          >
            {a.label}
          </text>
        );
      })}

      {/* Hover tooltip */}
      {hovered !== null && (
        <foreignObject
          x={clamp(valuePts[hovered][0] - 45, 0, size - 90)}
          y={valuePts[hovered][1] - 32}
          width={90}
          height={26}
        >
          <div style={{ background: '#0f172a', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 6, textAlign: 'center', fontFamily: FONT, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
            {axes[hovered].label}: {axes[hovered].value}/{axes[hovered].maxValue}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  8. ScatterPlot
// ═══════════════════════════════════════════════════════════════

interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

interface ScatterPlotProps {
  points: ScatterPoint[];
  xLabel?: string;
  yLabel?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  height?: number;
}

export function ScatterPlot({
  points,
  xLabel = 'X',
  yLabel = 'Y',
  xRange: forcedXRange,
  yRange: forcedYRange,
  height = 220,
}: ScatterPlotProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const vWidth = 500;
  const vHeight = height;
  const margin = { top: 16, right: 16, bottom: 36, left: 48 };
  const cw = vWidth - margin.left - margin.right;
  const ch = vHeight - margin.top - margin.bottom;

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const xMin = forcedXRange?.[0] ?? Math.min(...xs);
  const xMax = forcedXRange?.[1] ?? Math.max(...xs);
  const yMin = forcedYRange?.[0] ?? Math.min(...ys);
  const yMax = forcedYRange?.[1] ?? Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const xTicks = niceScale(xMin, xMax, 5);
  const yTicks = niceScale(yMin, yMax, 4);
  const sxMin = xTicks[0];
  const sxMax = xTicks[xTicks.length - 1];
  const syMin = yTicks[0];
  const syMax = yTicks[yTicks.length - 1];
  const sxRange = sxMax - sxMin || 1;
  const syRange = syMax - syMin || 1;

  function toSvg(px: number, py: number): [number, number] {
    return [
      margin.left + ((px - sxMin) / sxRange) * cw,
      margin.top + (1 - (py - syMin) / syRange) * ch,
    ];
  }

  return (
    <svg viewBox={`0 0 ${vWidth} ${vHeight}`} className="w-full" style={{ fontFamily: FONT }}>
      {/* Grid */}
      {yTicks.map(t => {
        const [, y] = toSvg(0, t);
        return <line key={`y${t}`} x1={margin.left} y1={y} x2={margin.left + cw} y2={y} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="4 3" />;
      })}
      {xTicks.map(t => {
        const [x] = toSvg(t, 0);
        return <line key={`x${t}`} x1={x} y1={margin.top} x2={x} y2={margin.top + ch} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="4 3" />;
      })}

      {/* Y-axis labels */}
      {yTicks.map(t => {
        const [, y] = toSvg(0, t);
        return <text key={`yl${t}`} x={margin.left - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize={10}>{t}</text>;
      })}

      {/* X-axis labels */}
      {xTicks.map(t => {
        const [x] = toSvg(t, 0);
        return <text key={`xl${t}`} x={x} y={margin.top + ch + 16} textAnchor="middle" fill="#94a3b8" fontSize={10}>{t}</text>;
      })}

      {/* Axis names */}
      <text x={vWidth / 2} y={vHeight - 2} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600}>{xLabel}</text>
      <text x={12} y={vHeight / 2} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600} transform={`rotate(-90, 12, ${vHeight / 2})`}>{yLabel}</text>

      {/* Dots */}
      {points.map((p, i) => {
        const [sx, sy] = toSvg(p.x, p.y);
        const isHov = hovered === i;
        const c = p.color ?? '#38bdf8'; // sky-400
        return (
          <motion.circle
            key={i}
            cx={sx}
            cy={sy}
            r={isHov ? 6 : 4}
            fill={c}
            fillOpacity={isHov ? 1 : 0.7}
            stroke={isHov ? '#fff' : 'none'}
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          />
        );
      })}

      {/* Tooltip */}
      {hovered !== null && points[hovered] && (() => {
        const [sx, sy] = toSvg(points[hovered].x, points[hovered].y);
        const label = points[hovered].label ?? `(${points[hovered].x}, ${points[hovered].y})`;
        return (
          <foreignObject x={clamp(sx - 50, 0, vWidth - 100)} y={sy - 32} width={100} height={26}>
            <div style={{ background: '#0f172a', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 6, textAlign: 'center', fontFamily: FONT, boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
              {label}
            </div>
          </foreignObject>
        );
      })()}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  9. ProgressRing
// ═══════════════════════════════════════════════════════════════

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  animate?: boolean;
}

export function ProgressRing({
  value,
  max = 100,
  size = 100,
  strokeWidth = 8,
  color: forcedColor,
  label,
  animate = true,
}: ProgressRingProps) {
  const [hovered, setHovered] = useState(false);

  const pct = max > 0 ? clamp(value / max, 0, 1) : 0;
  const displayPct = Math.round(pct * 100);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const c = forcedColor ?? rateColor(displayPct);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full"
      style={{ fontFamily: FONT, maxWidth: size, cursor: 'default' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} opacity={0.3} />

      {/* Progress arc */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={c}
        strokeWidth={hovered ? strokeWidth + 2 : strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        transform={`rotate(-90 ${cx} ${cy})`}
        initial={animate ? { strokeDashoffset: circ } : { strokeDashoffset: circ * (1 - pct) }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* Center percentage */}
      <text x={cx} y={label ? cy - 4 : cy} textAnchor="middle" dominantBaseline="central" fill="#1e293b" fontSize={size / 4.2} fontWeight={800}>
        {displayPct}%
      </text>

      {/* Label */}
      {label && (
        <text x={cx} y={cy + size / 6} textAnchor="middle" fill="#94a3b8" fontSize={size / 10} fontWeight={500}>
          {label}
        </text>
      )}
    </svg>
  );
}
