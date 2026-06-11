import { ModuleRenderer } from './module-renderer';
import type { TemplateRegion } from '@/types/template';

const REGION_ELEMENT_MAP: Record<string, keyof JSX.IntrinsicElements> = {
  TOPBAR: 'section',
  HEADER: 'header',
  NAVIGATION: 'nav',
  HERO: 'section',
  CONTENT: 'main',
  SIDEBAR: 'aside',
  FOOTER: 'footer',
  CHATBOT: 'aside',
};

const REGION_CLASS_MAP: Record<string, string> = {
  TOPBAR: 'text-sm',
  HERO: 'public-hero-region',
  CONTENT: 'flex-1',
};

interface RegionRendererProps {
  region: TemplateRegion;
  theme?: Record<string, string>;
  children?: React.ReactNode;
}

export function RegionRenderer({ region, theme, children }: RegionRendererProps) {
  if (!region.isActive) return null;

  const Element = REGION_ELEMENT_MAP[region.regionType] ?? 'section';
  const regionClass = REGION_CLASS_MAP[region.regionType] ?? '';
  const sortedModules = [...region.modules].sort((a, b) => a.sortOrder - b.sortOrder);

  // Apply theme-based styles to specific regions
  const regionStyle: React.CSSProperties = {};
  if (theme) {
    if (region.regionType === 'TOPBAR') {
      regionStyle.backgroundColor = theme.secondaryColor;
      regionStyle.color = '#ffffff';
    } else if (region.regionType === 'HEADER') {
      regionStyle.backgroundColor = theme.primaryColor;
      regionStyle.color = '#ffffff';
    } else if (region.regionType === 'HERO') {
      regionStyle.backgroundColor = theme.backgroundColor;
      regionStyle.color = theme.textColor;
    } else if (region.regionType === 'NAVIGATION') {
      regionStyle.backgroundColor = theme.secondaryColor;
      regionStyle.color = '#ffffff';
    } else if (region.regionType === 'FOOTER') {
      regionStyle.backgroundColor = theme.secondaryColor;
      regionStyle.color = '#ffffff';
    }
  }

  return (
    <Element
      data-region={region.regionKey}
      className={regionClass || undefined}
      style={Object.keys(regionStyle).length > 0 ? regionStyle : undefined}
    >
      {sortedModules.map((module) => (
        <ModuleRenderer key={module.id} module={module} theme={theme} />
      ))}
      {children}
    </Element>
  );
}
