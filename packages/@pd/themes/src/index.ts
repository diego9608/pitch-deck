export interface ThemeTokens {
  '--color-bg': string;
  '--color-fg': string;
  '--color-primary': string;
  '--color-secondary': string;
  '--color-accent': string;
  '--color-border': string;
  '--color-glass-bg': string;
  '--radius-sm': string;
  '--radius-md': string;
  '--radius-lg': string;
  '--radius-xl': string;
  '--shadow-sm': string;
  '--shadow-md': string;
  '--shadow-lg': string;
  '--blur': string;
}

export const aguaTheme: ThemeTokens = {
  '--color-bg': '#0a1628',
  '--color-fg': '#e2e8f0',
  '--color-primary': '#3b82f6',
  '--color-secondary': '#1e40af',
  '--color-accent': '#60a5fa',
  '--color-border': 'rgba(148, 163, 184, 0.2)',
  '--color-glass-bg': 'rgba(15, 23, 42, 0.7)',
  '--radius-sm': '0.25rem',
  '--radius-md': '0.5rem',
  '--radius-lg': '0.75rem',
  '--radius-xl': '1rem',
  '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  '--blur': '14px',
};

export const defaultTheme = aguaTheme;

export function applyTheme(theme: ThemeTokens): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}
