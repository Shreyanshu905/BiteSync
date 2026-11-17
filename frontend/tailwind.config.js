/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAFAF8',
          100: '#F4F3EF',
          200: '#EAE8E1',
          300: '#DFDDD4',
        },
        charcoal: {
          800: '#272523',
          900: '#1C1B1A',
          950: '#141312',
        },
        brand: {
          50: '#FAF2EE',
          100: '#F3E1D8',
          200: '#E7C5B5',
          300: '#D8A28B',
          400: '#CE7C5C',
          500: '#C45B35', // Muted Terracotta
          600: '#AB4B28',
          700: '#8F3D20',
          800: '#74321B',
          900: '#5D2917',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(24, 24, 27, 0.03)',
        card: '0 1px 3px rgba(24, 24, 27, 0.04), 0 1px 2px rgba(24, 24, 27, 0.02)',
        elevated: '0 6px 20px -4px rgba(24, 24, 27, 0.07)',
      },
    },
  },
  plugins: [],
};
