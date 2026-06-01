import { Injectable } from '@nestjs/common';
import type { DetectedRegion } from './html-template-analyzer.service';

export interface ConversionResult {
  convertedHtml: string;
  convertedCss: string;
  templateJson: Record<string, unknown>;
}

@Injectable()
export class HtmlToCmsConverterService {
  convert(html: string, css: string, regions: DetectedRegion[], metadata: {
    name?: string;
    sourceUrl?: string;
    licenseName?: string;
    licenseUrl?: string;
    attributionText?: string;
  }): ConversionResult {
    let convertedHtml = html;

    // Add skip-to-content link if missing
    if (!/skip[- ]?to[- ]?(main|content)/i.test(convertedHtml)) {
      convertedHtml = convertedHtml.replace(
        /<body[^>]*>/i,
        '$&\n<a href="#main-content" class="skip-link">Skip to main content</a>',
      );
    }

    // Add main id if missing
    if (/<main/i.test(convertedHtml) && !/id=["']main-content["']/i.test(convertedHtml)) {
      convertedHtml = convertedHtml.replace(/<main/i, '<main id="main-content"');
    }

    // Replace region content with placeholders
    for (const region of regions) {
      convertedHtml = this.insertRegionPlaceholder(convertedHtml, region);
    }

    // Generate slug from name
    const slug = (metadata.name || 'imported-template')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // Build template.json
    const templateJson = {
      name: metadata.name || 'Imported Template',
      slug,
      version: '1.0.0',
      type: 'CUSTOM',
      description: `Imported HTML template${metadata.sourceUrl ? ` from ${metadata.sourceUrl}` : ''}`,
      entry: 'index.html',
      thumbnail: 'preview.png',
      sourceType: 'HTML_IMPORTED',
      sourceUrl: metadata.sourceUrl || '',
      licenseName: metadata.licenseName || '',
      licenseUrl: metadata.licenseUrl || '',
      attributionText: metadata.attributionText || '',
      supports: {
        pages: true,
        blogs: true,
        documents: true,
        faqs: true,
        forms: true,
        navigation: true,
        chatbot: true,
      },
      regions: regions.map((r, i) => ({
        regionKey: r.regionKey,
        regionName: r.regionName,
        regionType: r.regionType,
        sortOrder: i,
        isRequired: ['HEADER', 'CONTENT', 'FOOTER'].includes(r.regionType),
        isActive: true,
      })),
      defaultModules: this.getDefaultModules(regions),
      complianceHints: {
        gigwReady: false,
        ux4gAligned: false,
        requiresReview: true,
      },
    };

    // Add skip-link CSS if not present
    let convertedCss = css;
    if (!convertedCss.includes('.skip-link')) {
      convertedCss += `\n\n/* Skip link for accessibility */\n.skip-link { position: absolute; top: -40px; left: 0; background: #000; color: #fff; padding: 8px 16px; z-index: 9999; transition: top 0.2s; }\n.skip-link:focus { top: 0; }\n`;
    }

    return { convertedHtml, convertedCss, templateJson };
  }

  private insertRegionPlaceholder(html: string, region: DetectedRegion): string {
    const placeholder = `<!-- CMS_REGION: ${region.regionKey} -->`;

    switch (region.regionType) {
      case 'HEADER':
        // Add data attribute to header
        return html.replace(/<header([^>]*)>/i, `<header$1 data-cms-region="${region.regionKey}">${placeholder}`);
      case 'NAVIGATION':
        return html.replace(/<nav([^>]*)>/i, `<nav$1 data-cms-region="${region.regionKey}">${placeholder}`);
      case 'FOOTER':
        return html.replace(/<footer([^>]*)>/i, `<footer$1 data-cms-region="${region.regionKey}">${placeholder}`);
      case 'CONTENT':
        if (/<main/i.test(html)) {
          return html.replace(/<main([^>]*)>/i, `<main$1 data-cms-region="${region.regionKey}">${placeholder}`);
        }
        return html;
      default:
        return html;
    }
  }

  private getDefaultModules(regions: DetectedRegion[]): Array<{ regionKey: string; moduleType: string; moduleKey: string; displayTitle: string }> {
    const modules: Array<{ regionKey: string; moduleType: string; moduleKey: string; displayTitle: string }> = [];

    for (const region of regions) {
      switch (region.regionType) {
        case 'HEADER':
          modules.push({ regionKey: region.regionKey, moduleType: 'SITE_HEADER', moduleKey: 'site-header', displayTitle: 'Site Header' });
          break;
        case 'NAVIGATION':
          modules.push({ regionKey: region.regionKey, moduleType: 'NAVIGATION', moduleKey: 'main-navigation', displayTitle: 'Main Navigation' });
          break;
        case 'CONTENT':
          modules.push({ regionKey: region.regionKey, moduleType: 'PAGE_CONTENT', moduleKey: 'page-content', displayTitle: 'Page Content' });
          break;
        case 'FOOTER':
          modules.push({ regionKey: region.regionKey, moduleType: 'FOOTER', moduleKey: 'site-footer', displayTitle: 'Site Footer' });
          break;
        case 'SIDEBAR':
          modules.push({ regionKey: region.regionKey, moduleType: 'SEARCH', moduleKey: 'search-widget', displayTitle: 'Search' });
          break;
      }
    }

    return modules;
  }
}
