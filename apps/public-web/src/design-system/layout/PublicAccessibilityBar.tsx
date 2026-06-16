'use client';

import { useEffect, useState } from 'react';

/**
 * PublicAccessibilityBar — top-of-page accessibility controls.
 * Font size, high contrast, screen reader hint.
 * Lighter than the full AccessibilityToolbar widget; meant for inline topbar use.
 */
export function PublicAccessibilityBar() {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('a11y-prefs') ?? '{}');
      if (saved.fontSize) setFontSize(saved.fontSize);
      if (saved.highContrast) setHighContrast(saved.highContrast);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    document.documentElement.classList.toggle('public-high-contrast', highContrast);
    try {
      const prev = JSON.parse(localStorage.getItem('a11y-prefs') ?? '{}');
      localStorage.setItem('a11y-prefs', JSON.stringify({ ...prev, fontSize, highContrast }));
    } catch {}
  }, [fontSize, highContrast]);

  const btnClass =
    'px-2 py-0.5 rounded border border-white/30 text-white text-xs hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-focus-ring)]';

  return (
    <div className="flex items-center gap-2" role="toolbar" aria-label="Accessibility controls">
      <span className="text-white/60 text-xs hidden sm:inline">A:</span>
      <button
        className={btnClass}
        onClick={() => setFontSize((p) => Math.max(80, p - 10))}
        aria-label="Decrease text size"
        title="Decrease text size"
      >
        A-
      </button>
      <button
        className={btnClass}
        onClick={() => setFontSize(100)}
        aria-label="Reset text size"
        title="Reset text size"
      >
        A
      </button>
      <button
        className={btnClass}
        onClick={() => setFontSize((p) => Math.min(150, p + 10))}
        aria-label="Increase text size"
        title="Increase text size"
      >
        A+
      </button>
      <button
        className={[btnClass, highContrast ? 'bg-white/30' : ''].join(' ')}
        onClick={() => setHighContrast((p) => !p)}
        aria-pressed={highContrast}
        aria-label="Toggle high contrast"
        title="High contrast"
      >
        ◑
      </button>
    </div>
  );
}
