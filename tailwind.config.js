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
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
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
