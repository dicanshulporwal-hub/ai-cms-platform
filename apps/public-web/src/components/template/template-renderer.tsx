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

  const { template, regions } = renderData;
  const sortedRegions = [...regions].sort((a, b) => a.sortOrder - b.sortOrder);

  // Extract theme from template configJson
  const config = template.configJson as Record<string, unknown> | null;
  const theme = (config?.theme as Record<string, string>) ?? {};

  // Build CSS custom properties from theme
  const themeStyles: Record<string, string> = {};
  if (theme.primaryColor) themeStyles['--template-primary'] = theme.primaryColor;
  if (theme.secondaryColor) themeStyles['--template-secondary'] = theme.secondaryColor;
  if (theme.accentColor) themeStyles['--template-accent'] = theme.accentColor;
  if (theme.backgroundColor) themeStyles['--template-bg'] = theme.backgroundColor;
  if (theme.textColor) themeStyles['--template-text'] = theme.textColor;
  if (theme.headingFont) themeStyles['--template-heading-font'] = theme.headingFont;
  if (theme.bodyFont) themeStyles['--template-body-font'] = theme.bodyFont;
  if (theme.baseFontSize) themeStyles['--template-font-size'] = theme.baseFontSize + 'px';
  if (theme.borderRadius) themeStyles['--template-radius'] = theme.borderRadius + 'px';
  if (theme.contentWidth) themeStyles['--template-content-width'] = theme.contentWidth + 'px';
  if (theme.sectionSpacing) themeStyles['--template-spacing'] = theme.sectionSpacing + 'px';

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        ...themeStyles,
        fontFamily: theme.bodyFont || undefined,
        fontSize: theme.baseFontSize ? theme.baseFontSize + 'px' : undefined,
        color: theme.textColor || undefined,
        backgroundColor: theme.backgroundColor || undefined,
      } as React.CSSProperties}
    >
      {sortedRegions.map((region) => (
        <RegionRenderer key={region.id} region={region} theme={theme}>
          {region.regionType === 'CONTENT' ? children : null}
        </RegionRenderer>
      ))}
    </div>
  );
}
