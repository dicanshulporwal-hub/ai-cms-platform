/** Design Token: Border Radius */
export const radius = {
  none: '0',
  sm: '0.125rem',  // 2px
  md: 'var(--public-radius, 0.375rem)',  // 6px default
  lg: 'calc(var(--public-radius, 0.375rem) * 1.5)',
  xl: 'calc(var(--public-radius, 0.375rem) * 2)',
  full: '9999px',
} as const;
