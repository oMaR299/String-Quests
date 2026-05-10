/**
 * Rules tab — the rationale behind every design-system convention.
 * Each rule has a do/don't pair with a one-line rationale.
 */

import React from 'react';
import {
  Globe2,
  Zap,
  Activity,
  Layers,
  Volume2,
  Languages,
  AlertTriangle,
  Palette,
  Eye,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CodeSnippet } from './CodeSnippet';

interface Rule {
  category: string;
  icon: LucideIcon;
  title: string;
  rationale: string;
  doLabel: string;
  doCode: string;
  dontLabel: string;
  dontCode: string;
}

const RULES: Rule[] = [
  {
    category: 'RTL safety',
    icon: Globe2,
    title: 'Use logical properties for directional spacing',
    rationale:
      'ps-*/pe-*/ms-*/me-* flip automatically under dir="rtl". Physical pl/pr/ml/mr break Arabic.',
    doLabel: 'Do',
    doCode: `<button className="ps-4 pe-3 me-2">…</button>`,
    dontLabel: "Don't",
    dontCode: `<button className="pl-4 pr-3 mr-2">…</button>`,
  },
  {
    category: 'RTL safety',
    icon: Globe2,
    title: 'Animation directions flip in RTL',
    rationale:
      'A "slide in from right" in LTR must become "slide in from left" in RTL. Read the dir from context.',
    doLabel: 'Do',
    doCode: `const enter = dir === 'rtl' ? { x: 24 } : { x: -24 };
<motion.div initial={enter} animate={{ x: 0 }} />`,
    dontLabel: "Don't",
    dontCode: `<motion.div initial={{ x: -24 }} animate={{ x: 0 }} />`,
  },
  {
    category: 'JIT safety',
    icon: Zap,
    title: 'Every Tailwind class string must be a literal in source',
    rationale:
      'Tailwind v4 JIT scans source files. Template-literal class names are invisible to it; use static lookup maps.',
    doLabel: 'Do',
    doCode: `const TONE_BG = {
  brand:   'bg-sq-brand-500',
  success: 'bg-sq-success-500',
} as const;
<div className={TONE_BG[tone]} />`,
    dontLabel: "Don't",
    dontCode: `<div className={\`bg-sq-\${tone}-500\`} />`,
  },
  {
    category: 'JIT safety',
    icon: Zap,
    title: 'Add literals to safelist when constructed via runtime lookup',
    rationale:
      'If your map is referenced by a string variable rather than imported, the JIT may still miss it. Belt-and-suspenders: list it in tailwind.config.ts safelist.',
    doLabel: 'Do',
    doCode: `// tailwind.config.ts
safelist: ['bg-sq-brand-500', 'bg-sq-success-500']`,
    dontLabel: "Don't",
    dontCode: `// no safelist — class never makes it to the build`,
  },
  {
    category: 'Reduced motion',
    icon: Activity,
    title: 'Guard every continuous animation on useReducedMotion()',
    rationale:
      'Users who request reduced motion should get an instant transition, not a disabled component. Provide a static fallback.',
    doLabel: 'Do',
    doCode: `const reduce = useReducedMotion();
<motion.div
  animate={{ x: 0 }}
  transition={reduce ? { duration: 0 } : SQ_SPRING.snappy}
/>`,
    dontLabel: "Don't",
    dontCode: `<motion.div animate={{ x: 0 }} transition={SQ_SPRING.snappy} />`,
  },
  {
    category: 'Glass usage',
    icon: Layers,
    title: 'Glassmorphism is reserved for chrome',
    rationale:
      'Glass over a busy background reads as "container", not "selectable". Use solid white cards for option pickers.',
    doLabel: 'Do (chrome)',
    doCode: `<header className="bg-white/80 backdrop-blur-xl border-b">…</header>
<aside className="bg-white/80 backdrop-blur-xl border-r">…</aside>`,
    dontLabel: "Don't (option picker)",
    dontCode: `// Solid white instead — see SqCard variant="solid"
<button className="bg-white/80 backdrop-blur border-2">Pick me</button>`,
  },
  {
    category: 'Buttons',
    icon: Palette,
    title: 'The 3D press is reserved for primary CTAs',
    rationale:
      'border-b-4 + active:translate-y is iconic — using it on every button erodes its meaning. Use solid/outline/ghost for secondary actions.',
    doLabel: 'Do (primary CTA)',
    doCode: `<SqButton variant="3d" tone="brand">Confirm</SqButton>`,
    dontLabel: "Don't (decorative)",
    dontCode: `<SqButton variant="3d" tone="neutral" iconOnly>×</SqButton>`,
  },
  {
    category: 'Sound',
    icon: Volume2,
    title: 'Step advance fires a sound, mute toggle is respected',
    rationale:
      'useSounds.ts already exposes synthesized cues. Every step / confirm / success should play one — and respect the global mute hook.',
    doLabel: 'Do',
    doCode: `const { playSure } = useSounds();
const handleConfirm = () => {
  if (!muted) playSure();
  proceed();
};`,
    dontLabel: "Don't",
    dontCode: `const handleConfirm = () => proceed(); // silent`,
  },
  {
    category: 'Bilingual',
    icon: Languages,
    title: 'Every user-facing string lives in i18n; AR is source of truth',
    rationale:
      'AR is the primary audience. Ship the AR copy first, EN follows as translation. Cairo at locale-aware leading.',
    doLabel: 'Do',
    doCode: `<h1 className={typeClass('h1', locale)}>{t('home.welcome')}</h1>`,
    dontLabel: "Don't",
    dontCode: `<h1 className="text-3xl font-black">Welcome</h1> // hard-coded EN`,
  },
  {
    category: 'Confirm discipline',
    icon: AlertTriangle,
    title: 'Destructive actions go through useConfirmDialog',
    rationale:
      "window.confirm is browser-styled and unstyleable. The design system's dialog is RTL-safe and matches brand.",
    doLabel: 'Do',
    doCode: `const ok = await confirm({
  titleAr: 'حذف الفصل',
  titleEn: 'Delete class',
  bodyAr: '...', bodyEn: '...',
  destructive: true,
});
if (ok) deleteClass();`,
    dontLabel: "Don't",
    dontCode: `if (window.confirm('Delete?')) deleteClass();`,
  },
  {
    category: 'Color tokens',
    icon: Palette,
    title: 'New components prefer sq-* tokens',
    rationale:
      'duo-* and phone-* still ship — existing modules continue using them. New work should opt in to sq-* so the brand evolves coherently.',
    doLabel: 'Do (new component)',
    doCode: `<button className="bg-sq-brand-500 text-white">…</button>`,
    dontLabel: "Don't (new component)",
    dontCode: `<button className="bg-violet-500 text-white">…</button>`,
  },
  {
    category: 'Accessibility',
    icon: Eye,
    title: 'Reduced motion + sound + RTL combine — test all three',
    rationale:
      'They interact: RTL flips animation direction; reduced motion disables it; sound respects the same mute toggle as visuals. Sanity-check the matrix.',
    doLabel: 'Do (test matrix)',
    doCode: `// Test each of the 8 combinations:
//   ar/en × reduced/full × muted/unmuted
// Make sure the UI is usable in every cell.`,
    dontLabel: "Don't",
    dontCode: `// Tested only the default (en + full + unmuted) and shipped.`,
  },
];

