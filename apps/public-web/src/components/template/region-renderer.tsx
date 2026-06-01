import { ModuleRenderer } from './module-renderer';
import type { TemplateRegion } from '@/types/template';

const REGION_ELEMENT_MAP: Record<string, keyof JSX.IntrinsicElements> = {
  HEADER: 'header',
  NAVIGATION: 'nav',
  CONTENT: 'main',
  SIDEBAR: 'aside',
  FOOTER: 'footer',
  CHATBOT: 'aside',
};

const REGION_CLASS_MAP: Record<string, string> = {
  CONTENT: 'flex-1',
};

interface RegionRendererProps {
  region: TemplateRegion;
  children?: React.ReactNode;
}

export function RegionRenderer({ region, children }: RegionRendererProps) {
  if (!region.isActive) return null;

  const Element = REGION_ELEMENT_MAP[region.regionType] ?? 'section';
  const regionClass = REGION_CLASS_MAP[region.regionType] ?? '';
  const sortedModules = [...region.modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Element data-region={region.regionKey} {...(regionClass ? { className: regionClass } : {})}>
      {sortedModules.map((module) => (
        <ModuleRenderer key={module.id} module={module} />
      ))}
      {children}
    </Element>
  );
}
