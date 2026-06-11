import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'icon';

const variants: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  ghost: 'hover:bg-muted',
  outline: 'border border-border bg-card hover:bg-muted',
};

const sizes: Record<ButtonSize, string> = {
  default: 'h-10 px-4',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-9 w-9 px-0',
};

export function buttonClassName({
  className,
  size = 'default',
  variant = 'default',
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = 'default', variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={buttonClassName({ className, size, variant })}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
