import { fetchRenderData } from '@/lib/api-client';
import { RegionRenderer } from './region-renderer';
import { FallbackLayout } from './fallback-layout';

interface TemplateRendererProps {
  children: React.ReactNode;
}

export async function TemplateRenderer({ children }: TemplateRendererProps) {
  const renderData = await fetchRenderData();

  if (!renderData || !renderData.template || !renderData.regions?.length) {
    return <FallbackLayout>{children}</FallbackLayout>;
  }

  const { regions } = renderData;
  const sortedRegions = [...regions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {sortedRegions.map((region) => (
        <RegionRenderer key={region.id} region={region}>
          {region.regionType === 'CONTENT' ? children : null}
        </RegionRenderer>
      ))}
    </>
  );
}
