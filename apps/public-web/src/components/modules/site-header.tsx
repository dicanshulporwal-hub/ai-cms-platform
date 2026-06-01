import Link from 'next/link';
import type { ModuleComponentProps } from '@/types/template';

export function SiteHeaderModule({ config, moduleKey }: ModuleComponentProps) {
  const siteName = (config?.siteName as string) || process.env.NEXT_PUBLIC_SITE_NAME || 'AI CMS';
  const logoUrl = config?.logoUrl as string | undefined;

  return (
    <div data-module={moduleKey} data-module-type="SITE_HEADER" className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {logoUrl && (
            <img src={logoUrl} alt={siteName} className="h-8 object-contain" />
          )}
          <span className="text-xl font-bold tracking-tight text-foreground">
            {siteName}
          </span>
        </Link>
      </div>
    </div>
  );
}
