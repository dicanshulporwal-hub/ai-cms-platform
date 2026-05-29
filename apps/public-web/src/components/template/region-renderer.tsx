import { ModuleRenderer } from './module-renderer';
import type { TemplateRegion } from '@/types/template';

const REGION_ELEMENT_MAP: Record<string, keyof JSX.IntrinsicElements> = {
  HEADER: 'header',
  NAVIGATION: 'nav',
  CONTENT: 'main',
  FOOTER: 'footer',
  CHATBOT: 'aside',
};

interface RegionRendererProps {
  region: TemplateRegion;
  children?: React.ReactNode;
}

export function RegionRenderer({ region, children }: RegionRendererProps) {
  if (!region.isActive) return null;

  const Element = REGION_ELEMENT_MAP[region.regionType] ?? 'section';
  const sortedModules = [...region.modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Element data-region={region.regionKey}>
      {sortedModules.map((module) => (
        <ModuleRenderer key={module.id} module={module} />
      ))}
      {children}
    </Element>
  );
}
