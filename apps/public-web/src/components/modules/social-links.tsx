import type { ModuleComponentProps } from '@/types/template';

interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

const PLATFORM_ICONS: Record<string, string> = {
  twitter: '𝕏',
  x: '𝕏',
  facebook: 'f',
  instagram: '📷',
  youtube: '▶',
  linkedin: 'in',
  koo: '🦜',
  telegram: '✈',
  whatsapp: '📱',
  rss: '📡',
};

const DEFAULT_LINKS: SocialLink[] = [
  { platform: 'twitter', url: '#', label: 'Twitter' },
  { platform: 'facebook', url: '#', label: 'Facebook' },
  { platform: 'youtube', url: '#', label: 'YouTube' },
];

/** SocialLinksModule — official social media profile links. Lazy-loaded per Green Code. */
export function SocialLinksModule({ config, moduleKey }: ModuleComponentProps) {
  const links: SocialLink[] = Array.isArray(config?.links) ? (config.links as SocialLink[]) : DEFAULT_LINKS;
  const showTitle = config?.showTitle === true;
  const displayTitle = (config?.displayTitle as string) || 'Follow Us';

  if (links.length === 0) return null;

  return (
    <div data-module={moduleKey} data-module-type="SOCIAL_LINKS" className="flex flex-wrap items-center gap-2">
      {showTitle && (
        <span className="text-xs font-semibold text-[var(--public-text-muted)] uppercase tracking-wider mr-1">
          {displayTitle}:
        </span>
      )}
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.label ?? link.platform} (opens in new tab)`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--public-border)] bg-[var(--public-background)] text-sm text-[var(--public-text-muted)] hover:border-[var(--public-primary)] hover:text-[var(--public-primary)] hover:bg-[var(--public-primary-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]"
          title={link.label ?? link.platform}
        >
          {PLATFORM_ICONS[link.platform.toLowerCase()] ?? link.platform.charAt(0).toUpperCase()}
        </a>
      ))}
    </div>
  );
}
