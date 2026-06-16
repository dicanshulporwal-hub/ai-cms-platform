/**
 * Design Token: Typography
 * UX4G-aligned type scale — readable on all devices.
 */
export const typography = {
  // Font families
  fontFamilyBase:
    "var(--public-font-family, 'Noto Sans', Inter, ui-sans-serif, system-ui, -apple-system, sans-serif)",
  fontFamilyHeading:
    "var(--public-font-heading, 'Noto Sans', Inter, ui-sans-serif, system-ui, -apple-system, sans-serif)",
  fontFamilyMono: "ui-monospace, 'Cascadia Mono', 'Segoe UI Mono', monospace",

  // Font sizes (rem for scalability)
  fontSizeXs: '0.75rem',   // 12px
  fontSizeSm: '0.875rem',  // 14px
  fontSizeBase: '1rem',    // 16px
  fontSizeLg: '1.125rem',  // 18px
  fontSizeXl: '1.25rem',   // 20px
  fontSize2xl: '1.5rem',   // 24px
  fontSize3xl: '1.875rem', // 30px
  fontSize4xl: '2.25rem',  // 36px

  // Font weights
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',

  // Line heights
  lineHeightTight: '1.25',
  lineHeightNormal: '1.5',
  lineHeightRelaxed: '1.75',

  // Letter spacing
  letterSpacingTight: '-0.01em',
  letterSpacingNormal: '0',
  letterSpacingWide: '0.025em',
  letterSpacingWider: '0.05em',
  letterSpacingWidest: '0.1em',
} as const;
