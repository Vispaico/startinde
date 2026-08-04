/**
 * StartinDE design tokens — brand theme foundation.
 * Trust-first: calm, official, precise. Gold accent on deep ink.
 */

export const brand = {
  name: 'StartinDE',
  tagline: 'Your verified personal path to Germany',
};

export const colors = {
  /** Deep ink — primary surfaces, text. Conveys authority + calm. */
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
  /** Gold — accent. Germany flag's gold; premium, warm CTA. */
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
  /** Red — caution/error only (Germany flag's red). */
  red: {
    500: '#d93a3a',
    600: '#b92626',
    700: '#981d1d',
  },
  /** Neutral scale for borders, backgrounds, muted text. */
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

export const fonts = {
  /** Sans for UI/body — Inter is the default choice (system fallback below). */
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  /** Serif for display/headline moments — adds "official document" gravitas. */
  display: "'Newsreader', Georgia, 'Times New Roman', serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
};

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

export const radius = {
  none: '0px',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(10 15 26 / 0.05)',
  md: '0 4px 6px -1px rgb(10 15 26 / 0.07), 0 2px 4px -2px rgb(10 15 26 / 0.05)',
  lg: '0 10px 15px -3px rgb(10 15 26 / 0.10), 0 4px 6px -4px rgb(10 15 26 / 0.05)',
  xl: '0 20px 25px -5px rgb(10 15 26 / 0.12), 0 8px 10px -6px rgb(10 15 26 / 0.05)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const tokens = { colors, fonts, spacing, radius, shadows, breakpoints };
export default tokens;
