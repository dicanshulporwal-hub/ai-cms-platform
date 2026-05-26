import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DashboardSectionProps {
  children: ReactNode;
  description?: string;
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function DashboardSection({
  children,
  description,
  title,
  icon: Icon,
  action,
}: DashboardSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description ? (
              <CardDescription className="mt-0.5">{description}</CardDescription>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
