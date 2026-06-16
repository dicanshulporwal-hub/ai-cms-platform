import Link from 'next/link';
import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicButton } from '@/design-system/components/PublicButton';
import { PublicAlert } from '@/design-system/components/PublicAlert';
import type { ModuleComponentProps } from '@/types/template';

/** GrievanceSubmitModule — entry point for citizen grievance submission. */
export function GrievanceSubmitModule({ config, moduleKey }: ModuleComponentProps) {
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Grievance Redressal';

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      backgroundVariant="surface"
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div
        data-module={moduleKey}
        data-module-type="GRIEVANCE_SUBMIT"
        className="mx-auto max-w-lg rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] p-6 text-center"
      >
        <div className="mb-4 text-4xl" aria-hidden="true">📝</div>
        <h3 className="mb-2 text-base font-semibold text-[var(--public-text)]">
          Submit a Grievance
        </h3>
        <p className="mb-4 text-sm text-[var(--public-text-muted)]">
          Use this form to register a complaint or grievance with the concerned department.
          You will receive a reference number to track your submission.
        </p>
        <Link href="/grievances/submit">
          <PublicButton variant="primary">Submit Grievance</PublicButton>
        </Link>
      </div>
    </PublicSection>
  );
}

/** GrievanceTrackModule — entry point for citizen grievance tracking. */
export function GrievanceTrackModule({ config, moduleKey }: ModuleComponentProps) {
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Track Grievance';

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      backgroundVariant="default"
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div
        data-module={moduleKey}
        data-module-type="GRIEVANCE_TRACK"
        className="mx-auto max-w-lg rounded-[var(--public-radius)] border border-[var(--public-border)] bg-[var(--public-background)] p-6 text-center"
      >
        <div className="mb-4 text-4xl" aria-hidden="true">🔍</div>
        <h3 className="mb-2 text-base font-semibold text-[var(--public-text)]">
          Track Your Grievance
        </h3>
        <p className="mb-4 text-sm text-[var(--public-text-muted)]">
          Enter your reference number to check the current status of your grievance.
        </p>
        <Link href="/grievances/track">
          <PublicButton variant="outline">Track Status</PublicButton>
        </Link>
      </div>
    </PublicSection>
  );
}
