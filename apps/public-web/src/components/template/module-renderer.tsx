import { resolveModule } from '@/lib/module-registry';
import { ModuleErrorBoundary } from '@/components/ui/error-boundary';
import type { TemplateRegionModule } from '@/types/template';

interface ModuleRendererProps {
  module: TemplateRegionModule;
}

export function ModuleRenderer({ module }: ModuleRendererProps) {
  const ModuleComponent = resolveModule(module.moduleType);

  if (!ModuleComponent) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div data-module-placeholder={module.moduleType} className="border-2 border-dashed border-amber-400 p-4 text-amber-700">
          Unknown module type: {module.moduleType}
        </div>
      );
    }
    return null;
  }

  return (
    <ModuleErrorBoundary moduleName={module.displayTitle}>
      <ModuleComponent config={module.configJson} moduleKey={module.moduleKey} />
    </ModuleErrorBoundary>
  );
}
