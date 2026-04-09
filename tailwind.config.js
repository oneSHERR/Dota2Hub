/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dota: {
          bg: '#0a0e13',
          card: '#111923',
          border: '#1e2a3a',
          accent: '#e74c3c',
          gold: '#daa520',
          radiant: '#92A525',
          dire: '#C23C2A',
          str: '#EC3D06',
          agi: '#26E030',
          int: '#00B4F0',
          all: '#ccc',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Exo 2"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.25rem' }],    // 13px вместо 12px
        'sm': ['0.9375rem', { lineHeight: '1.375rem' }],   // 15px вместо 14px
        'base': ['1.0625rem', { lineHeight: '1.625rem' }], // 17px вместо 16px
        'lg': ['1.1875rem', { lineHeight: '1.75rem' }],    // 19px вместо 18px
        'xl': ['1.375rem', { lineHeight: '1.875rem' }],    // 22px вместо 20px
        '2xl': ['1.625rem', { lineHeight: '2rem' }],       // 26px
        '3xl': ['2rem', { lineHeight: '2.375rem' }],       // 32px
        '4xl': ['2.5rem', { lineHeight: '2.75rem' }],      // 40px
        '5xl': ['3.25rem', { lineHeight: '3.5rem' }],      // 52px
        '6xl': ['4rem', { lineHeight: '4.25rem' }],        // 64px
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(231,76,60,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(231,76,60,0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
