/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EEF8F2',
          100: '#D5EFDF',
          200: '#A9DFC0',
          300: '#6CC798',
          400: '#34A874',
          500: '#15894F',
          600: '#0C7040',
          700: '#0A5A35',
          800: '#08472A',
          900: '#06331E',
        },
        gold: {
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE38A',
          300: '#FFD556',
          400: '#FFC62E',
          500: '#F5B000',
          600: '#D99600',
          700: '#B37400',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scan-line': {
          '0%, 100%': { top: '6%' },
          '50%': { top: '90%' },
        },
        'coin-spin': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'pulse-dot': {
          '0%': { boxShadow: '0 0 0 0 rgba(52, 168, 116, 0.6)' },
          '70%': { boxShadow: '0 0 0 8px rgba(52, 168, 116, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(52, 168, 116, 0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'scan-line': 'scan-line 1.6s ease-in-out infinite',
        'coin-spin': 'coin-spin 3s linear infinite',
        'pulse-dot': 'pulse-dot 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};
