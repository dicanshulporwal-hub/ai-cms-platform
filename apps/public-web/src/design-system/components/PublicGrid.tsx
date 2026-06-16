import type { ReactNode } from 'react';

interface PublicGridProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

const colsClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

const gapClasses: Record<string, string> = {
  sm: 'gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
};

/** PublicGrid — responsive mobile-first grid. */
export function PublicGrid({ cols = 3, gap = 'md', className = '', children }: PublicGridProps) {
  return (
    <div className={['grid', colsClasses[cols] ?? colsClasses[3], gapClasses[gap], className].join(' ')}>
      {children}
    </div>
  );
}
