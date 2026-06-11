import type { ModuleComponentProps } from '@/types/template';

interface CounterItem {
  label: string;
  value: string | number;
  suffix?: string;
}

const SAMPLE_COUNTERS: CounterItem[] = [
  { label: 'Published pages', value: '50+' },
  { label: 'Public documents', value: '120+' },
  { label: 'Citizen services', value: '24' },
];

export function StatisticsCountersModule({ config, moduleKey, theme }: ModuleComponentProps) {
  const counters = Array.isArray(config?.manualCounters)
    ? (config.manualCounters as CounterItem[])
    : SAMPLE_COUNTERS;

  if (counters.length === 0) return null;

  return (
    <section data-module={moduleKey} data-module-type="STATISTICS_COUNTERS" className="py-8">
      {config?.showTitle !== false && (
        <h2 className="mb-5 text-center text-2xl font-semibold" style={{ color: theme?.primaryColor }}>
          {(config?.displayTitle as string | undefined) || 'Key Statistics'}
        </h2>
      )}
      <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
        {counters.map((counter, index) => (
          <div key={`${counter.label}-${index}`} className="rounded-lg border bg-white p-5 text-center shadow-sm">
            <div className="text-3xl font-bold" style={{ color: theme?.primaryColor }}>
              {counter.value}{counter.suffix || ''}
            </div>
            <p className="mt-2 text-sm text-gray-600">{counter.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
