'use client';

import { useState } from 'react';
import { ArrowLeft, Check, Loader2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AdminPageShell } from '@/components/layout/admin-page-shell';
import { Button } from '@/components/ui/button';
import { useSelectTemplate, useTemplate } from '@/hooks/use-templates';
import { TEMPLATE_PREVIEWS } from '@/lib/template-previews';
import type { AuthUser } from '@/types/auth';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

function PreviewContent({ user, templateId }: { user: AuthUser; templateId: string }) {
  const router = useRouter();
  const { data: template, isLoading: templateLoading } = useTemplate(templateId);
  const selectMutation = useSelectTemplate();
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  // Resolve preview HTML from static map using template slug
  const previewHtml = template?.slug ? TEMPLATE_PREVIEWS[template.slug] ?? null : null;

  async function handleSelectAndContinue() {
    await selectMutation.mutateAsync(templateId);
    router.push(`/templates/${templateId}/layout`);
  }

  const isLoading = templateLoading;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push('/templates/onboarding')}>
            <ArrowLeft className="h-4 w-4" /> Back to Templates
          </Button>
          {template && (
            <div>
              <h1 className="text-lg font-semibold">{template.name}</h1>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport switcher */}
          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <button
              className={['rounded px-2 py-1 transition-colors', viewport === 'desktop' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'].join(' ')}
              onClick={() => setViewport('desktop')}
              type="button"
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              className={['rounded px-2 py-1 transition-colors', viewport === 'tablet' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'].join(' ')}
              onClick={() => setViewport('tablet')}
              type="button"
              title="Tablet view"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              className={['rounded px-2 py-1 transition-colors', viewport === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'].join(' ')}
              onClick={() => setViewport('mobile')}
              type="button"
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Select button */}
          <Button
            onClick={handleSelectAndContinue}
            disabled={selectMutation.isPending}
          >
            {selectMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Select This Template
          </Button>
        </div>
      </div>

      {/* Preview area */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : previewHtml ? (
        <div className="flex justify-center">
          <div
            className="rounded-lg border border-border shadow-sm overflow-hidden bg-white transition-all duration-300"
            style={{ width: VIEWPORT_WIDTHS[viewport], maxWidth: '100%' }}
          >
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <p className="text-sm">No preview available for this template.</p>
          <p className="text-xs mt-1">Select it to customize the layout manually.</p>
        </div>
      )}
    </div>
  );
}

export default function TemplatePreviewPage({ params }: { params: { id: string } }) {
  return (
    <AdminPageShell sectionTitle="Template Preview">
      {(user) => <PreviewContent user={user} templateId={params.id} />}
    </AdminPageShell>
  );
}
