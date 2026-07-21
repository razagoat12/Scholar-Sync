import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm indie palette inspired by Claude
        cream: '#FFFBF5',
        'cream-light': '#FFF8F0',
        'warm-peach': '#FFE4D1',
        'warm-orange': '#FF9D66',
        'warm-orange-light': '#FFB399',
        'warm-gold': '#E8BC5C',
        'warm-brown': '#8B6F47',
        'warm-brown-light': '#9C7D5C',
        'warm-terracotta': '#D97A57',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
