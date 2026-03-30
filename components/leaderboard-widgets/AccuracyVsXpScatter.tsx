import React, { useState, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Target, Zap, AlertTriangle, Star } from 'lucide-react';

interface StudentDot {
  id: string;
  name: string;
  xp: number;
  accuracy: number;
  league: string;
  grade?: number;
  section?: string;
}

interface AccuracyVsXpScatterProps {
  students: StudentDot[];
  locale?: 'ar' | 'en';
  onStudentClick?: (studentId: string) => void;
  className?: string;
}

const LEAGUE_COLORS: Record<string, string> = {
  diamond: '#38bdf8',
  platinum: '#a78bfa',
  gold: '#fbbf24',
  silver: '#94a3b8',
  bronze: '#d97706',
};

const LEAGUE_LABELS: Record<string, { ar: string; en: string }> = {
  diamond: { ar: 'ماسي', en: 'Diamond' },
  platinum: { ar: 'بلاتيني', en: 'Platinum' },
  gold: { ar: 'ذهبي', en: 'Gold' },
  silver: { ar: 'فضي', en: 'Silver' },
  bronze: { ar: 'برونزي', en: 'Bronze' },
};

export const AccuracyVsXpScatter: React.FC<AccuracyVsXpScatterProps> = ({
  students,
  locale = 'ar',
  onStudentClick,
  className = '',
}) => {
  const t = (ar: string, en: string) => locale === 'ar' ? ar : en;
  const uid = useId();
  const [hoveredDot, setHoveredDot] = useState<StudentDot | null>(null);
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null);
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null);

  // Chart dimensions — wider aspect ratio, less vertical waste
  const margin = { top: 20, right: 25, bottom: 40, left: 45 };
  const width = 700;
  const height = 340;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Data bounds — auto-scale Y axis to actual data range (not always 0-100)
  const maxXp = useMemo(() => Math.max(...students.map(s => s.xp), 100), [students]);
  const xpPadding = maxXp * 0.1;

  const { yMin, yMax } = useMemo(() => {
    if (students.length === 0) return { yMin: 0, yMax: 100 };
    const accs = students.map(s => s.accuracy);
    const minAcc = Math.min(...accs);
    const maxAcc = Math.max(...accs);
    // Pad the range by 15% on each side, floor/ceil to nearest 10
    const pad = Math.max((maxAcc - minAcc) * 0.25, 10);
    return {
      yMin: Math.max(0, Math.floor((minAcc - pad) / 10) * 10),
      yMax: Math.min(100, Math.ceil((maxAcc + pad) / 10) * 10),
    };
  }, [students]);

  // Quadrant thresholds
  const medianXp = useMemo(() => {
    const sorted = [...students].sort((a, b) => a.xp - b.xp);
    return sorted[Math.floor(sorted.length / 2)]?.xp || maxXp / 2;
  }, [students, maxXp]);
  const accuracyThreshold = 70;
  // Clamp accuracy threshold to visible range
  const visibleAccThreshold = Math.max(yMin, Math.min(yMax, accuracyThreshold));

  // Map data to SVG coordinates — using dynamic Y range
  const toX = (xp: number) => margin.left + (xp / (maxXp + xpPadding)) * plotW;
  const toY = (acc: number) => margin.top + (1 - (acc - yMin) / (yMax - yMin)) * plotH;

  // Quadrant definitions
  const quadrants = [
    {
      id: 'star',
      label: t('متفوق', 'Star Performer'),
      emoji: '⭐',
      icon: Star,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.06)',
      borderColor: 'rgba(16, 185, 129, 0.15)',
      info: t('نقاط عالية ودقة عالية — أداء متميز ومستمر', 'High XP + High Accuracy — excellent consistent performance'),
      position: { x: width - margin.right - 10, y: margin.top + 10 },
      anchor: 'end' as const,
      area: { x1: toX(medianXp), y1: margin.top, x2: width - margin.right, y2: toY(accuracyThreshold) },
    },
    {
      id: 'accurate',
      label: t('دقيق', 'Accurate'),
      emoji: '🎯',
      icon: Target,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.06)',
      borderColor: 'rgba(59, 130, 246, 0.15)',
      info: t('دقة عالية لكن نشاط منخفض — يحتاج تشجيع للمشاركة أكثر', 'High accuracy but low activity — needs encouragement to participate more'),
      position: { x: margin.left + 10, y: margin.top + 10 },
      anchor: 'start' as const,
      area: { x1: margin.left, y1: margin.top, x2: toX(medianXp), y2: toY(accuracyThreshold) },
    },
    {
      id: 'active',
      label: t('نشيط', 'Active'),
      emoji: '⚡',
      icon: Zap,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.06)',
      borderColor: 'rgba(245, 158, 11, 0.15)',
      info: t('نشاط عالي لكن دقة منخفضة — يحتاج مراجعة وتركيز أكبر', 'High activity but low accuracy — needs review and more focus'),
      position: { x: width - margin.right - 10, y: height - margin.bottom - 10 },
      anchor: 'end' as const,
      area: { x1: toX(medianXp), y1: toY(accuracyThreshold), x2: width - margin.right, y2: height - margin.bottom },
    },
    {
      id: 'support',
      label: t('يحتاج دعم', 'Needs Support'),
      emoji: '🆘',
      icon: AlertTriangle,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.06)',
      borderColor: 'rgba(239, 68, 68, 0.15)',
      info: t('نقاط ودقة منخفضة — يحتاج متابعة ودعم مباشر', 'Low XP + Low accuracy — needs direct follow-up and support'),
      position: { x: margin.left + 10, y: height - margin.bottom - 10 },
      anchor: 'start' as const,
      area: { x1: margin.left, y1: toY(accuracyThreshold), x2: toX(medianXp), y2: height - margin.bottom },
    },
  ];

  // Quadrant student counts
  const quadrantCounts = useMemo(() => {
    const counts: Record<string, number> = { star: 0, accurate: 0, active: 0, support: 0 };
    students.forEach(s => {
      if (s.xp >= medianXp && s.accuracy >= accuracyThreshold) counts.star++;
      else if (s.xp < medianXp && s.accuracy >= accuracyThreshold) counts.accurate++;
      else if (s.xp >= medianXp && s.accuracy < accuracyThreshold) counts.active++;
      else counts.support++;
    });
    return counts;
  }, [students, medianXp]);

  // Y-axis ticks — dynamic based on visible range
  const yTicks = useMemo(() => {
    const step = Math.max(5, Math.ceil((yMax - yMin) / 5 / 5) * 5);
    const ticks: number[] = [];
    for (let v = yMin; v <= yMax; v += step) ticks.push(v);
    if (ticks[ticks.length - 1] < yMax) ticks.push(yMax);
    return ticks;
  }, [yMin, yMax]);
  // X-axis ticks
  const xTickCount = 5;
  const xStep = Math.ceil((maxXp + xpPadding) / xTickCount / 100) * 100;
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => i * xStep).filter(v => v <= maxXp + xpPadding);

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm ${className}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-black text-slate-900">{t('الدقة مقابل النقاط', 'Accuracy vs XP')}</h3>
          <p className="text-[11px] text-slate-400 font-medium">{t('توزيع الطلاب حسب الأداء والنشاط', 'Student distribution by performance and activity')}</p>
        </div>
      </div>

      {/* Quadrant Summary + League Legend — compact row */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {quadrants.map(q => (
          <div
            key={q.id}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-default group"
            style={{ backgroundColor: q.bgColor, borderColor: q.borderColor }}
            onMouseEnter={() => setHoveredQuadrant(q.id)}
            onMouseLeave={() => setHoveredQuadrant(null)}
          >
            <span className="text-xs">{q.emoji}</span>
            <span className="text-[11px] font-black" style={{ color: q.color }}>{q.label}</span>
            <span className="text-[10px] font-bold text-slate-400 mr-0.5">{quadrantCounts[q.id]}</span>
            {/* Info icon */}
            <button
              className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50"
              onMouseEnter={(e) => { e.stopPropagation(); setShowInfoTooltip(q.id); }}
              onMouseLeave={() => setShowInfoTooltip(null)}
            >
              <Info className="w-3 h-3" style={{ color: q.color }} />
            </button>
            {/* Info tooltip */}
            <AnimatePresence>
              {showInfoTooltip === q.id && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-1 z-20 bg-slate-900 text-white text-[10px] font-medium p-2.5 rounded-lg shadow-xl leading-relaxed"
                >
                  {q.info}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {/* League dots inline */}
        <div className="flex items-center gap-2 mr-auto">
          {Object.entries(LEAGUE_COLORS).map(([league, color]) => (
            <div key={league} className="flex items-center gap-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-bold text-slate-400">{locale === 'ar' ? LEAGUE_LABELS[league].ar : LEAGUE_LABELS[league].en}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <defs>
          {/* Dot glow filter */}
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Quadrant background fills */}
        {quadrants.map(q => (
          <rect
            key={q.id}
            x={q.area.x1} y={q.area.y1}
            width={q.area.x2 - q.area.x1} height={q.area.y2 - q.area.y1}
            fill={hoveredQuadrant === q.id ? q.bgColor.replace('0.06', '0.15') : q.bgColor}
            className="transition-all duration-300"
          />
        ))}

        {/* Grid lines */}
        {yTicks.map(tick => (
          <g key={`y-${tick}`}>
            <line x1={margin.left} y1={toY(tick)} x2={width - margin.right} y2={toY(tick)} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray={tick === accuracyThreshold ? "6,3" : "0"} />
            <text x={margin.left - 8} y={toY(tick) + 3} textAnchor="end" fill="#94a3b8" fontSize={10} fontWeight={500}>{tick}%</text>
          </g>
        ))}
        {xTicks.map(tick => (
          <g key={`x-${tick}`}>
            <line x1={toX(tick)} y1={margin.top} x2={toX(tick)} y2={height - margin.bottom} stroke="#e2e8f0" strokeWidth={0.5} />
            <text x={toX(tick)} y={height - margin.bottom + 16} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight={500}>{tick.toLocaleString()}</text>
          </g>
        ))}

        {/* Quadrant dividers (thicker dashed) */}
        <line x1={toX(medianXp)} y1={margin.top} x2={toX(medianXp)} y2={height - margin.bottom}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="8,4" opacity={0.5} />
        <line x1={margin.left} y1={toY(accuracyThreshold)} x2={width - margin.right} y2={toY(accuracyThreshold)}
          stroke="#94a3b8" strokeWidth={1} strokeDasharray="8,4" opacity={0.5} />

        {/* Axis labels */}
        <text x={width / 2} y={height - 4} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={700}>XP</text>
        <text x={12} y={height / 2} textAnchor="middle" fill="#64748b" fontSize={12} fontWeight={700}
          transform={`rotate(-90, 12, ${height / 2})`}>{t('الدقة %', 'Accuracy %')}</text>

        {/* Quadrant corner labels */}
        {quadrants.map(q => (
          <text key={`ql-${q.id}`} x={q.position.x} y={q.position.y}
            textAnchor={q.anchor} fill={q.color} fontSize={10} fontWeight={700} opacity={0.6}>
            {q.emoji} {q.label}
          </text>
        ))}

        {/* Student dots */}
        {students.map((s, i) => {
          const cx = toX(s.xp);
          const cy = toY(s.accuracy);
          const color = LEAGUE_COLORS[s.league] || '#94a3b8';
          const isHovered = hoveredDot?.id === s.id;
          const dotSize = isHovered ? 10 : 7;

          return (
            <g key={s.id}>
              {/* Glow on hover */}
              {isHovered && (
                <circle cx={cx} cy={cy} r={16} fill={color} opacity={0.15} />
              )}
              <motion.circle
                cx={cx}
                cy={cy}
                r={dotSize}
                fill={color}
                stroke="white"
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.015 }}
                onMouseEnter={() => setHoveredDot(s)}
                onMouseLeave={() => setHoveredDot(null)}
                onClick={() => onStudentClick?.(s.id)}
                style={{ cursor: onStudentClick ? 'pointer' : 'default' }}
              />
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredDot && (() => {
          const cx = toX(hoveredDot.xp);
          const cy = toY(hoveredDot.accuracy);
          const tooltipW = 160;
          const tooltipH = 60;
          const tx = Math.min(Math.max(cx - tooltipW / 2, margin.left), width - margin.right - tooltipW);
          const ty = cy - tooltipH - 16;
          const quadrant = hoveredDot.xp >= medianXp && hoveredDot.accuracy >= accuracyThreshold ? 'star'
            : hoveredDot.xp < medianXp && hoveredDot.accuracy >= accuracyThreshold ? 'accurate'
            : hoveredDot.xp >= medianXp ? 'active' : 'support';
          const qInfo = quadrants.find(q => q.id === quadrant)!;

          return (
            <foreignObject x={tx} y={Math.max(ty, 2)} width={tooltipW} height={tooltipH + 4}>
              <div style={{
                background: '#0f172a', color: '#fff', borderRadius: 10, padding: '8px 12px',
                fontFamily: "'Cairo', sans-serif", boxShadow: '0 8px 24px rgba(0,0,0,.3)',
                borderLeft: `3px solid ${qInfo.color}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>{hoveredDot.name}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', display: 'flex', gap: 12 }}>
                  <span>XP: <b style={{ color: '#fff' }}>{hoveredDot.xp.toLocaleString()}</b></span>
                  <span>{t('دقة', 'Acc')}: <b style={{ color: '#fff' }}>{hoveredDot.accuracy}%</b></span>
                </div>
                <div style={{ fontSize: 9, color: qInfo.color, marginTop: 2, fontWeight: 700 }}>
                  {qInfo.emoji} {qInfo.label}
                </div>
              </div>
            </foreignObject>
          );
        })()}
      </svg>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400">
        <span>{students.length} {t('طالب', 'students')}</span>
        <span>{t('خط الدقة', 'Accuracy line')}: {accuracyThreshold}% · {t('خط النقاط', 'XP line')}: {medianXp.toLocaleString()} XP</span>
      </div>
    </div>
  );
};

export default AccuracyVsXpScatter;