const CATEGORIES = Array.from(new Set(RULES.map((r) => r.category)));

export const DesignSystemRulesTab: React.FC = () => {
  return (
    <div className="font-cairo space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white p-6 md:p-8 shadow-md shadow-violet-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Rules of the system</h2>
            <p className="mt-1 text-sm font-medium text-white/85 leading-relaxed max-w-2xl">
              Each rule pairs a Do with a Don't and a one-line rationale. These are the conventions
              the existing modules already follow — the design system makes them explicit so new
              work doesn't drift.
            </p>
          </div>
          <div className="shrink-0 hidden md:flex flex-col gap-1 text-right">
            <div className="text-3xl font-black">{RULES.length}</div>
            <div className="text-[11px] font-bold text-white/75 uppercase tracking-widest">Rules</div>
          </div>
        </div>
      </div>

      {/* Category quick-jump pills */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto -mx-4 px-4">
        {CATEGORIES.map((cat) => (
          <a
            key={cat}
            href={`#rule-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            className="shrink-0 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-bold transition-colors"
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Rule cards by category */}
      {CATEGORIES.map((cat) => {
        const items = RULES.filter((r) => r.category === cat);
        const Icon = items[0].icon;
        return (
          <section
            key={cat}
            id={`rule-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-slate-900">{cat}</h2>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="space-y-4">
              {items.map((r) => (
                <RuleCard key={r.title} rule={r} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

const RuleCard: React.FC<{ rule: Rule }> = ({ rule }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-black text-slate-900">{rule.title}</h3>
        <p className="mt-1 text-xs font-medium text-slate-500 leading-relaxed">{rule.rationale}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sq-success-500 text-white text-[10px] font-black">
              ✓
            </span>
            <span className="text-[11px] font-bold text-sq-success-700 uppercase tracking-wider">
              {rule.doLabel}
            </span>
          </div>
          <CodeSnippet code={rule.doCode} />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sq-danger-500 text-white text-[10px] font-black">
              ×
            </span>
            <span className="text-[11px] font-bold text-sq-danger-700 uppercase tracking-wider">
              {rule.dontLabel}
            </span>
          </div>
          <CodeSnippet code={rule.dontCode} />
        </div>
      </div>
    </div>
  );
};

export default DesignSystemRulesTab;
