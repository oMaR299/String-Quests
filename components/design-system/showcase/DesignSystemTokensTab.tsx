/**
 * Tokens tab — color / spacing / radius / shadow / motion swatches.
 * Every token can be copied to clipboard.
 */

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Copy, Check, Palette, Ruler, CornerDownRight, Layers, Sparkles } from 'lucide-react';
import { SQ_SWATCH_GROUPS, SQ_GRADIENTS } from '../tokens/colors';
import { SQ_SPACE } from '../tokens/spacing';
import { SQ_RADIUS_TOKENS } from '../tokens/radii';
import { SQ_SHADOW_DOCS } from '../tokens/shadows';
import { SQ_MOTION_DOCS } from '../tokens/motion';
import { SwatchCard } from './SwatchCard';

const SectionHeader: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>
    </div>
  </div>
);

const ClassCopy: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {/* */}
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
      title="Copy class string"
    >
      {copied ? <Check className="w-3 h-3 text-sq-success-600" /> : <Copy className="w-3 h-3" />}
      {value}
    </button>
  );
};

export const DesignSystemTokensTab: React.FC = () => {
  return (
    <div className="space-y-12 font-cairo">
      {/* ── Colors ─────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={Palette}
          title="Colors"
          description="Brand violet, semantic accents, neutrals, gradient pairs. Click any token / hex / class to copy."
        />

        <div className="space-y-6">
          {SQ_SWATCH_GROUPS.map((group) => (
            <div key={group.id}>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                {group.label}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {group.swatches.map((sw) => (
                  <SwatchCard
                    key={sw.token}
                    token={sw.token}
                    hex={sw.hex}
                    bgClass={sw.bgClass}
                    textOnLight={sw.textOnLight}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Gradients */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Gradients
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SQ_GRADIENTS.map((g) => (
                <div
                  key={g.id}
                  className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
                >
                  <div className={`h-20 ${g.className}`} />
                  <div className="p-3 space-y-1">
                    <div className="text-[12px] font-bold text-slate-800">{g.name}</div>
                    <div className="font-mono text-[10.5px] text-slate-500 truncate">
                      {g.stops[0]} → {g.stops[1]}
                    </div>
                    <ClassCopy value={g.className} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Spacing ─────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={Ruler}
          title="Spacing"
          description="4px-base scale. Visualised at scale below — copy the Tailwind utility from the right."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="space-y-3">
            {Object.entries(SQ_SPACE).map(([key, t]) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-10 shrink-0 text-[12px] font-bold text-slate-700 tabular-nums">
                  sq-{key}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                    style={{ width: `${Math.min(t.px * 2, 480)}px` }}
                  />
                  <span className="text-[11px] font-mono text-slate-500 tabular-nums">{t.px}px</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClassCopy value={t.padding} />
                  <ClassCopy value={t.gap} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Radii ───────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={CornerDownRight}
          title="Radius"
          description="Named radii so card vs button vs modal corners stay consistent."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SQ_RADIUS_TOKENS.map((r) => (
            <div
              key={r.token}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center"
            >
              <div
                className={`mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 ${r.class}`}
              />
              <div className="mt-3 text-[12px] font-bold text-slate-800">{r.token}</div>
              <div className="text-[11px] font-mono text-slate-500">{r.px}</div>
              <div className="mt-1.5">
                <ClassCopy value={r.class} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shadows ─────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={Layers}
          title="Shadows"
          description="Resting cards, lifts, modals, and the iconic 3D press recipe."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SQ_SHADOW_DOCS.map((s) => (
            <div
              key={s.token}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col items-center gap-3"
            >
              <div className={`w-24 h-16 rounded-xl bg-white ${s.class}`} />
              <div className="text-center w-full">
                <div className="text-[12px] font-bold text-slate-800">sq-shadow-{s.token}</div>
                <div className="text-[11px] font-medium text-slate-500 leading-relaxed mt-1">
                  {s.description}
                </div>
              </div>
              <ClassCopy value={s.class} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Motion ──────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={Sparkles}
          title="Motion"
          description="Spring presets + duration tokens. Reduced-motion is honoured everywhere."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SpringPreviewer label="gentle" stiffness={220} damping={26} mass={0.6} />
            <SpringPreviewer label="snappy" stiffness={420} damping={32} mass={0.7} />
            <SpringPreviewer label="bouncy" stiffness={520} damping={18} mass={0.6} />
          </div>
          <div className="space-y-2">
            {SQ_MOTION_DOCS.map((m) => (
              <div
                key={m.token}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100"
              >
                <span className="font-mono text-[11px] font-bold text-sq-brand-700 shrink-0 w-44">
                  {m.token}
                </span>
                <span className="text-[12px] font-medium text-slate-600">{m.use}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const SpringPreviewer: React.FC<{
  label: string;
  stiffness: number;
  damping: number;
  mass: number;
}> = ({ label, stiffness, damping, mass }) => {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          spring.{label}
        </span>
        <button
          onClick={() => setTick((t) => t + 1)}
          className="text-[10px] font-bold text-sq-brand-600 hover:text-sq-brand-700"
        >
          Replay
        </button>
      </div>
      <div className="relative h-10 bg-white rounded-lg border border-slate-200 overflow-hidden">
        <motion.div
          key={tick}
          initial={{ x: 0 }}
          animate={{ x: tick % 2 === 0 ? 'calc(100% - 28px)' : 0 }}
          transition={
            reduce ? { duration: 0 } : { type: 'spring', stiffness, damping, mass }
          }
          className="absolute top-1/2 -translate-y-1/2 left-1 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600"
        />
      </div>
      <div className="mt-2 text-[10px] font-mono text-slate-500">
        s={stiffness} · d={damping} · m={mass}
      </div>
    </div>
  );
};

export default DesignSystemTokensTab;
