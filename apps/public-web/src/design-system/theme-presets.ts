/**
 * Public Website Theme Presets
 * Compatible with Public Template Builder themeSettings.
 * Each preset maps to configJson.themeSettings fields.
 */

export interface ThemePreset {
  key: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
  fontFamily: string;
  borderRadius: string;
  headerStyle: string;
  navigationStyle: string;
  footerStyle: string;
  cardStyle: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: 'digital-india-blue',
    name: 'Digital India Blue',
    description: 'Official Digital India palette — navy primary with sky blue accent.',
    primaryColor: '#1a3d7c',
    secondaryColor: '#2c5282',
    accentColor: '#2b7ee0',
    backgroundColor: '#ffffff',
    textColor: '#1a1a2e',
    surfaceColor: '#f4f7fb',
    borderColor: '#d2daea',
    fontFamily: 'system-ui',
    borderRadius: '6',
    headerStyle: 'official',
    navigationStyle: 'horizontal',
    footerStyle: 'multi-column',
    cardStyle: 'bordered',
  },
  {
    key: 'government-green',
    name: 'Government Green',
    description: 'Forest green palette for environmental and agriculture departments.',
    primaryColor: '#1a5e3a',
    secondaryColor: '#145230',
    accentColor: '#2d9e5f',
    backgroundColor: '#ffffff',
    textColor: '#1a2e1a',
    surfaceColor: '#f0f7f3',
    borderColor: '#c8dfd0',
    fontFamily: 'system-ui',
    borderRadius: '6',
    headerStyle: 'official',
    navigationStyle: 'horizontal',
    footerStyle: 'multi-column',
    cardStyle: 'bordered',
  },
  {
    key: 'neutral-ministry',
    name: 'Neutral Ministry',
    description: 'Clean slate-grey for ministries and departments.',
    primaryColor: '#1e293b',
    secondaryColor: '#334155',
    accentColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    surfaceColor: '#f8fafc',
    borderColor: '#e2e8f0',
    fontFamily: 'system-ui',
    borderRadius: '4',
    headerStyle: 'official',
    navigationStyle: 'horizontal',
    footerStyle: 'multi-column',
    cardStyle: 'flat',
  },
  {
    key: 'high-contrast',
    name: 'High Contrast',
    description: 'WCAG AAA-ready high contrast for accessibility-first deployments.',
    primaryColor: '#003399',
    secondaryColor: '#001a66',
    accentColor: '#0044cc',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    surfaceColor: '#f0f0f0',
    borderColor: '#000000',
    fontFamily: 'system-ui',
    borderRadius: '4',
    headerStyle: 'official',
    navigationStyle: 'horizontal',
    footerStyle: 'minimal',
    cardStyle: 'bordered',
  },
  {
    key: 'service-portal',
    name: 'Service Portal',
    description: 'Teal-accented for citizen service portals and e-governance apps.',
    primaryColor: '#065f46',
    secondaryColor: '#047857',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#064e3b',
    surfaceColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    fontFamily: 'system-ui',
    borderRadius: '8',
    headerStyle: 'official',
    navigationStyle: 'horizontal',
    footerStyle: 'multi-column',
    cardStyle: 'elevated',
  },
  {
    key: 'news-portal',
    name: 'News & Updates Portal',
    description: 'Bold editorial style for newsrooms and press portals.',
    primaryColor: '#7f1d1d',
    secondaryColor: '#991b1b',
    accentColor: '#ef4444',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    surfaceColor: '#fef2f2',
    borderColor: '#fecaca',
    fontFamily: 'Georgia',
    borderRadius: '4',
    headerStyle: 'official',
    navigationStyle: 'horizontal',
    footerStyle: 'minimal',
    cardStyle: 'bordered',
  },
];

export function getPresetByKey(key: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.key === key);
}

export function getDefaultPreset(): ThemePreset {
  return THEME_PRESETS[0];
}
