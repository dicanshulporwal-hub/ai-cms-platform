import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            'peer h-6 w-11 rounded-full bg-muted transition-colors',
            'peer-checked:bg-primary',
            'after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform',
            'peer-checked:after:translate-x-full',
            'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            className,
          )}
        />
      </label>
    );
  },
);

Switch.displayName = 'Switch';
