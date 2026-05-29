/**
 * Skip-to-content link — renders as the first focusable element on the page.
 * Visually hidden until focused, then appears for keyboard users.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      Skip to main content
    </a>
  );
}
