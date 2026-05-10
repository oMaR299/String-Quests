import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
  ],
  safelist: [
    // Dynamic classes used in TopicSelectionScreen.tsx and other components
    { pattern: /bg-(blue|purple|emerald|orange|indigo|yellow|teal|pink|amber|violet|cyan|green|rose|sky|fuchsia|stone|lime|red|slate)-(50|100|200|300|400|500|600)/ },
    { pattern: /text-(blue|purple|emerald|orange|indigo|yellow|teal|pink|amber|violet|cyan|green|rose|sky|fuchsia|stone|lime|red|slate)-(400|500|600)/ },
    { pattern: /from-(blue|purple|emerald|orange|indigo|yellow|teal|pink|amber|violet|cyan|green|rose|sky|fuchsia|stone|lime|red|slate)-(400|500)/ },
    { pattern: /to-(blue|purple|emerald|orange|indigo|yellow|teal|pink|amber|violet|cyan|green|rose|sky|fuchsia|stone|lime|red|slate)-(400|500)/ },
    { pattern: /border-(blue|purple|emerald|orange|indigo|yellow|teal|pink|amber|violet|cyan|green|rose|sky|fuchsia|stone|lime|red|slate)-(200|300)/ },
    { pattern: /shadow-(blue|purple|emerald|orange|indigo|yellow|teal|pink|amber|violet|cyan|green|rose|sky|fuchsia|stone|lime|red|slate)-(500)/ },
    // String-Quests Design System (sq-*) safelist. Every literal that the
    // design-system static maps construct lives here so the JIT picks them
    // up even when the consumer references them by name through a lookup.
    'bg-sq-brand-50','bg-sq-brand-100','bg-sq-brand-500','bg-sq-brand-600','bg-sq-brand-700',
    'text-sq-brand-500','text-sq-brand-600','text-sq-brand-700',
    'border-sq-brand-200','border-sq-brand-500','border-sq-brand-600',
    'ring-sq-brand-500','ring-sq-brand-500/40','ring-sq-brand-500/20',
    'from-sq-brand-500','to-sq-brand-600',
    'bg-sq-success-50','bg-sq-success-500','bg-sq-success-600',
    'text-sq-success-500','text-sq-success-600','text-sq-success-700',
    'border-sq-success-200','border-sq-success-500',
    'bg-sq-warning-50','bg-sq-warning-500','bg-sq-warning-600',
    'text-sq-warning-500','text-sq-warning-600','text-sq-warning-700',
    'border-sq-warning-200','border-sq-warning-500',
    'bg-sq-danger-50','bg-sq-danger-500','bg-sq-danger-600',
    'text-sq-danger-500','text-sq-danger-600','text-sq-danger-700',
    'border-sq-danger-200','border-sq-danger-500',
    'bg-sq-info-50','bg-sq-info-500','bg-sq-info-600',
    'text-sq-info-500','text-sq-info-600','text-sq-info-700',
    'border-sq-info-200','border-sq-info-500',
    'bg-sq-cloud','bg-sq-stone','text-sq-ink',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        duo: {
          green: '#58CC02',
          'green-dark': '#4CAD00',
          'green-light': '#D7FFB8',
          blue: '#1CB0F6',
          'blue-dark': '#1899D6',
          'blue-light': '#E5F4FF',
          gold: '#FFC800',
          'gold-dark': '#E5A500',
          'gold-light': '#FFF4CC',
          red: '#FF4B4B',
          'red-light': '#FFE5E5',
          orange: '#FF9600',
          'orange-light': '#FFF0D5',
          purple: '#CE82FF',
          'purple-light': '#F3E5FF',
        },
        pastel: {
          blue: '#A7C7E7',
          purple: '#C7B8EA',
          pink: '#F8C8DC',
        },
        // ─── String-Quests Design System (sq-*) ─────────────────────────
        // Brand-wide palette for the new design system. Coexists with
        // `duo-*` — does NOT replace it. New modules opt in by referencing
        // `sq-*` tokens; legacy modules keep their own.
        // Brand: violet — most present in admin surfaces (NotificationAdmin,
        // TopicManager, ConfirmDialog header). Mature, calm, distinctly
        // educational without leaning playful.
        sq: {
          'brand-50':  '#F5F3FF',
          'brand-100': '#EDE9FE',
          'brand-500': '#8B5CF6',
          'brand-600': '#7C3AED',
          'brand-700': '#6D28D9',
          'success-50':  '#ECFDF5',
          'success-500': '#10B981',
          'success-600': '#059669',
          'warning-50':  '#FFFBEB',
          'warning-500': '#F59E0B',
          'warning-600': '#D97706',
          'danger-50':   '#FFF1F2',
          'danger-500':  '#F43F5E',
          'danger-600':  '#E11D48',
          'info-50':     '#F0F9FF',
          'info-500':    '#0EA5E9',
          'info-600':    '#0284C7',
          ink:    '#0F172A',
          stone:  '#94A3B8',
          cloud:  '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
};

export default config;
