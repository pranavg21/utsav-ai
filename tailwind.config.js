/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
        marigold: { 400: '#facc15', 500: '#eab308' },
        peacock: { 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
      },
    },
  },
  plugins: [],
};
