/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0c0a09',
          900: '#1c1917',
          800: '#292524',
          700: '#44403c',
          100: '#f5f5f4',
        },
        champagne: {
          50: '#fbf7f0',
          100: '#f3ead8',
          300: '#d4b483',
          500: '#b8894a',
          700: '#8a6230',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        fa: ['var(--font-fa)', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(28, 25, 23, 0.12)',
        'glass-dark': '0 12px 40px rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        glass: '18px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'menu-in': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'drawer-in': {
          '0%': { transform: 'translateX(var(--drawer-from))', opacity: '0.72' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'drawer-out': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(var(--drawer-from))', opacity: '0.72' },
        },
        'backdrop-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'backdrop-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'menu-in': 'menu-in 0.16s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 8s linear infinite',
        'drawer-in': 'drawer-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'drawer-out': 'drawer-out 0.28s cubic-bezier(0.4, 0, 0.2, 1) both',
        'backdrop-in': 'backdrop-in 0.32s ease-out both',
        'backdrop-out': 'backdrop-out 0.24s ease-in both',
      },
    },
  },
  plugins: [],
};
