/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master Design System Tokens
        deepTeal: {
          DEFAULT: '#004F4C',
          dark: '#062b24',
          sidebar: '#062b24',
          card: '#07352d',
          hover: '#083b32',
        },
        primaryTeal: {
          DEFAULT: '#008C83',
          button: '#0f766e',
          light: '#14b8a6',
          dark: '#0d5d57',
        },
        mintGreen: {
          DEFAULT: '#A8F0D0',
          active: '#48d597',
          light: '#d1fae5',
          bg: '#e6f7f2',
        },
        bgOffWhite: {
          DEFAULT: '#F5FAFA',
          pearl: '#f0f7f5',
          soft: '#f8fafc',
        },
        primaryText: '#102333',
        secondaryText: '#526878',
        borderTeal: {
          DEFAULT: '#D9E9E8',
          subtle: '#e2e8f0',
          dark: '#0d3d34',
        },
      },
      fontFamily: {
        sans: ['Inter', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 2px 6px -1px rgba(0, 79, 76, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        'float': '0 10px 25px -5px rgba(0, 79, 76, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
