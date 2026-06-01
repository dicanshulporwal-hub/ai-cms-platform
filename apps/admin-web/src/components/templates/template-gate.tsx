'use client';

import { ReactNode } from 'react';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTemplates } from '@/hooks/use-templates';

interface TemplateGateProps {
  children: ReactNode;
}

/**
 * Blocks access to template customization pages (layout, colors, content, settings)
 * until a template has been selected via the onboarding flow.
 */
export function TemplateGate({ children }: TemplateGateProps) {
  const router = useRouter();
  const { data: templates, isLoading } = useTemplates();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeTemplate = templates?.find((t) => t.isActive);

  if (!activeTemplate) {
    return (
      <div className="flex items-center justify-center py-16">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>No Template Selected</CardTitle>
            <CardDescription>
              You need to select a website template before you can customize
              the layout, colors, content, or settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push('/templates/onboarding')}
            >
              Choose a Template
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
