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
    // Phone-app palette safelist (kept here so JIT picks up tone-driven tokens
    // even when our tone maps are read by name through static lookup).
    'bg-phone-mint-50','bg-phone-mint-500','bg-phone-mint-600',
    'bg-phone-cream-50','bg-phone-cream-100',
    'bg-phone-coral-500','bg-phone-coral-600',
    'bg-phone-sky-50','bg-phone-sky-500','bg-phone-sky-600',
    'bg-phone-cloud','bg-phone-stone',
    'text-phone-ink','text-phone-stone','text-phone-mint-500','text-phone-mint-600',
    'text-phone-coral-500','text-phone-coral-600','text-phone-sky-500','text-phone-sky-600',
    'border-phone-mint-500','border-phone-mint-600',
    'border-phone-coral-500','border-phone-coral-600',
    'border-phone-sky-500','border-phone-sky-600',
    'bg-phone-gold-500','text-phone-gold-600','border-phone-gold-500',
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
        // Phone App palette — distinct from the student-app `duo-*` tokens.
        // Used EXCLUSIVELY inside `components/phone-app/**` so the onboarding
        // reads as its own product, not a recoloured tutorial.
        phone: {
          'mint-50':   '#ECFDF5',
          'mint-100':  '#D1FAE5',
          'mint-500':  '#10B981',
          'mint-600':  '#059669',
          'cream-50':  '#FFFBEB',
          'cream-100': '#FEF3C7',
          'coral-500': '#F87171',
          'coral-600': '#DC2626',
          'sky-50':    '#F0F9FF',
          'sky-100':   '#E0F2FE',
          'sky-500':   '#0EA5E9',
          'sky-600':   '#0284C7',
          'gold-500':  '#FCD34D',
          'gold-600':  '#D97706',
          ink:         '#0F172A',
          cloud:       '#F8FAFC',
          stone:       '#94A3B8',
          'stone-light': '#CBD5E1',
        },
      },
    },
  },
  plugins: [],
};

export default config;
