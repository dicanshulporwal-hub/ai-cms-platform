import type { ReactNode } from 'react';

interface PublicTopBarProps {
  /** Left slot: skip link target, screen-reader info */
  leftContent?: ReactNode;
  /** Right slot: font size controls, high contrast, language switcher, social links */
  rightContent?: ReactNode;
  className?: string;
}

/**
 * PublicTopBar — utility bar above the header.
 * Contains accessibility controls, language switcher, social links.
 * Background uses --public-secondary token.
 */
export function PublicTopBar({ leftContent, rightContent, className = '' }: PublicTopBarProps) {
  return (
    <div
      className={[
        'w-full text-xs',
        className,
      ].join(' ')}
      style={{
        backgroundColor: 'var(--public-secondary)',
        color: 'var(--public-text-inverse)',
        minHeight: 'var(--public-topbar-height)',
      }}
    >
      <div className="mx-auto flex max-w-[var(--public-container-width)] items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">{leftContent}</div>
        <div className="flex items-center gap-3">{rightContent}</div>
      </div>
    </div>
  );
}
