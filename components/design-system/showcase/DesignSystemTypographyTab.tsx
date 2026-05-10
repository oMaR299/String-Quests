/**
 * Typography tab — every type recipe live, AR + EN side-by-side.
 */

import React, { useState } from 'react';
import { Globe, Type } from 'lucide-react';
import { SQ_TYPE_RECIPES, SQ_LEADING, SHOWCASE_TYPE_SAMPLES, typeClass, type SqTypeRecipe } from '../tokens/typography';

const RECIPE_ORDER: SqTypeRecipe[] = ['hero', 'h1', 'h2', 'h3', 'body', 'caption', 'micro', 'eyebrow'];

export const DesignSystemTypographyTab: React.FC = () => {
  const [showBoth, setShowBoth] = useState(true);
  const [single, setSingle] = useState<'ar' | 'en'>('ar');

  return (
    <div className="font-cairo space-y-8">
      {/* Header / mode toggle */}
      <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white p-6 md:p-8 shadow-md shadow-violet-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <Type className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Cairo type scale</h2>
            <p className="mt-1 text-sm font-medium text-white/85 leading-relaxed">
              AR-first scale with locale-aware leading. Arabic glyphs are taller — line-heights are
              tuned per locale so reading rhythm stays comfortable in either direction.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setShowBoth(true)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                showBoth ? 'bg-white text-sq-brand-700' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              AR · EN
            </button>
            <button
              onClick={() => {
                setShowBoth(false);
                setSingle('ar');
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                !showBoth && single === 'ar'
                  ? 'bg-white text-sq-brand-700'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              AR
            </button>
            <button
              onClick={() => {
                setShowBoth(false);
                setSingle('en');
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                !showBoth && single === 'en'
                  ? 'bg-white text-sq-brand-700'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Recipe table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="col-span-2">Recipe</div>
          <div className={showBoth ? 'col-span-5' : 'col-span-10'}>
            {showBoth ? 'Arabic (AR)' : single === 'ar' ? 'Arabic (AR)' : 'English (EN)'}
          </div>
          {showBoth && <div className="col-span-5">English (EN)</div>}
        </div>

        <div className="divide-y divide-slate-100">
          {RECIPE_ORDER.map((recipe) => {
            const meta = SQ_TYPE_RECIPES[recipe];
            return (
              <div
                key={recipe}
                className="grid grid-cols-12 items-start px-5 py-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="col-span-2 pe-3">
                  <div className="text-[12px] font-black text-slate-900">{recipe}</div>
                  <div className="mt-0.5 text-[10px] font-bold text-slate-400 leading-relaxed">
                    {meta.description}
                  </div>
                </div>
                {(showBoth || single === 'ar') && (
                  <div className={showBoth ? 'col-span-5' : 'col-span-10'} dir="rtl">
                    <div className={typeClass(recipe, 'ar')}>
                      {SHOWCASE_TYPE_SAMPLES.ar[recipe]}
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-400 break-all">
                      {meta.size} · {SQ_LEADING.ar[recipe]}
                    </div>
                  </div>
                )}
                {(showBoth || single === 'en') && (
                  <div className={showBoth ? 'col-span-5' : 'col-span-10'} dir="ltr">
                    <div className={typeClass(recipe, 'en')}>
                      {SHOWCASE_TYPE_SAMPLES.en[recipe]}
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-400 break-all">
                      {meta.size} · {SQ_LEADING.en[recipe]}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leading comparison */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/25 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-slate-900">Why locale-aware leading?</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">
              The same paragraph, set at three different leading values. Arabic at the same nominal
              size needs more vertical breathing room than English — the LEADING.ar map shifts
              every recipe up by one notch.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {[
            { lead: 'leading-[1.25]', label: 'Tight (1.25)', critique: 'Cramped — diacritics touch' },
            { lead: 'leading-[1.55]', label: 'EN body (1.55)', critique: 'Comfortable in English' },
            { lead: 'leading-[1.7]',  label: 'AR body (1.7)',  critique: 'Comfortable in Arabic' },
          ].map((sample) => (
            <div key={sample.lead} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {sample.label}
              </div>
              <p
                className={`text-sm font-medium text-slate-700 ${sample.lead}`}
                dir="rtl"
              >
                نظام التصميم الواضح يجعل كل قرار صغير يبدو مدروساً، حتى لو لم يلاحظه المستخدم بشكل مباشر.
              </p>
              <div className="mt-2 text-[10px] font-bold text-slate-500">{sample.critique}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignSystemTypographyTab;
