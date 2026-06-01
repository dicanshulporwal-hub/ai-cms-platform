'use client';

import { useState, useEffect } from 'react';

export function AccessibilityToolbar() {
  const [fontSize, setFontSize] = useState<number>(100);
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('a11y-prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.fontSize) setFontSize(prefs.fontSize);
        if (prefs.highContrast) setHighContrast(prefs.highContrast);
        if (prefs.darkMode) setDarkMode(prefs.darkMode);
        if (prefs.underlineLinks) setUnderlineLinks(prefs.underlineLinks);
      }
    } catch {}
  }, []);

  // Apply preferences
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.fontSize = `${fontSize}%`;

    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Dark mode
    if (darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }

    // Underline links
    if (underlineLinks) {
      root.classList.add('underline-links');
    } else {
      root.classList.remove('underline-links');
    }

    // Save preferences
    try {
      localStorage.setItem('a11y-prefs', JSON.stringify({ fontSize, highContrast, darkMode, underlineLinks }));
    } catch {}
  }, [fontSize, highContrast, darkMode, underlineLinks]);

  function increaseFontSize() {
    setFontSize((prev) => Math.min(prev + 10, 150));
  }

  function decreaseFontSize() {
    setFontSize((prev) => Math.max(prev - 10, 80));
  }

  function resetAll() {
    setFontSize(100);
    setHighContrast(false);
    setDarkMode(false);
    setUnderlineLinks(false);
  }

  return (
    <>
      {/* Accessibility Toolbar Styles */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(1.4) !important;
        }
        .dark-mode {
          filter: invert(1) hue-rotate(180deg) !important;
        }
        .dark-mode img, .dark-mode video, .dark-mode [style*="background"] {
          filter: invert(1) hue-rotate(180deg) !important;
        }
        .underline-links a {
          text-decoration: underline !important;
        }
        .a11y-toolbar-toggle {
          position: fixed;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          z-index: 9998;
          background: var(--template-primary, #1e40af);
          color: #fff;
          border: none;
          border-radius: 8px 0 0 8px;
          padding: 10px 8px;
          cursor: pointer;
          font-size: 18px;
          box-shadow: -2px 2px 8px rgba(0,0,0,0.2);
          transition: all 0.2s;
        }
        .a11y-toolbar-toggle:hover {
          background: var(--template-secondary, #1d4ed8);
          padding-right: 12px;
        }
        .a11y-toolbar-toggle:focus {
          outline: 3px solid #fbbf24;
          outline-offset: 2px;
        }
        .a11y-panel {
          position: fixed;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          z-index: 9999;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px 0 0 12px;
          box-shadow: -4px 4px 20px rgba(0,0,0,0.15);
          padding: 20px;
          width: 260px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .a11y-panel h3 {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .a11y-panel-close {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
        }
        .a11y-panel-close:hover { background: #f3f4f6; }
        .a11y-section {
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        .a11y-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .a11y-section-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .a11y-btn-group {
          display: flex;
          gap: 6px;
        }
        .a11y-btn {
          flex: 1;
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          transition: all 0.15s;
          color: #374151;
        }
        .a11y-btn:hover { background: #e5e7eb; }
        .a11y-btn:focus { outline: 2px solid var(--template-primary, #1e40af); outline-offset: 1px; }
        .a11y-btn.active { background: var(--template-primary, #1e40af); color: #fff; border-color: var(--template-primary, #1e40af); }
        .a11y-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
        }
        .a11y-toggle-label {
          font-size: 13px;
          color: #374151;
        }
        .a11y-switch {
          width: 40px;
          height: 22px;
          border-radius: 11px;
          background: #d1d5db;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
        }
        .a11y-switch.on { background: var(--template-primary, #1e40af); }
        .a11y-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s;
        }
        .a11y-switch.on::after { transform: translateX(18px); }
        .a11y-reset {
          width: 100%;
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          font-size: 12px;
          color: #6b7280;
          transition: all 0.15s;
        }
        .a11y-reset:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .a11y-font-display {
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
      `}</style>

      {/* Toggle Button */}
      {!isOpen && (
        <button
          className="a11y-toolbar-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open accessibility options"
          title="Accessibility Options"
        >
          ♿
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility Options">
          <h3>
            ♿ Accessibility
            <button className="a11y-panel-close" onClick={() => setIsOpen(false)} aria-label="Close">✕</button>
          </h3>

          {/* Font Size */}
          <div className="a11y-section">
            <div className="a11y-section-title">Text Size</div>
            <div className="a11y-btn-group">
              <button className="a11y-btn" onClick={decreaseFontSize} aria-label="Decrease font size">A-</button>
              <button className="a11y-btn" onClick={resetAll} aria-label="Reset font size">A</button>
              <button className="a11y-btn" onClick={increaseFontSize} aria-label="Increase font size">A+</button>
            </div>
            <div className="a11y-font-display">{fontSize}%</div>
          </div>

          {/* Display Options */}
          <div className="a11y-section">
            <div className="a11y-section-title">Display</div>
            <div className="a11y-toggle">
              <span className="a11y-toggle-label">High Contrast</span>
              <button
                className={`a11y-switch ${highContrast ? 'on' : ''}`}
                onClick={() => setHighContrast(!highContrast)}
                role="switch"
                aria-checked={highContrast}
                aria-label="Toggle high contrast"
              />
            </div>
            <div className="a11y-toggle">
              <span className="a11y-toggle-label">Dark Mode</span>
              <button
                className={`a11y-switch ${darkMode ? 'on' : ''}`}
                onClick={() => setDarkMode(!darkMode)}
                role="switch"
                aria-checked={darkMode}
                aria-label="Toggle dark mode"
              />
            </div>
            <div className="a11y-toggle">
              <span className="a11y-toggle-label">Underline Links</span>
              <button
                className={`a11y-switch ${underlineLinks ? 'on' : ''}`}
                onClick={() => setUnderlineLinks(!underlineLinks)}
                role="switch"
                aria-checked={underlineLinks}
                aria-label="Toggle underline links"
              />
            </div>
          </div>

          {/* Reset */}
          <div className="a11y-section">
            <button className="a11y-reset" onClick={resetAll}>
              ↺ Reset All Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
}
