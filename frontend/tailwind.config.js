/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF6F0',
          200: '#F5ECE1',
          300: '#EDE0D0',
        },
        charcoal: {
          800: '#262220',
          900: '#1A1817',
          950: '#11100F',
        },
        brand: {
          50: '#FFF5F2',
          100: '#FFE8E2',
          200: '#FFD1C5',
          300: '#FFAA95',
          400: '#FF7A5C',
          500: '#FF5C38', // Primary Coral
          600: '#EE441E',
          700: '#C83210',
          800: '#9E280E',
          900: '#7E2512',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        card: '0 4px 20px -2px rgba(28, 25, 23, 0.06)',
        elevated: '0 12px 32px -4px rgba(28, 25, 23, 0.12)',
      },
    },
  },
  plugins: [],
};

