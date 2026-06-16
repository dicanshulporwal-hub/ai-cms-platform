/**
 * PublicSkipLink — WCAG 2.4.1 bypass block.
 * Visually hidden until focused; first focusable element on the page.
 */
export function PublicSkipLink() {
  return (
    <a
      href="#main-content"
      className={[
        'sr-only',
        'focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999]',
        'focus:rounded-[var(--public-radius)] focus:bg-[var(--public-primary)] focus:px-4 focus:py-2',
        'focus:text-sm focus:font-semibold focus:text-white',
        'focus:outline-none focus:ring-[3px] focus:ring-[var(--public-focus-ring)]',
      ].join(' ')}
    >
      Skip to main content
    </a>
  );
}
