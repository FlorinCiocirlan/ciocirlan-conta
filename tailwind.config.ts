import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF6',
          100: '#F8F3E7',
          200: '#EFE6CF',
          300: '#E2D3A8',
        },
        ink: {
          50: '#F5F3EE',
          100: '#D8D2C2',
          400: '#5A5448',
          600: '#36322B',
          700: '#26231E',
          900: '#15140F',
        },
        accent: {
          DEFAULT: '#A6471C',
          dark: '#7E3415',
          light: '#C76B3D',
        },
        moss: '#4A6041',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        paper: '0 1px 2px rgba(38, 35, 30, 0.04), 0 8px 24px -8px rgba(38, 35, 30, 0.08)',
        'paper-lg': '0 2px 4px rgba(38, 35, 30, 0.05), 0 16px 40px -12px rgba(38, 35, 30, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
