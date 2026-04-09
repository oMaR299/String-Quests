import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Star } from 'lucide-react';

// ─────────────────────────────────────────────
// Color Maps
// ─────────────────────────────────────────────

const colorMap = {
  sky: {
    gradient: 'from-white to-sky-50/30',
    text: 'text-sky-600',
    border: 'border-sky-200/60',
    bg: 'bg-sky-50/20',
  },
  emerald: {
    gradient: 'from-white to-emerald-50/30',
    text: 'text-emerald-600',
    border: 'border-emerald-200/60',
    bg: 'bg-emerald-50/20',
  },
  violet: {
    gradient: 'from-white to-violet-50/30',
    text: 'text-violet-600',
    border: 'border-violet-200/60',
    bg: 'bg-violet-50/20',
  },
  amber: {
    gradient: 'from-white to-amber-50/30',
    text: 'text-amber-600',
    border: 'border-amber-200/60',
    bg: 'bg-amber-50/20',
  },
  rose: {
    gradient: 'from-white to-rose-50/30',
    text: 'text-rose-600',
    border: 'border-rose-200/60',
    bg: 'bg-rose-50/20',
  },
} as const;

// ─────────────────────────────────────────────
// useCountUp Hook
// ─────────────────────────────────────────────

function useCountUp(target: number, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, shouldStart]);

  return count;
}

function parseNumber(str: string): number {
  const cleaned = str.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function formatNumber(num: number, template: string): string {
  if (template.includes(',')) {
    return num.toLocaleString('en-US');
  }
  return num.toString();
}

// ─────────────────────────────────────────────
// 1. StatCallout
// ─────────────────────────────────────────────

interface StatCalloutProps {
  number: string;
  subtitle: string;
  icon?: React.ReactNode;
  color?: 'sky' | 'emerald' | 'violet' | 'amber' | 'rose';
}

export function StatCallout({ number, subtitle, icon, color = 'sky' }: StatCalloutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const numericValue = parseNumber(number);
  const animatedValue = useCountUp(numericValue, 2000, isInView);

  const prefix = number.match(/^[^0-9]*/)?.[0] || '';
  const suffix = number.match(/[^0-9]*$/)?.[0] || '';

  const colors = colorMap[color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`bg-gradient-to-br ${colors.gradient} border border-white/50 rounded-2xl p-8 text-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      {icon && (
        <div className={`${colors.text} mb-3 flex justify-center`}>
          {icon}
        </div>
      )}
      <div className={`text-5xl font-black ${colors.text} font-['Cairo'] leading-tight`}>
        {prefix}{formatNumber(animatedValue, number)}{suffix}
      </div>
      <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mt-2 font-['Cairo']">
        {subtitle}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 2. SectionDivider
// ─────────────────────────────────────────────

interface SectionDividerProps {
  sectionNumber: number;
  title: string;
}

export function SectionDivider({ sectionNumber, title }: SectionDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="my-16 flex items-center gap-4"
    >
      <div className="flex-1 h-px bg-gradient-to-l from-sky-300/60 to-transparent" />
      <div className="flex items-center gap-3 px-6 py-2.5 bg-white border border-sky-200/60 rounded-full shadow-sm">
        <span className="w-8 h-8 flex items-center justify-center bg-sky-100 text-sky-700 rounded-full text-sm font-bold font-['Cairo']">
          {sectionNumber}
        </span>
        <span className="text-slate-700 font-bold text-sm font-['Cairo']">
          {title}
        </span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-sky-300/60 to-transparent" />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 3. TestimonialCard
// ─────────────────────────────────────────────

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  organization: string;
}

export function TestimonialCard({ quote, name, role, organization }: TestimonialCardProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-8 border-r-4 border-r-sky-400 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
    >
      <div>
        <span className="text-6xl text-sky-200 leading-none font-serif select-none block mb-2">&ldquo;</span>
        <p className="text-slate-700 text-lg italic leading-relaxed font-['Cairo'] -mt-6 pr-4">
          {quote}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm font-['Cairo'] shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm font-['Cairo']">{name}</p>
          <p className="text-slate-500 text-xs font-['Cairo']">
            {role}{organization ? `، ${organization}` : ''}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 4. FeatureCard
// ─────────────────────────────────────────────

interface FeatureCardProps {
  emoji: string;
  title: string;
  bullets: string[];
  allPlans?: boolean;
}

export function FeatureCard({ emoji, title, bullets, allPlans = true }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-bold text-lg text-slate-800 font-['Cairo'] mb-3">{title}</h3>

      <ul className="space-y-2 flex-1">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-['Cairo']">
            <Check className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-slate-100">
        {allPlans ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-['Cairo']">
            <Check className="w-3 h-3" /> كل الخطط
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full font-['Cairo']">
            <Star className="w-3 h-3" /> +Nova
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 5. PricingCard
// ─────────────────────────────────────────────

interface PricingCardProps {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  recommended?: boolean;
  comingSoon?: boolean;
  discountPrice?: string;
}

export function PricingCard({
  name,
  price,
  priceNote,
  features,
  recommended = false,
  comingSoon = false,
  discountPrice,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm flex flex-col transition-all duration-300 ${
        recommended
          ? 'border-2 border-sky-400 scale-105 shadow-lg shadow-sky-100/50'
          : 'border border-slate-200/60'
      } ${comingSoon ? 'opacity-50' : 'hover:shadow-md'}`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-bold px-4 py-1 rounded-full font-['Cairo'] flex items-center gap-1">
          <Star className="w-3 h-3" /> الأكثر طلباً
        </div>
      )}

      {comingSoon && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
          <span className="bg-slate-800 text-white text-sm font-bold px-6 py-2 rounded-full font-['Cairo']">
            قريباً
          </span>
        </div>
      )}

      <h3 className="text-2xl font-bold text-slate-800 font-['Cairo'] mb-4">{name}</h3>

      <div className="mb-1">
        {discountPrice ? (
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-sky-600 font-['Cairo']">{discountPrice}</span>
            <span className="text-xl text-slate-400 line-through font-['Cairo']">{price}</span>
          </div>
        ) : (
          <span className="text-4xl font-black text-sky-600 font-['Cairo']">{price}</span>
        )}
      </div>
      <p className="text-sm text-slate-500 font-['Cairo'] mb-6">{priceNote}</p>

      <ul className="space-y-3 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-['Cairo']">
            <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-sky-600" />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
