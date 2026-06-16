import { PublicFooter } from '@/design-system/layout/PublicFooter';
import { PublicLinkList } from '@/design-system/components/PublicLinkList';
import { PublicGrid } from '@/design-system/components/PublicGrid';
import type { ModuleComponentProps } from '@/types/template';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumnConfig {
  title: string;
  links: FooterLink[];
}

export function FooterModule({ config, moduleKey, theme }: ModuleComponentProps) {
  const siteName = theme?.siteName ?? (process.env.NEXT_PUBLIC_SITE_NAME ?? 'Government Portal');
  const logoUrl = theme?.siteLogo ?? undefined;
  const description = theme?.siteDescription ?? undefined;
  const displayMode = (config?.displayMode as string) || 'columns';

  // Build column link lists from config or defaults
  const columns: FooterColumnConfig[] = Array.isArray(config?.columns)
    ? (config.columns as FooterColumnConfig[])
    : [
        {
          title: 'About',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Vision & Mission', href: '/about/vision' },
            { label: 'Organisation Structure', href: '/about/structure' },
          ],
        },
        {
          title: 'Citizen Services',
          links: [
            { label: 'Schemes', href: '/schemes' },
            { label: 'Services', href: '/services' },
            { label: 'Tenders', href: '/tenders' },
            { label: 'Grievance', href: '/grievances' },
          ],
        },
        {
          title: 'Information',
          links: [
            { label: 'RTI Disclosure', href: '/rti' },
            { label: 'Documents', href: '/documents' },
            { label: 'Newsroom', href: '/newsroom' },
            { label: 'Contact Us', href: '/contact' },
          ],
        },
      ];

  const columnsSlot =
    displayMode !== 'minimal' ? (
      <PublicGrid cols={Math.min(columns.length, 4) as 2 | 3 | 4} gap="lg">
        {columns.map((col) => (
          <PublicLinkList
            key={col.title}
            title={col.title}
            items={col.links}
            orientation="vertical"
          />
        ))}
      </PublicGrid>
    ) : null;

  return (
    <div data-module={moduleKey} data-module-type="FOOTER">
      <PublicFooter
        siteName={siteName}
        description={description}
        logoUrl={logoUrl}
        columnsSlot={columnsSlot}
      />
    </div>
  );
}
