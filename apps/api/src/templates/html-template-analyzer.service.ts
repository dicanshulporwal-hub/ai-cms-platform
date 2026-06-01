import { Injectable } from '@nestjs/common';

export interface DetectedRegion {
  regionKey: string;
  regionName: string;
  regionType: string;
  detectedFrom: string;
  confidence: number;
}

export interface AnalysisWarning {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface AnalysisResult {
  regions: DetectedRegion[];
  warnings: AnalysisWarning[];
  hasHeader: boolean;
  hasNav: boolean;
  hasMain: boolean;
  hasFooter: boolean;
  hasViewportMeta: boolean;
  hasSkipLink: boolean;
  externalAssets: string[];
  scriptsRemoved: number;
}

@Injectable()
export class HtmlTemplateAnalyzerService {
  analyze(html: string): AnalysisResult {
    const regions: DetectedRegion[] = [];
    const warnings: AnalysisWarning[] = [];
    const externalAssets: string[] = [];

    const hasHeader = /<header[\s>]/i.test(html);
    const hasNav = /<nav[\s>]/i.test(html);
    const hasMain = /<main[\s>]/i.test(html);
    const hasFooter = /<footer[\s>]/i.test(html);
    const hasViewportMeta = /meta[^>]*viewport/i.test(html);
    const hasSkipLink = /skip[- ]?to[- ]?(main|content)/i.test(html);

    // Count scripts that will be removed
    const scriptMatches = html.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi);
    const scriptsRemoved = scriptMatches?.length ?? 0;

    // Detect external assets
    const srcMatches = html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)["']/gi);
    for (const m of srcMatches) {
      externalAssets.push(m[1]);
    }

    // Detect regions
    if (hasHeader) {
      regions.push({ regionKey: 'header', regionName: 'Header', regionType: 'HEADER', detectedFrom: '<header> tag', confidence: 0.95 });
    }
    if (hasNav) {
      regions.push({ regionKey: 'navigation', regionName: 'Navigation', regionType: 'NAVIGATION', detectedFrom: '<nav> tag', confidence: 0.9 });
    }

    // Check for hero section
    if (/class=["'][^"']*hero[^"']*["']/i.test(html) || /id=["'][^"']*hero[^"']*["']/i.test(html)) {
      regions.push({ regionKey: 'hero', regionName: 'Hero Section', regionType: 'CONTENT', detectedFrom: 'hero class/id', confidence: 0.8 });
    }

    if (hasMain) {
      regions.push({ regionKey: 'content', regionName: 'Main Content', regionType: 'CONTENT', detectedFrom: '<main> tag', confidence: 0.95 });
    } else {
      regions.push({ regionKey: 'content', regionName: 'Main Content', regionType: 'CONTENT', detectedFrom: 'body content (no <main> tag)', confidence: 0.6 });
    }

    // Check for sidebar
    if (/class=["'][^"']*sidebar[^"']*["']/i.test(html) || /id=["'][^"']*sidebar[^"']*["']/i.test(html) || /<aside[\s>]/i.test(html)) {
      regions.push({ regionKey: 'sidebar', regionName: 'Sidebar', regionType: 'SIDEBAR', detectedFrom: 'sidebar class/id or <aside> tag', confidence: 0.85 });
    }

    if (hasFooter) {
      regions.push({ regionKey: 'footer', regionName: 'Footer', regionType: 'FOOTER', detectedFrom: '<footer> tag', confidence: 0.95 });
    }

    // If no regions detected, use defaults
    if (regions.length === 0) {
      regions.push(
        { regionKey: 'header', regionName: 'Header', regionType: 'HEADER', detectedFrom: 'default', confidence: 0.5 },
        { regionKey: 'navigation', regionName: 'Navigation', regionType: 'NAVIGATION', detectedFrom: 'default', confidence: 0.5 },
        { regionKey: 'content', regionName: 'Main Content', regionType: 'CONTENT', detectedFrom: 'default', confidence: 0.5 },
        { regionKey: 'footer', regionName: 'Footer', regionType: 'FOOTER', detectedFrom: 'default', confidence: 0.5 },
      );
    }

    // Generate warnings
    if (!hasHeader) warnings.push({ code: 'NO_HEADER', message: 'No <header> element detected.', severity: 'warning' });
    if (!hasMain) warnings.push({ code: 'NO_MAIN', message: 'No <main> element detected. Body content will be used as main region.', severity: 'warning' });
    if (!hasFooter) warnings.push({ code: 'NO_FOOTER', message: 'No <footer> element detected.', severity: 'warning' });
    if (!hasViewportMeta) warnings.push({ code: 'NO_VIEWPORT', message: 'No responsive viewport meta tag found.', severity: 'warning' });
    if (!hasSkipLink) warnings.push({ code: 'NO_SKIP_LINK', message: 'No skip-to-content link found. One will be added.', severity: 'info' });
    if (scriptsRemoved > 0) warnings.push({ code: 'SCRIPTS_REMOVED', message: `${scriptsRemoved} script tag(s) removed for safety.`, severity: 'warning' });
    if (externalAssets.length > 0) warnings.push({ code: 'EXTERNAL_ASSETS', message: `${externalAssets.length} external asset(s) detected.`, severity: 'info' });

    // Check for multiple navs
    const navCount = (html.match(/<nav[\s>]/gi) || []).length;
    if (navCount > 1) warnings.push({ code: 'MULTIPLE_NAV', message: `${navCount} <nav> sections detected.`, severity: 'info' });

    return { regions, warnings, hasHeader, hasNav, hasMain, hasFooter, hasViewportMeta, hasSkipLink, externalAssets, scriptsRemoved };
  }

  sanitizeHtml(html: string): string {
    let sanitized = html;
    // Remove script tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove event handlers
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    // Remove javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    // Remove unsafe iframes
    sanitized = sanitized.replace(/<iframe\b[^>]*>/gi, '<!-- iframe removed -->');
    sanitized = sanitized.replace(/<\/iframe>/gi, '');
    // Remove object/embed
    sanitized = sanitized.replace(/<(object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
    return sanitized;
  }
}
