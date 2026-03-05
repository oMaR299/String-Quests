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
      },
    },
  },
  plugins: [],
};

export default config;
