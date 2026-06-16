/**
 * Design Token: Colors
 * UX4G/GIGW-aligned government color palette.
 * Tokens are exposed as CSS variables via public-theme.css.
 */
export const colors = {
  // Government blue (Digital India palette)
  primary: 'var(--public-primary, #1a3d7c)',
  primaryHover: 'var(--public-primary-hover, #15326a)',
  primaryLight: 'var(--public-primary-light, #e8eef8)',

  // Secondary / navy
  secondary: 'var(--public-secondary, #2c5282)',
  secondaryHover: 'var(--public-secondary-hover, #2a4a77)',

  // Accent / sky blue
  accent: 'var(--public-accent, #2b7ee0)',
  accentHover: 'var(--public-accent-hover, #2163b5)',

  // Backgrounds
  background: 'var(--public-background, #ffffff)',
  surface: 'var(--public-surface, #f4f7fb)',
  surfaceMuted: 'var(--public-surface-muted, #eef2f8)',

  // Text
  text: 'var(--public-text, #1a1a2e)',
  textMuted: 'var(--public-text-muted, #4a5568)',
  textInverse: 'var(--public-text-inverse, #ffffff)',

  // Border
  border: 'var(--public-border, #d2daea)',
  borderStrong: 'var(--public-border-strong, #b0bdd4)',

  // Semantic
  success: 'var(--public-success, #276749)',
  successLight: 'var(--public-success-light, #e6f4ed)',
  warning: 'var(--public-warning, #b45309)',
  warningLight: 'var(--public-warning-light, #fef3c7)',
  error: 'var(--public-error, #c53030)',
  errorLight: 'var(--public-error-light, #fff5f5)',
  info: 'var(--public-info, #2b6cb0)',
  infoLight: 'var(--public-info-light, #ebf4ff)',

  // Links and focus
  link: 'var(--public-link, #1a3d7c)',
  linkHover: 'var(--public-link-hover, #0f2a5c)',
  focusRing: 'var(--public-focus-ring, #fbbf24)',

  // Government-specific
  saffron: '#ff9933',
  white: '#ffffff',
  green: '#138808',
  navy: '#000080',
} as const;

export type ColorToken = keyof typeof colors;
