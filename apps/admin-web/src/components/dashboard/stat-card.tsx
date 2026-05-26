import { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StatCardProps {
  description?: string;
  icon: LucideIcon;
  label: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatCard({
  description,
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
}: StatCardProps) {
  const trendColors = {
    down: 'text-red-600',
    neutral: 'text-muted-foreground',
    up: 'text-emerald-600',
  };

  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-1">{description}</CardDescription>
          ) : null}
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-semibold tabular-nums">
            {value.toLocaleString()}
          </p>
          {trend && trendValue ? (
            <span className={['text-xs font-medium', trendColors[trend]].join(' ')}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
