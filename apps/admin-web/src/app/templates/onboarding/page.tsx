'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check, Eye, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSeedDummyTemplates, useSelectTemplate, useTemplates } from '@/hooks/use-templates';
import { TEMPLATE_PREVIEWS } from '@/lib/template-previews';
import { TemplateStepper } from '@/components/templates/template-stepper';
import type { Template } from '@/lib/templates-api';
import type { AuthUser } from '@/types/auth';

const TEMPLATE_TYPE_COLORS: Record<string, string> = {
  GOVERNMENT: 'bg-blue-100 text-blue-700',
  CORPORATE: 'bg-indigo-100 text-indigo-700',
  BLOG: 'bg-amber-100 text-amber-700',
  LANDING_PAGE: 'bg-purple-100 text-purple-700',
  CUSTOM: 'bg-emerald-100 text-emerald-700',
};

function OnboardingContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const { data: templates, isLoading, refetch } = useTemplates();
  const seedMutation = useSeedDummyTemplates();
  const selectMutation = useSelectTemplate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  // Check if there's already an active template (user already selected one)
  const activeTemplate = templates?.find((t) => t.isActive);

  useEffect(() => {
    if (activeTemplate) {
      setSelectedId(activeTemplate.id);
    }
  }, [activeTemplate]);

  // Auto-seed templates (idempotent - also adds missing regions to existing templates)
  useEffect(() => {
    if (!isLoading && templates && templates.length === 0 && !seeded) {
      setSeeded(true);
      seedMutation.mutateAsync().then(() => refetch());
    }
  }, [isLoading, templates, seeded]);

  async function handleSelect(id: string) {
    setSelectedId(id);
    await selectMutation.mutateAsync(id);
  }

  function handleContinue() {
    if (!selectedId) return;
    router.push(`/templates/${selectedId}/layout`);
  }

  if (user.role !== 'Super Admin' && user.role !== 'Admin') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Access restricted to administrators.
      </div>
    );
  }

  const isLoadingState = isLoading || seedMutation.isPending;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          Step 1 of 5
        </div>
        <h1 className="text-3xl font-bold">Choose Your Website Template</h1>
        <p className="mt-3 text-muted-foreground">
          Select a template that best fits your website. You can customize the layout,
          colors, and content in the next steps.
        </p>
      </div>

      {/* Stepper */}
      <TemplateStepper templateId={selectedId ?? ''} currentStep={1} />

      {/* Loading state */}
      {isLoadingState ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        </div>
      ) : (
        <>
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates?.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedId === template.id}
                onSelect={() => handleSelect(template.id)}
                onPreview={() => router.push(`/templates/onboarding/preview/${template.id}`)}
                isSelecting={selectMutation.isPending && selectMutation.variables === template.id}
              />
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center pt-4">
            <Button
              className="px-8 h-12 text-base"
              disabled={!selectedId || selectMutation.isPending}
              onClick={handleContinue}
            >
              Continue to Layout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {!selectedId && (
            <p className="text-center text-sm text-muted-foreground">
              Please select a template to continue to the next steps.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  onPreview,
  isSelecting,
}: {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  isSelecting: boolean;
}) {
  const typeColor = TEMPLATE_TYPE_COLORS[template.templateType] || 'bg-gray-100 text-gray-700';

  return (
    <Card
      className={[
        'relative cursor-pointer transition-all hover:shadow-md',
        isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:ring-1 hover:ring-border',
      ].join(' ')}
      onClick={onSelect}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Thumbnail - scaled mini preview */}
      <div className="relative h-44 rounded-t-lg overflow-hidden bg-white border-b border-border">
        {template.slug && TEMPLATE_PREVIEWS[template.slug] ? (
          <div
            className="w-[200%] origin-top-left scale-50 pointer-events-none"
            dangerouslySetInnerHTML={{ __html: TEMPLATE_PREVIEWS[template.slug] }}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
            <div className="text-4xl opacity-60">
              {template.templateType === 'GOVERNMENT' && '🏛️'}
              {template.templateType === 'CORPORATE' && '🏢'}
              {template.templateType === 'BLOG' && '📰'}
              {template.templateType === 'LANDING_PAGE' && '🚀'}
              {template.templateType === 'CUSTOM' && '🎓'}
            </div>
          </div>
        )}
        {/* Preview button overlay */}
        <button
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/50 transition-colors group"
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          type="button"
        >
          <span className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <Eye className="h-4 w-4" /> Full Preview
          </span>
        </button>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor}`}>
            {template.templateType.replace('_', ' ')}
          </span>
        </div>
        <CardDescription className="line-clamp-2 text-xs">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">v{template.version}</span>
          {isSelecting ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : isSelected ? (
            <span className="text-xs font-medium text-primary">Selected</span>
          ) : (
            <span className="text-xs text-muted-foreground">Click to select</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TemplateOnboardingPage() {
  return (
    <AdminPageShell sectionTitle="Template Selection">
      {(user) => <OnboardingContent user={user} />}
    </AdminPageShell>
  );
}
