import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
}

export function QuickActionCard({
  description,
  href,
  icon: Icon,
  title,
}: QuickActionCardProps) {
  return (
    <Link
      className="flex min-h-28 flex-col justify-between rounded-md border border-border p-4 transition-colors hover:bg-muted"
      href={href}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <p className="font-medium">{title}</p>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
