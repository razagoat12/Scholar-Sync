import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Near-black dark theme with an acid-lime accent
        base: '#0A0A0F',
        surface: '#141418',
        'surface-2': '#1B1B21',
        'surface-3': '#232329',
        border: 'rgba(255,255,255,0.08)',
        'border-strong': 'rgba(255,255,255,0.16)',
        ink: '#F4F4F5',
        muted: '#9C9CA8',
        lime: {
          DEFAULT: '#B6FF3B',
          dim: 'rgba(182,255,59,0.14)',
          400: '#C2FF5C',
          500: '#B6FF3B',
          600: '#9BE01F',
        },
        danger: '#FF5C5C',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
