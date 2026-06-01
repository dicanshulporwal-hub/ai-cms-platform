import Link from 'next/link';
import type { ModuleComponentProps } from '@/types/template';

export function SiteHeaderModule({ config, moduleKey, theme }: ModuleComponentProps) {
  const siteName = (config?.siteName as string) || process.env.NEXT_PUBLIC_SITE_NAME || 'AI CMS';
  const logoUrl = (config?.logoUrl as string) || theme?.logoUrl;

  return (
    <div
      data-module={moduleKey}
      data-module-type="SITE_HEADER"
      style={{
        backgroundColor: theme?.primaryColor || '#1e3a5f',
        color: '#ffffff',
        padding: '14px 32px',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg">
              🏛️
            </div>
          )}
          <div>
            <span className="text-lg font-bold tracking-tight">{siteName}</span>
            <p className="text-xs opacity-75">Government Portal</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
