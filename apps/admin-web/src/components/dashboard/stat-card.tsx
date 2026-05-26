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
}

export function StatCard({ description, icon: Icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-1">{description}</CardDescription>
          ) : null}
        </div>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
