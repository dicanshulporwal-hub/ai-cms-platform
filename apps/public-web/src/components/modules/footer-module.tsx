import type { ModuleComponentProps } from '@/types/template';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export function FooterModule({ config, moduleKey }: ModuleComponentProps) {
  const links = (config?.links as FooterLink[] | undefined) ?? [];
  const contactInfo = (config?.contactInfo as FooterContactInfo | undefined) ?? null;
  const copyright =
    (config?.copyright as string | undefined) ??
    `© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI CMS'}`;

  return (
    <footer role="contentinfo" data-module={moduleKey} data-module-type="FOOTER">
      {links.length > 0 && (
        <nav aria-label="Footer navigation">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {contactInfo && (
        <section aria-label="Contact information">
          {contactInfo.email && (
            <p>
              Email:{' '}
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </p>
          )}
          {contactInfo.phone && (
            <p>
              Phone:{' '}
              <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
            </p>
          )}
          {contactInfo.address && <p>Address: {contactInfo.address}</p>}
        </section>
      )}

      <p>{copyright}</p>
    </footer>
  );
}
