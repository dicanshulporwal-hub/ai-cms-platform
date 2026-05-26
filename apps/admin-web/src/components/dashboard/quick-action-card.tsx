import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
  variant?: 'default' | 'primary';
}

export function QuickActionCard({
  description,
  href,
  icon: Icon,
  title,
  variant = 'default',
}: QuickActionCardProps) {
  const baseClasses =
    'group flex min-h-28 flex-col justify-between rounded-lg border p-4 transition-all duration-200';

  const variantClasses = {
    default:
      'border-border bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
    primary:
      'border-primary/30 bg-primary/5 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10',
  };

  const iconClasses = {
    default: 'bg-primary text-primary-foreground',
    primary: 'bg-primary text-primary-foreground',
  };

  return (
    <Link className={[baseClasses, variantClasses[variant]].join(' ')} href={href}>
      <div className="flex items-center gap-3">
        <span
          className={[
            'inline-flex h-10 w-10 items-center justify-center rounded-lg',
            iconClasses[variant],
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
