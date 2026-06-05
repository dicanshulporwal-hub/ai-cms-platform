import Link from 'next/link';
import type { ModuleComponentProps } from '@/types/template';

interface QuickLink {
  label: string;
  href: string;
  icon?: string;
  description?: string;
}

const DEFAULT_LINKS: QuickLink[] = [
  { label: 'Schemes & Services', href: '/schemes', icon: '📋', description: 'Government schemes for citizens' },
  { label: 'Tenders', href: '/tenders', icon: '📄', description: 'Active tenders and procurement' },
  { label: 'RTI / Disclosure', href: '/rti', icon: '🔍', description: 'Right to Information' },
  { label: 'Grievance', href: '/grievances', icon: '📝', description: 'Submit and track grievances' },
  { label: 'Contact Directory', href: '/contact-directory', icon: '📞', description: 'Officers and departments' },
  { label: 'Documents', href: '/documents', icon: '📁', description: 'Official documents and forms' },
];

export function QuickLinksModule({ config, theme }: ModuleComponentProps) {
  const links: QuickLink[] = (config?.links as QuickLink[]) || DEFAULT_LINKS;
  const columns = (config?.columns as number) || 3;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold mb-4" style={{ color: theme?.primaryColor }}>
        Quick Access
      </h2>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg border bg-white p-4 hover:shadow-md hover:border-blue-200 transition-all"
          >
            {link.icon && <span className="text-2xl flex-shrink-0">{link.icon}</span>}
            <div>
              <p className="font-medium text-sm">{link.label}</p>
              {link.description && <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
