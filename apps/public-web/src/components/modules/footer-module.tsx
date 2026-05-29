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
    <footer
      role="contentinfo"
      data-module={moduleKey}
      data-module-type="FOOTER"
      className="border-t border-border bg-muted/50"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Footer links */}
          {links.length > 0 && (
            <nav aria-label="Footer navigation">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Contact info */}
          {contactInfo && (
            <section aria-label="Contact information">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                Contact
              </h3>
              <div className="space-y-3">
                {contactInfo.email && (
                  <p className="text-sm text-muted-foreground">
                    <span className="block text-xs font-medium uppercase text-foreground/60">Email</span>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="transition-colors hover:text-primary"
                    >
                      {contactInfo.email}
                    </a>
                  </p>
                )}
                {contactInfo.phone && (
                  <p className="text-sm text-muted-foreground">
                    <span className="block text-xs font-medium uppercase text-foreground/60">Phone</span>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="transition-colors hover:text-primary"
                    >
                      {contactInfo.phone}
                    </a>
                  </p>
                )}
                {contactInfo.address && (
                  <p className="text-sm text-muted-foreground">
                    <span className="block text-xs font-medium uppercase text-foreground/60">Address</span>
                    {contactInfo.address}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
