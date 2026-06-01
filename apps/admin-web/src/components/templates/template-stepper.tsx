'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
  href: string;
}

interface TemplateStepperProps {
  templateId: string;
  currentStep: number;
}

export function TemplateStepper({ templateId, currentStep }: TemplateStepperProps) {
  const steps: Step[] = [
    { number: 1, label: 'Template', href: '/templates/onboarding' },
    { number: 2, label: 'Layout', href: `/templates/${templateId}/layout` },
    { number: 3, label: 'Customization', href: `/templates/${templateId}/customize` },
    { number: 4, label: 'Content', href: `/templates/${templateId}/content` },
    { number: 5, label: 'Settings', href: `/templates/${templateId}/settings` },
  ];

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {steps.map((step, idx) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isDisabled = step.number > currentStep;

        return (
          <div key={step.number} className="flex items-center">
            {idx > 0 && (
              <div
                className={[
                  'h-px w-8 mx-1',
                  isCompleted ? 'bg-primary' : 'bg-border',
                ].join(' ')}
              />
            )}
            {isDisabled ? (
              <div className="flex items-center gap-2 opacity-40">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {step.number}
                </div>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {step.label}
                </span>
              </div>
            ) : (
              <Link
                href={step.href}
                className="flex items-center gap-2 group"
              >
                <div
                  className={[
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground',
                  ].join(' ')}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                </div>
                <span
                  className={[
                    'text-sm hidden sm:inline transition-colors',
                    isActive
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground group-hover:text-foreground',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
