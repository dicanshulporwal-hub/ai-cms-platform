import { PublicSection } from '@/design-system/components/PublicSection';
import { PublicStatCard } from '@/design-system/components/PublicStatCard';
import { PublicGrid } from '@/design-system/components/PublicGrid';
import type { ModuleComponentProps } from '@/types/template';

interface CounterItem {
  label: string;
  value: string | number;
  suffix?: string;
  icon?: string;
  description?: string;
}

const SAMPLE_COUNTERS: CounterItem[] = [
  { label: 'Published Pages', value: '50+', icon: '📄' },
  { label: 'Public Documents', value: '120+', icon: '📁' },
  { label: 'Citizen Services', value: '24', icon: '🏛' },
];

export function StatisticsCountersModule({ config, moduleKey }: ModuleComponentProps) {
  const showTitle = config?.showTitle !== false;
  const displayTitle = (config?.displayTitle as string) || 'Key Statistics';

  const counters: CounterItem[] = Array.isArray(config?.manualCounters) && (config.manualCounters as CounterItem[]).length > 0
    ? (config.manualCounters as CounterItem[])
    : SAMPLE_COUNTERS;

  if (counters.length === 0) return null;

  const cols = Math.min(counters.length, 4) as 1 | 2 | 3 | 4;

  return (
    <PublicSection
      title={showTitle ? displayTitle : undefined}
      backgroundVariant="surface"
      spacingVariant="md"
      id={`module-${moduleKey}`}
    >
      <div data-module-type="STATISTICS_COUNTERS">
        <PublicGrid cols={cols} gap="md">
          {counters.map((counter, idx) => (
            <PublicStatCard
              key={`${counter.label}-${idx}`}
              label={counter.label}
              value={`${counter.value}${counter.suffix ?? ''}`}
              description={counter.description}
              icon={counter.icon}
            />
          ))}
        </PublicGrid>
      </div>
    </PublicSection>
  );
}
