import type { ReactNode } from 'react';

interface PublicContainerProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  narrow?: boolean;
}

/** PublicContainer — responsive max-width wrapper using --public-container-width token. */
export function PublicContainer({
  children,
  className = '',
  as: Tag = 'div',
  narrow = false,
}: PublicContainerProps) {
  return (
    <Tag
      className={[
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        narrow ? 'max-w-3xl' : 'max-w-[var(--public-container-width)]',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}
