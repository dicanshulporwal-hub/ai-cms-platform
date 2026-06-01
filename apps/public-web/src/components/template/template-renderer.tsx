import { fetchRenderData } from '@/lib/api-client';
import { RegionRenderer } from './region-renderer';
import { FallbackLayout } from './fallback-layout';

interface TemplateRendererProps {
  children: React.ReactNode;
}

const DEFAULT_THEMES: Record<string, Record<string, string>> = {
  GOVERNMENT: { primaryColor: '#1e3a5f', secondaryColor: '#2c5282', accentColor: '#63b3ed', backgroundColor: '#ffffff', textColor: '#111827', headingFont: 'system-ui', bodyFont: 'system-ui', baseFontSize: '16', borderRadius: '8', contentWidth: '1200', sectionSpacing: '48' },
  CORPORATE: { primaryColor: '#1e40af', secondaryColor: '#0f172a', accentColor: '#f59e0b', backgroundColor: '#ffffff', textColor: '#111827', headingFont: 'system-ui', bodyFont: 'system-ui', baseFontSize: '16', borderRadius: '8', contentWidth: '1200', sectionSpacing: '48' },
  BLOG: { primaryColor: '#111827', secondaryColor: '#1f2937', accentColor: '#dc2626', backgroundColor: '#ffffff', textColor: '#111827', headingFont: 'Georgia', bodyFont: 'Georgia', baseFontSize: '16', borderRadius: '8', contentWidth: '1000', sectionSpacing: '40' },
  LANDING_PAGE: { primaryColor: '#7c3aed', secondaryColor: '#0f172a', accentColor: '#a855f7', backgroundColor: '#ffffff', textColor: '#111827', headingFont: 'system-ui', bodyFont: 'system-ui', baseFontSize: '16', borderRadius: '10', contentWidth: '1100', sectionSpacing: '48' },
  CUSTOM: { primaryColor: '#065f46', secondaryColor: '#064e3b', accentColor: '#34d399', backgroundColor: '#ffffff', textColor: '#111827', headingFont: 'system-ui', bodyFont: 'system-ui', baseFontSize: '16', borderRadius: '8', contentWidth: '1200', sectionSpacing: '48' },
};

export async function TemplateRenderer({ children }: TemplateRendererProps) {
  const renderData = await fetchRenderData();

  if (!renderData || !renderData.template || !renderData.regions?.length) {
    return <FallbackLayout>{children}</FallbackLayout>;
  }

  const { template, regions } = renderData;
  const sortedRegions = [...regions].sort((a, b) => a.sortOrder - b.sortOrder);

  // Extract theme from template configJson, fall back to defaults based on template type
  const config = template.configJson as Record<string, unknown> | null;
  const savedTheme = (config?.theme as Record<string, string>) ?? {};
  const defaultTheme = DEFAULT_THEMES[template.templateType] ?? DEFAULT_THEMES.CORPORATE;
  const theme = { ...defaultTheme, ...savedTheme };

  // Include site settings in theme for modules to use
  const settings = renderData.settings;
  if (settings?.siteName) theme.siteName = settings.siteName;
  if (settings?.siteDescription) theme.siteDescription = settings.siteDescription;
  if (settings?.siteLogo) theme.siteLogo = settings.siteLogo;
  if (settings?.supportEmail) theme.supportEmail = settings.supportEmail;

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
