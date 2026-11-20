/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sidebar-bg': '#0B3B2E',
        'primary-brand': '#0F4C3A',
        'accent-brand': '#46D68C',
        'accent-soft': '#E6F7EF',
        'page-bg': '#F4F7F6',
        'border-card': '#E6EBE9',
        'app-text': '#0F172A',
        'app-muted': '#64748B',
        // Pill colors
        'pill-green-bg': '#DCFCE7',
        'pill-green-text': '#15803D',
        'pill-yellow-bg': '#FEF3C7',
        'pill-yellow-text': '#A16207',
        'pill-orange-bg': '#FFEDD5',
        'pill-orange-text': '#C2410C',
        'pill-red-bg': '#FEE2E2',
        'pill-red-text': '#B91C1C',
        'pill-blue-bg': '#E0F2FE',
        'pill-blue-text': '#0369A1',
        'pill-purple-bg': '#F3E8FF',
        'pill-purple-text': '#6B21A8',
        'pill-amber-bg': '#FEF3C7',
        'pill-amber-text': '#B45309',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
