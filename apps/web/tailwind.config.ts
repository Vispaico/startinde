import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0d9e6',
          300: '#a8b8cd',
          400: '#7a90ad',
          500: '#56708f',
          600: '#3f5572',
          700: '#2d3d55',
          800: '#1e2a3d',
          900: '#121a28',
          950: '#0a0f1a',
        },
        gold: {
          50: '#fdf9ef',
          100: '#faf0d7',
          200: '#f4dfab',
          300: '#ecc87a',
          400: '#e4ae4d',
          500: '#dc9a2b',
          600: '#c07e1f',
          700: '#9c631c',
          800: '#7d4f1d',
          900: '#66421b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        lg: '0 10px 15px -3px rgb(10 15 26 / 0.10), 0 4px 6px -4px rgb(10 15 26 / 0.05)',
        xl: '0 20px 25px -5px rgb(10 15 26 / 0.12), 0 8px 10px -6px rgb(10 15 26 / 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
